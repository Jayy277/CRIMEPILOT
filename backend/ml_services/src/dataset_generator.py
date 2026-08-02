import os
import csv
import json
import random
from datetime import datetime, timedelta
from utils import CSV_DIR, JSON_DIR, RAW_DIR

# Define Seed for Reproducibility
random.seed(42)

# --- Category Config and Templates ---
CATEGORIES = {
    "Theft & Burglary": {
        "bns": [{"section": "303", "title": "Theft", "desc": "Theft in dwelling house, etc.", "punish": "Up to 3 years imprisonment or fine or both"},
                {"section": "305", "title": "Theft in Dwelling", "desc": "Theft inside residential building.", "punish": "Up to 7 years imprisonment and fine"},
                {"section": "331", "title": "Lurking House-trespass", "desc": "House-trespass or house-breaking by night.", "punish": "Up to 5 years imprisonment and fine"}],
        "bnss": [{"proc": "173", "title": "Information in Cognizable Cases", "stage": "Investigation"},
                 {"proc": "184", "title": "Medical Examination of Victim", "stage": "Evidence Collection"}],
        "bsa": [{"rule": "57", "title": "Admissibility of Electronic Records", "type": "Digital"},
                {"rule": "60", "title": "Primary Evidence", "type": "Documents"}],
        "keywords": ["steal", "robbery", "broken lock", "gold chain", "jewelry", "house break", "thief", "missing cash", "night burglary", "locker forced"],
        "descriptions": [
            "The complainant stated that when they returned home from vacation, they found the front lock broken and jewelry worth INR {val} stolen.",
            "A thief broke into a commercial shop at night by drilling a hole in the rear wall and stole cash amount of INR {val}.",
            "Accused was caught red-handed stealing a mobile phone and wallet from a passenger at the crowded railway station.",
            "Locked apartment was broken into during the daytime. Valuables including a laptop, silver utensils, and INR {val} cash were stolen."
        ]
    },
    "Assault & Hurt": {
        "bns": [{"section": "115", "title": "Voluntarily Causing Hurt", "desc": "Causing bodily pain, disease, or infirmity.", "punish": "Up to 1 year imprisonment or fine up to INR 10000 or both"},
                {"section": "117", "title": "Voluntarily Causing Grievous Hurt", "desc": "Grievous hurt causing permanent damage or severe pain.", "punish": "Up to 7 years imprisonment and fine"}],
        "bnss": [{"proc": "176", "title": "Inquiry by Police in Custodial Deaths/Violence", "stage": "Inquiry"},
                 {"proc": "202", "title": "Postponement of Issue of Process", "stage": "Pre-Trial"}],
        "bsa": [{"rule": "32", "title": "Relevancy of Statement of Dead Person", "type": "Witness"},
                {"rule": "45", "title": "Opinions of Experts", "type": "Medical"}],
        "keywords": ["fight", "beating", "broken arm", "bleeding", "physical attack", "stab wound", "iron rod", "hospitalized", "scuffle", "bruises"],
        "descriptions": [
            "A physical altercation broke out between neighbors over a parking space, resulting in the accused hitting the victim with an iron rod causing grievous hurt.",
            "The victim was assaulted by a group of individuals near a local market, sustaining severe head injuries and a fractured arm.",
            "Accused voluntarily caused bodily harm to a passerby after a heated argument, using a wooden stick.",
            "Complainant was attacked while returning home. The suspect slashed the victim's shoulder with a knife before fleeing."
        ]
    },
    "Cyber Crime & Fraud": {
        "bns": [{"section": "318", "title": "Cheating", "desc": "Cheating and dishonestly inducing delivery of property.", "punish": "Up to 3 years imprisonment or fine or both"},
                {"section": "319", "title": "Cheating by Personation", "desc": "Cheating by pretending to be someone else.", "punish": "Up to 5 years imprisonment or fine or both"},
                {"section": "336", "title": "Forgery", "desc": "Making a false document or electronic record.", "punish": "Up to 2 years imprisonment or fine or both"}],
        "bnss": [{"proc": "173", "title": "Electronic FIR filing", "stage": "Filing"},
                 {"proc": "105", "title": "Search and Seizure of Electronic Devices", "stage": "Investigation"}],
        "bsa": [{"rule": "63", "title": "Admissibility of Electronic Signatures", "type": "Digital"},
                {"rule": "65", "title": "Special Provisions as to Evidence Relating to Electronic Record", "type": "Digital"}],
        "keywords": ["online scam", "phishing", "fake website", "unauthorized transaction", "credit card fraud", "forged signature", "cloned identity", "email hacking", "fake profile", "ransomware"],
        "descriptions": [
            "The victim received a phishing call pretending to be a bank official, leading to an unauthorized debit of INR {val} from their bank account.",
            "Accused created a fake social media profile using the complainant's photos and extorted money from their contacts.",
            "A business owner reported that an employee forged their signature on corporate checks and embezzled INR {val}.",
            "Complainant purchased goods from an online portal which turned out to be a fraudulent setup. Loss of INR {val} reported."
        ]
    },
    "Murder & Homicide": {
        "bns": [{"section": "101", "title": "Murder", "desc": "Causing death with intention or knowledge.", "punish": "Death or imprisonment for life, and fine"},
                {"section": "103", "title": "Culpable Homicide Not Amounting to Murder", "desc": "Causing death without deliberate murder intent.", "punish": "Life imprisonment or up to 10 years imprisonment and fine"}],
        "bnss": [{"proc": "194", "title": "Inquest Reports on Accidental or Unnatural Deaths", "stage": "Inquest"},
                 {"proc": "196", "title": "Power to Summon Persons", "stage": "Investigation"}],
        "bsa": [{"rule": "26", "title": "Admission by Party to Proceeding", "type": "DNA"},
                {"rule": "32", "title": "Dying Declaration", "type": "Witness"}],
        "keywords": ["murder", "strangulation", "gunshot", "stabbed to death", "dead body found", "poisoning", "fatal attack", "autopsy report", "homicide", "motive"],
        "descriptions": [
            "A dead body with multiple stab wounds was discovered in an abandoned building. Police suspect a pre-planned murder.",
            "The accused shot the victim following a long-standing property dispute, leading to instantaneous death.",
            "Victim was poisoned by a family member to inherit ancestral property. Autopsy confirmed presence of chemical toxins.",
            "A body was found near a lake showing signs of strangulation and blunt force trauma to the head."
        ]
    },
    "Kidnapping & Abduction": {
        "bns": [{"section": "140", "title": "Kidnapping", "desc": "Kidnapping from India or from lawful guardianship.", "punish": "Up to 7 years imprisonment and fine"},
                {"section": "142", "title": "Kidnapping or Abducting in order to Murder", "desc": "Kidnapping for murder or ransom.", "punish": "Rigorous imprisonment up to 10 years and fine"}],
        "bnss": [{"proc": "173", "title": "Zero FIR registration", "stage": "Filing"},
                 {"proc": "184", "title": "Medical Examination of Kidnapped Person", "stage": "Evidence Collection"}],
        "bsa": [{"rule": "114", "title": "Presumption as to Absence of Consent", "type": "Mobile Records"},
                {"rule": "45", "title": "Expert Opinion on Handwriting", "type": "Documents"}],
        "keywords": ["kidnap", "ransom call", "abducted from school", "held hostage", "missing child", "extortion demand", "forced custody", "abduction", "unidentified vehicle"],
        "descriptions": [
            "A 10-year-old child was abducted outside their school by two individuals in a black SUV. A ransom call was received later.",
            "A businessman was kidnapped from his farmhouse by armed assailants demanding INR {val} for his release.",
            "Accused lured a young girl under false pretenses of a job offer and held her captive in a remote village.",
            "Victim was abducted from a bus stop by masked men. The family received threats demanding property papers."
        ]
    }
}

