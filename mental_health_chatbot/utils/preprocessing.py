import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
    nltk.data.find('corpora/omw-1.4')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    """
    Preprocesses text for emotion detection.
    Steps:
    1. Lowercasing
    2. Removing punctuation and non-alphabetic chars
    3. Tokenization (implicit in split or via nltk)
    4. Stopword removal
    5. Lemmatization
    """
    # 1. Lowercasing
    text = text.lower()
    
    # 2. Removing punctuation/numbers (keep only letters)
    text = re.sub(r'[^a-z\s]', '', text)
    
    # 3. Tokenization & 4. Stopword removal & 5. Lemmatization
    tokens = text.split()
    processed_tokens = [
        lemmatizer.lemmatize(word) 
        for word in tokens 
        if word not in stop_words
    ]
    
    return " ".join(processed_tokens)

if __name__ == "__main__":
    # Test
    sample = "I am scared regarding my future!"
    print(f"Original: {sample}")
    print(f"Processed: {preprocess_text(sample)}")
