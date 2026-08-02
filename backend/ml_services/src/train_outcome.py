import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from utils import CSV_DIR, MODELS_DIR
from preprocessing import preprocess_pipeline
from feature_engineering import load_features

def train_outcome_model():
    csv_path = os.path.join(CSV_DIR, 'crime_dataset.csv')
    df = pd.read_csv(csv_path)
    
    # Load feature pipeline
    tfidf, encoders = load_features()
    
    # Prepare inputs
    X_text = df['crime_description'].apply(preprocess_pipeline)
    X = tfidf.transform(X_text)
    
    # Target
    y = encoders['case_outcome'].transform(df['case_outcome'].astype(str))
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    print("\n--- Training Model for Case Outcome ---")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy for Case Outcome: {acc * 100:.2f}%")
    
    # Save
    model_path = os.path.join(MODELS_DIR, 'outcome_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(clf, f)
    print("Model saved to models/outcome_model.pkl")

if __name__ == "__main__":
    train_outcome_model()