LOCATIONS = [
    {"state": "Gujarat", "district": "Ahmedabad", "city": "Ahmedabad", "ps": "Satellite Police Station"},
    {"state": "Gujarat", "district": "Ahmedabad", "city": "Ahmedabad", "ps": "Navrangpura Police Station"},
    {"state": "Gujarat", "district": "Surat", "city": "Surat", "ps": "Varachha Police Station"},
    {"state": "Gujarat", "district": "Vadodara", "city": "Vadodara", "ps": "Sayajigunj Police Station"},
    {"state": "Gujarat", "district": "Gandhinagar", "city": "Gandhinagar", "ps": "Sector 7 Police Station"},
    {"state": "Gujarat", "district": "Rajkot", "city": "Rajkot", "ps": "Pradyuman Nagar Police Station"},
    {"state": "Gujarat", "district": "Bhavnagar", "city": "Bhavnagar", "ps": "Nilambaug Police Station"},
    {"state": "Gujarat", "district": "Jamnagar", "city": "Jamnagar", "ps": "City A Division Police Station"}
]

COURTS = ["District and Sessions Court", "High Court", "Metropolitan Magistrate Court", "Chief Judicial Magistrate Court"]
JUDGES = ["Justice Anand Verma", "Judge Shalini Joshi", "Judge Rajesh K. Mehta", "Justice H.S. Sangwan", "Judge M. Durai"]
WEAPONS = ["None", "Iron Rod", "Wooden Stick", "Kitchen Knife", "Firearm / Pistol", "Chemical Poison", "Country-made Gun"]
INTENTS = ["Financial Gain", "Personal Vendetta", "Accidental / Negligence", "Spontaneous Argument", "Property Dispute", "Jealousy / Crime of Passion"]
INJURY_LEVELS = ["None", "Minor (Scratches/Bruises)", "Moderate (Stitch/Sprain)", "Severe (Fracture/Deep Cuts)", "Fatal (Death)"]
OUTCOMES = ["Conviction", "Acquittal", "Settled / Compromised", "Dismissed for Lack of Evidence", "Referred to Mediation"]
CONFIDENCES = ["High", "Medium", "Low"]

