import pickle
import os
import sys
import re

# Ensure we can import preprocessing
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.preprocessing import preprocess_text

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model', 'emotion_model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model', 'tfidf_vectorizer.pkl')

model = None
vectorizer = None

KEYWORD_EMOTIONS = {
    "happy": ["happy", "joy", "glad", "excited", "wonderful", "amazing", "thrilled", "blessed", "cheerful", "delighted", "content", "love", "perfectly", "smiling", "optimistic"],
    "sad": ["sad", "depressed", "lonely", "hopeless", "lost", "empty", "crying", "grieve", "grieving", "failure", "despair", "worthless", "useless", "blue", "miserable", "hurt"],
    "anxious": ["anxious", "panic", "scared", "nervous", "worry", "worried", "terrified", "racing", "breathe", "tense", "jittery", "overthinking", "stress", "stressed", "dread", "dreading", "uneasy", "restless"],
    "angry": ["angry", "furious", "mad", "rage", "rageful", "bitter", "screaming", "scream", "unfair", "hate", "pissed", "irritated", "annoyed", "frustrated", "resentful", "temper"]
}

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
    First checks if any strong emotion keywords are present (heuristic backup).
    Otherwise, uses the trained machine learning model.
    """
    if not model or not vectorizer:
        if not load_models():
            return "Error: Model not loaded"
            
    try:
        text_lower = text.lower()
        matched_emotions = []
        for emotion, keywords in KEYWORD_EMOTIONS.items():
            for kw in keywords:
                pattern = r'\b' + re.escape(kw) + r'\b'
                if re.search(pattern, text_lower):
                    matched_emotions.append(emotion)
                    break
        
        # If we have exactly one clear emotion matched via keyword heuristics, prioritize it
        if len(matched_emotions) == 1:
            return matched_emotions[0]
            
        processed_text = preprocess_text(text)
        features = vectorizer.transform([processed_text]).toarray()
        prediction = model.predict(features)[0]
        return prediction
    except Exception as e:
        return f"Error: {str(e)}"
