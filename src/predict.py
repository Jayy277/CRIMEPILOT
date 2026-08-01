import os
import sys
import argparse
import json
import pickle
import numpy as np
from utils import MODELS_DIR, CSV_DIR
from preprocessing import preprocess_pipeline
from ocr import extract_text_from_image
from pdf_reader import extract_text_from_pdf
from retrieve_cases import retrieve_similar_judgments

def load_pkl(filename):
    path = os.path.join(MODELS_DIR, filename)
    with open(path, 'rb') as f:
        return pickle.load(f)

def extract_keywords_found(text, category):
    # Load keywords
    keywords_list = {
        "Theft & Burglary": ["steal", "robbery", "broken lock", "gold chain", "jewelry", "house break", "thief", "missing cash", "night burglary", "locker forced"],
        "Assault & Hurt": ["fight", "beating", "broken arm", "bleeding", "physical attack", "stab wound", "iron rod", "hospitalized", "scuffle", "bruises"],
        "Cyber Crime & Fraud": ["online scam", "phishing", "fake website", "unauthorized transaction", "credit card fraud", "forged signature", "cloned identity", "email hacking", "fake profile", "ransomware"],
        "Murder & Homicide": ["murder", "strangulation", "gunshot", "stabbed to death", "dead body found", "poisoning", "fatal attack", "autopsy report", "homicide", "motive"],
        "Kidnapping & Abduction": ["kidnap", "ransom call", "abducted from school", "held hostage", "missing child", "extortion demand", "forced custody", "abduction", "unidentified vehicle"]
    }
    
    found = []
    text_lower = text.lower()
    # Search all keywords
    for cat_name, kw_list in keywords_list.items():
        for kw in kw_list:
            if kw in text_lower:
                found.append(kw)
    return list(set(found))

def get_recommended_evidence(category):
    evidence_map = {
        "Theft & Burglary": ["CCTV Footage", "Fingerprints from point of entry", "Stolen goods recovery report", "Witness statement"],
        "Assault & Hurt": ["Medical Examination Report", "Weapon of offense (iron rod/wooden stick)", "Witness testimony", "CCTV Footage"],
        "Cyber Crime & Fraud": ["Digital transaction receipts", "IP logs & email headers", "Device forensic report", "Bank statement"],
        "Murder & Homicide": ["Autopsy/Post-mortem report", "DNA analysis / blood samples", "Weapon of offense (firearm/knife)", "Call Detail Records (CDR)"],
        "Kidnapping & Abduction": ["Mobile Records / Call location logs", "Ransom call audio recordings", "Witness identification parade", "CCTV of vehicles"]
    }
    return evidence_map.get(category, ["Witness statement", "Incident photos"])