def generate_datasets():
    print("Generating synthetic datasets...")
    
    # 1. Generate JSON Reference Files
    bns_json = []
    bnss_json = []
    bsa_json = []
    
    for category, content in CATEGORIES.items():
        for b in content["bns"]:
            bns_json.append({
                "section_number": b["section"],
                "title": b["title"],
                "description": b["desc"],
                "punishment": b["punish"],
                "keywords": content["keywords"]
            })
        for bn in content["bnss"]:
            bnss_json.append({
                "procedure_number": bn["proc"],
                "title": bn["title"],
                "description": f"Standard procedural guidelines for handling cases during {bn['stage']}.",
                "stage": bn["stage"]
            })
        for bs in content["bsa"]:
            bsa_json.append({
                "evidence_rule": bs["rule"],
                "title": bs["title"],
                "description": f"Evidence rules governing {bs['type']} proof admissability in court.",
                "evidence_type": bs["type"]
            })
            
    with open(os.path.join(JSON_DIR, 'bns_sections.json'), 'w') as f:
        json.dump(bns_json, f, indent=2)
    with open(os.path.join(JSON_DIR, 'bnss_procedures.json'), 'w') as f:
        json.dump(bnss_json, f, indent=2)
    with open(os.path.join(JSON_DIR, 'bsa_evidence.json'), 'w') as f:
        json.dump(bsa_json, f, indent=2)

    # 2. Punishment and Evidence Mappings
    punishments = {
        "Theft & Burglary": "1 to 7 Years Imprisonment & Fine",
        "Assault & Hurt": "Fine up to INR 10000 or up to 7 Years Imprisonment",
        "Cyber Crime & Fraud": "2 to 5 Years Imprisonment & Fine",
        "Murder & Homicide": "Life Imprisonment or Death Penalty & Fine",
        "Kidnapping & Abduction": "7 to 10 Years Imprisonment & Fine"
    }
    with open(os.path.join(JSON_DIR, 'punishment.json'), 'w') as f:
        json.dump(punishments, f, indent=2)
        
    # Write CSV for punishment
    with open(os.path.join(CSV_DIR, 'punishment_dataset.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["crime_category", "punishment_range"])
        for k, v in punishments.items():
            writer.writerow([k, v])
            
    # Write CSV for evidence mapping
    evidence_types = ["DNA", "Fingerprint", "Witness", "Medical", "Digital", "CCTV", "Documents", "Audio", "Video", "Mobile Records"]
    with open(os.path.join(CSV_DIR, 'evidence_dataset.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["evidence_type", "applicability_desc"])
        for e in evidence_types:
            writer.writerow([e, f"Standard procedures for collecting, hashing, and presenting {e} evidence in court according to BSA."])
            
    # Write CSV for keywords
    with open(os.path.join(CSV_DIR, 'keywords_dataset.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["crime_category", "keywords"])
        for cat, content in CATEGORIES.items():
            writer.writerow([cat, ", ".join(content["keywords"])])

    # 3. Generate Case Prediction Dataset (5000+ rows)
    crime_dataset = []
    print("Generating crime_dataset.csv (5000+ rows)...")
    for i in range(1, 5050):
        case_id = f"CP-CASE-{100000 + i}"
        cat = random.choice(list(CATEGORIES.keys()))
        cat_data = CATEGORIES[cat]
        val = random.randint(1000, 2000000)
        desc_tmpl = random.choice(cat_data["descriptions"])
        desc = desc_tmpl.format(val=val)
        
        loc = random.choice(LOCATIONS)
        victim_count = random.randint(1, 3) if cat != "Murder & Homicide" else random.randint(1, 2)
        accused_count = random.randint(1, 4)
        weapon = random.choice(WEAPONS) if cat != "Theft & Burglary" and cat != "Cyber Crime & Fraud" else "None"
        intent = random.choice(INTENTS)
        prop_val = val if cat in ["Theft & Burglary", "Cyber Crime & Fraud", "Kidnapping & Abduction"] else 0
        injury = random.choice(INJURY_LEVELS) if cat == "Assault & Hurt" else ("Fatal (Death)" if cat == "Murder & Homicide" else "None")
        
        keywords = random.sample(cat_data["keywords"], random.randint(3, 5))
        
        bns_sec = random.choice(cat_data["bns"])
        bnss_proc = random.choice(cat_data["bnss"])
        bsa_ev = random.choice(cat_data["bsa"])
        
        duration = random.randint(6, 48)
        outcome = random.choice(OUTCOMES)
        confidence = random.choice(CONFIDENCES)
        
        crime_dataset.append({
            "case_id": case_id,
            "crime_description": desc,
            "crime_category": cat,
            "location_type": random.choice(["Residential", "Commercial", "Public Space", "Digital / Online", "Rural Area"]),
            "victim_count": victim_count,
            "accused_count": accused_count,
            "weapon_used": weapon,
            "intent": intent,
            "property_value": prop_val,
            "injury_level": injury,
            "keywords": ", ".join(keywords),
            "predicted_bns_sections": f"Section {bns_sec['section']} ({bns_sec['title']})",
            "applicable_bnss_procedures": f"Section {bnss_proc['proc']} ({bnss_proc['title']})",
            "applicable_bsa_evidence": f"Section {bsa_ev['rule']} ({bsa_ev['title']})",
            "punishment_range": punishments[cat],
            "case_outcome": outcome,
            "case_duration_months": duration,
            "confidence_label": confidence
        })
        
    with open(os.path.join(CSV_DIR, 'crime_dataset.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=crime_dataset[0].keys())
        writer.writeheader()
        writer.writerows(crime_dataset)

    # 4. Generate FIR Dataset (2000+ rows)
    fir_dataset = []
    print("Generating fir_dataset.csv (2000+ rows)...")
    for i in range(1, 2050):
        linked_case = crime_dataset[i-1]
        fir_num = f"FIR-{2026}-{100000 + i}"
        loc = random.choice(LOCATIONS)
        date = (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
        
        fir_dataset.append({
            "fir_number": fir_num,
            "police_station": loc["ps"],
            "district": loc["district"],
            "state": loc["state"],
            "date": date,
            "complaint": f"Complaint registered by victim regarding {linked_case['crime_category'].lower()}. Details: {linked_case['crime_description']}",
            "incident_description": linked_case["crime_description"],
            "witness_information": f"Witness statement recorded for {random.choice(['Ramesh Kumar', 'Sunita Devi', 'Amit Shah', 'Pooja Patel'])}.",
            "officer_notes": f"Investigation initiated under {linked_case['applicable_bnss_procedures']}. Primary evidence: {linked_case['applicable_bsa_evidence']}.",
            "linked_case_id": linked_case["case_id"]
        })
        
        # Save a synthetic text file in raw/fir/
        raw_fir_file = os.path.join(RAW_DIR, 'fir', f"{fir_num}.txt")
        with open(raw_fir_file, 'w', encoding='utf-8') as rf:
            rf.write(f"POLICE RECORD OF FIR\nFIR NO: {fir_num}\nPS: {loc['ps']}\nDate: {date}\n\nIncident: {linked_case['crime_description']}")
            
        # Save raw complaints in raw/complaints/
        raw_compl_file = os.path.join(RAW_DIR, 'complaints', f"COMP-{100000+i}.txt")
        with open(raw_compl_file, 'w', encoding='utf-8') as rc:
            rc.write(f"COMPLAINT WRITTEN REPORT\nTo Station House Officer,\n\nSir,\nI want to report an incident: {linked_case['crime_description']}")
            
    with open(os.path.join(CSV_DIR, 'fir_dataset.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fir_dataset[0].keys())
        writer.writeheader()
        writer.writerows(fir_dataset)

    # 5. Generate Judgments Dataset (2000+ rows)
    judgments_dataset = []
    judgments_json = []
    print("Generating judgments_dataset.csv & judgments.json (2000+ rows)...")
    
    for i in range(1, 2050):
        linked_case = crime_dataset[i-1]
        court = random.choice(COURTS)
        judge = random.choice(JUDGES)
        
        facts = f"On examination of witnesses and documents, it is observed that {linked_case['crime_description'].lower()}"
        issues = f"Whether the accused is guilty under {linked_case['predicted_bns_sections']} and whether procedures in {linked_case['applicable_bnss_procedures']} were fully complied with."
        evidence_sum = f"The prosecution submitted {linked_case['applicable_bsa_evidence']}. Police officer notes confirm details."
        decision = f"The Court finds the accused guilty of {linked_case['crime_category']} and is sentenced accordingly." if linked_case["case_outcome"] == "Conviction" else f"The accused is acquitted due to lack of standard corroborative evidence."
        sentence = linked_case["punishment_range"] if linked_case["case_outcome"] == "Conviction" else "None / Acquitted"
        summary = f"In {court}, {judge} passed a judgment regarding the {linked_case['crime_category']} case. Verdict: {linked_case['case_outcome']}. Duration: {linked_case['case_duration_months']} months."
        
        judgments_dataset.append({
            "case_id": linked_case["case_id"],
            "court": court,
            "judge": judge,
            "facts": facts,
            "issues": issues,
            "evidence_summary": evidence_sum,
            "decision": decision,
            "sentence": sentence,
            "bns_sections": linked_case["predicted_bns_sections"],
            "bnss_procedures": linked_case["applicable_bnss_procedures"],
            "bsa_provisions": linked_case["applicable_bsa_evidence"],
            "judgment_summary": summary
        })
        
        judgments_json.append({
            "case_id": linked_case["case_id"],
            "court": court,
            "judge": judge,
            "facts": facts,
            "decision": decision,
            "sentence": sentence,
            "summary": summary
        })
        
        # Save a raw text judgment in raw/judgments/
        raw_judg_file = os.path.join(RAW_DIR, 'judgments', f"JUDG-{linked_case['case_id']}.txt")
        with open(raw_judg_file, 'w', encoding='utf-8') as rj:
            rj.write(f"COURT JUDGMENT RECORD\nIN THE COURT OF: {court}\nPRESIDING JUDGE: {judge}\nCASE: {linked_case['case_id']}\n\nFacts:\n{facts}\n\nDecision:\n{decision}")
            
    with open(os.path.join(CSV_DIR, 'judgments_dataset.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=judgments_dataset[0].keys())
        writer.writeheader()
        writer.writerows(judgments_dataset)
        
    with open(os.path.join(JSON_DIR, 'judgments.json'), 'w') as f:
        json.dump(judgments_json, f, indent=2)

    print("Generation complete! All files saved successfully.")

if __name__ == "__main__":
    generate_datasets()
