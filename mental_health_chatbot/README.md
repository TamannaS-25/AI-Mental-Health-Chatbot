# AI Mental Health Chatbot

An empathetic AI chatbot that detects emotions, assesses stress levels, and suggests coping techniques.

## Architecture
- **`data/`**: Datasets (e.g., `emotions.csv`).
- **`model/`**: Trained models (`emotion_model.pkl`).
- **`utils/`**:
  - `preprocessing.py`: NLP cleaning (tokenization, lemmatization).
  - `predictor.py`: Emotion prediction logic.
  - `stress.py`: Stress assessment logic.
  - `responses.py`: Response generation and crisis detection.
- **`app.py`**: Streamlit web interface.

## Setup
1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Train Model**: `python model/train_model.py` (to be created)
3. **Run App**: `streamlit run app.py`
