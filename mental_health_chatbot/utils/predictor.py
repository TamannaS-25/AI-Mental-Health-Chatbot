import pickle
import os
import sys

# Ensure we can import preprocessing
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.preprocessing import preprocess_text

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model', 'emotion_model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model', 'tfidf_vectorizer.pkl')

model = None
vectorizer = None

def load_models():
    global model, vectorizer
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            with open(VECTORIZER_PATH, 'rb') as f:
                vectorizer = pickle.load(f)
            return True
        else:
            print("Models not found. Please train the model first.")
            return False
    except Exception as e:
        print(f"Error loading models: {e}")
        return False

# Load on import
load_models()

def predict_emotion(text):
    """
    Predicts the emotion from the input text.
    """
    if not model or not vectorizer:
        if not load_models():
            return "Error: Model not loaded"
            
    try:
        processed_text = preprocess_text(text)
        features = vectorizer.transform([processed_text]).toarray()
        prediction = model.predict(features)[0]
        return prediction
    except Exception as e:
        return f"Error: {str(e)}"
