import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.preprocessing import preprocess_text

def train_model():
    # Define paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_PATH = os.path.join(BASE_DIR, 'data', 'emotions.csv')
    MODEL_DIR = os.path.join(BASE_DIR, 'model')
    
    # 1. Load Data
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # 2. Preprocess
    print("Preprocessing text...")
    df['clean_text'] = df['text'].apply(preprocess_text)
    print("Sample processed text:", df['clean_text'].head())
    
    # 3. TF-IDF Feature Extraction
    print("Vectorizing...")
    tfidf = TfidfVectorizer(max_features=1000)
    X = tfidf.fit_transform(df['clean_text']).toarray()
    y = df['emotion']
    
    # 4. Split Data
    # Stratify to ensure all classes are in train/test if possible
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 5. Train Model (Logistic Regression)
    print("Training model (Logistic Regression)...")
    from sklearn.linear_model import LogisticRegression
    model = LogisticRegression(class_weight='balanced', random_state=42)
    model.fit(X_train, y_train)
    
    # 6. Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {accuracy:.2f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Test on a sample
    sample_text = "I feel very sad and hopeless"
    sample_vec = tfidf.transform([preprocess_text(sample_text)]).toarray()
    print(f"Test prediction for '{sample_text}': {model.predict(sample_vec)[0]}")
    
    # 7. Save Model & Vectorizer
    print("Saving model artifacts...")
    with open(os.path.join(MODEL_DIR, 'emotion_model.pkl'), 'wb') as f:
        pickle.dump(model, f)
        
    with open(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'), 'wb') as f:
        pickle.dump(tfidf, f)
        
    print("Done!")

if __name__ == "__main__":
    train_model()
