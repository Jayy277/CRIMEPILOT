import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from utils import CSV_DIR, MODELS_DIR
from preprocessing import preprocess_pipeline
from feature_engineering import load_features

def train_duration_model():
    csv_path = os.path.join(CSV_DIR, 'crime_dataset.csv')
    df = pd.read_csv(csv_path)
    
    # Load features
    tfidf, _ = load_features()
    
    # Prepare inputs
    X_text = df['crime_description'].apply(preprocess_pipeline)
    X = tfidf.transform(X_text)
    
    # Target (duration in months)
    y = df['case_duration_months'].astype(float)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    print("\n--- Training Model for Case Duration (Months) ---")
    reg = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    reg.fit(X_train, y_train)
    
    # Evaluate
    y_pred = reg.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Mean Absolute Error for Case Duration: {mae:.2f} months")
    
    # Save
    model_path = os.path.join(MODELS_DIR, 'duration_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(reg, f)
    print("Model saved to models/duration_model.pkl")

if __name__ == "__main__":
    train_duration_model()