def main():
    parser = argparse.ArgumentParser(description="CrimePilot Legal Case Prediction Module")
    parser.add_argument('--text', type=str, default="", help="Manual incident description")
    parser.add_argument('--pdf', type=str, default="", help="Path to complaint PDF file")
    parser.add_argument('--image', type=str, default="", help="Path to complaint image file")
    
    args = parser.parse_args()
    
    input_text = ""
    
    # 1. Extraction Layer
    if args.text:
        input_text = args.text
    elif args.pdf:
        input_text = extract_text_from_pdf(args.pdf)
    elif args.image:
        input_text = extract_text_from_image(args.image)
    else:
        print(json.dumps({"error": "No input provided. Use --text, --pdf, or --image."}))
        sys.exit(1)
        
    if not input_text.strip():
        print(json.dumps({"error": "Failed to extract text or description is empty."}))
        sys.exit(1)
        
    try:
        # 2. Load Pipeline Objects
        tfidf_path = os.path.join(MODELS_DIR, 'tfidf.pkl')
        if not os.path.exists(tfidf_path):
            # Fallback mock response if models aren't trained yet
            print(json.dumps({
                "status": "fallback",
                "extracted_text": input_text,
                "predicted_bns": "Section 303 (Theft)",
                "predicted_bnss": "Section 173 (Information in Cognizable Cases)",
                "predicted_bsa": "Section 60 (Primary Evidence)",
                "punishment": "Up to 3 years imprisonment or fine or both",
                "outcome": "Conviction",
                "duration_months": 14.5,
                "confidence_score": 0.85,
                "keywords": ["missing cash", "thief"],
                "evidence_required": ["Fingerprints", "CCTV Footage"],
                "similar_judgments": []
            }))
            sys.exit(0)
            
        tfidf = load_pkl('tfidf.pkl')
        encoders = load_pkl('label_encoder.pkl')
        bns_model = load_pkl('bns_model.pkl')
        bnss_model = load_pkl('bnss_model.pkl')
        bsa_model = load_pkl('bsa_model.pkl')
        outcome_model = load_pkl('outcome_model.pkl')
        duration_model = load_pkl('duration_model.pkl')
        
        # 3. Preprocess and Vectorize
        preprocessed = preprocess_pipeline(input_text)
        X = tfidf.transform([preprocessed])
        
        # 4. Predict Sections & Categories
        bns_pred = bns_model.predict(X)[0]
        bnss_pred = bnss_model.predict(X)[0]
        bsa_pred = bsa_model.predict(X)[0]
        outcome_pred = outcome_model.predict(X)[0]
        duration_pred = duration_model.predict(X)[0]
        
        # Category prediction (we can map from BNS section or use a simple heuristic based on keywords)
        # Let's map sections back to readable labels
        bns_label = encoders['predicted_bns_sections'].inverse_transform([bns_pred])[0]
        bnss_label = encoders['applicable_bnss_procedures'].inverse_transform([bnss_pred])[0]
        bsa_label = encoders['applicable_bsa_evidence'].inverse_transform([bsa_pred])[0]
        outcome_label = encoders['case_outcome'].inverse_transform([outcome_pred])[0]
        
        # Determine category based on BNS label
        category = "Theft & Burglary"
        if "hurt" in bns_label.lower():
            category = "Assault & Hurt"
        elif "cheat" in bns_label.lower() or "forgery" in bns_label.lower():
            category = "Cyber Crime & Fraud"
        elif "murder" in bns_label.lower() or "homicide" in bns_label.lower():
            category = "Murder & Homicide"
        elif "kidnap" in bns_label.lower():
            category = "Kidnapping & Abduction"
            
        # 5. Compute Confidence Score
        # Average probability of BNS, BNSS, and BSA model classifications
        probs = []
        if hasattr(bns_model, 'predict_proba'):
            probs.append(np.max(bns_model.predict_proba(X)))
        if hasattr(bnss_model, 'predict_proba'):
            probs.append(np.max(bnss_model.predict_proba(X)))
        if hasattr(bsa_model, 'predict_proba'):
            probs.append(np.max(bsa_model.predict_proba(X)))
            
        confidence = float(np.mean(probs)) if probs else 0.82
        
        # 6. Mappings & Keywords
        punishment_map = {
            "Theft & Burglary": "1 to 7 Years Imprisonment & Fine",
            "Assault & Hurt": "Fine up to INR 10000 or up to 7 Years Imprisonment",
            "Cyber Crime & Fraud": "2 to 5 Years Imprisonment & Fine",
            "Murder & Homicide": "Life Imprisonment or Death Penalty & Fine",
            "Kidnapping & Abduction": "7 to 10 Years Imprisonment & Fine"
        }
        punishment = punishment_map.get(category, "Variable fine and/or jail term")
        
        keywords = extract_keywords_found(input_text, category)
        evidence = get_recommended_evidence(category)
        
        # 7. Similar Judgments
        similar_cases = retrieve_similar_judgments(input_text, top_k=3)
        
        # 8. Format and print JSON
        response = {
            "status": "success",
            "extracted_text": input_text,
            "category": category,
            "predicted_bns": bns_label,
            "predicted_bnss": bnss_label,
            "predicted_bsa": bsa_label,
            "punishment": punishment,
            "outcome": outcome_label,
            "duration_months": round(float(duration_pred), 1),
            "confidence_score": round(confidence, 2),
            "keywords": keywords,
            "evidence_required": evidence,
            "similar_judgments": similar_cases
        }
        print(json.dumps(response))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Inference engine exception: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
