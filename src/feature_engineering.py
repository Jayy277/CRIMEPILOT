import os
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from utils import MODELS_DIR
from preprocessing import preprocess_pipeline

def fit_save_features(df: pd.DataFrame):
    """
    Fits and saves the TF-IDF vectorizer and Label Encoders for targets.
    """
    # 1. TF-IDF for Description
    preprocessed_desc = df['crime_description'].apply(preprocess_pipeline)
    
    tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    tfidf.fit(preprocessed_desc)
    
    tfidf_path = os.path.join(MODELS_DIR, 'tfidf.pkl')
    with open(tfidf_path, 'wb') as f:
        pickle.dump(tfidf, f)
    print("TF-IDF Vectorizer fitted and saved to models/tfidf.pkl")
    
    # 2. Label Encoders
    encoders = {}
    target_cols = [
        'crime_category',
        'predicted_bns_sections',
        'applicable_bnss_procedures',
        'applicable_bsa_evidence',
        'punishment_range',
        'case_outcome',
        'confidence_label'
    ]
    
    for col in target_cols:
        if col in df.columns:
            le = LabelEncoder()
            # Feed "Unknown" / fallback class
            classes = df[col].astype(str).tolist()
            if "Unknown" not in classes:
                classes.append("Unknown")
            le.fit(classes)
            encoders[col] = le
            
    encoders_path = os.path.join(MODELS_DIR, 'label_encoder.pkl')
    with open(encoders_path, 'wb') as f:
        pickle.dump(encoders, f)
    print("Label Encoders fitted and saved to models/label_encoder.pkl")
    
    return tfidf, encoders

def load_features():
    """
    Loads saved TF-IDF vectorizer and Label Encoders.
    """
    tfidf_path = os.path.join(MODELS_DIR, 'tfidf.pkl')
    encoders_path = os.path.join(MODELS_DIR, 'label_encoder.pkl')
    
    if not os.path.exists(tfidf_path) or not os.path.exists(encoders_path):
        raise FileNotFoundError("Feature pipeline files not found. Please train models first.")
        
    with open(tfidf_path, 'rb') as f:
        tfidf = pickle.load(f)
        
    with open(encoders_path, 'rb') as f:
        encoders = pickle.load(f)
        
    return tfidf, encoders
