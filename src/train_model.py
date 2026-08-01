import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from utils import CSV_DIR, MODELS_DIR
from preprocessing import preprocess_pipeline
from feature_engineering import fit_save_features

def train_core_models():
    # 1. Load dataset
    csv_path = os.path.join(CSV_DIR, 'crime_dataset.csv')
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Crime dataset not found at {csv_path}. Please run dataset generator first.")
        
    df = pd.read_csv(csv_path)
    print(f"Loaded dataset with {len(df)} records.")
    
    # 2. Fit and save features (TF-IDF and Label Encoders)
    tfidf, encoders = fit_save_features(df)
    
    # Preprocess text and transform
    X_text = df['crime_description'].apply(preprocess_pipeline)
    X = tfidf.transform(X_text)
    
    # Target columns
    targets = {
        'bns': ('predicted_bns_sections', 'bns_model.pkl'),
        'bnss': ('applicable_bnss_procedures', 'bnss_model.pkl'),
        'bsa': ('applicable_bsa_evidence', 'bsa_model.pkl')
    }
    
    for key, (col, filename) in targets.items():
        print(f"\n--- Training Model for {col} ---")
        y = encoders[col].transform(df[col].astype(str))
        
        # Train / Test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Classifier
        clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        clf.fit(X_train, y_train)
        
        # Evaluate
        y_pred = clf.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"Accuracy for {col}: {acc * 100:.2f}%")
        
        # Save model
        model_path = os.path.join(MODELS_DIR, filename)
        with open(model_path, 'wb') as f:
            pickle.dump(clf, f)
        print(f"Model saved to models/{filename}")

if __name__ == "__main__":
    train_core_models()
