import streamlit as st
import time
from utils import predictor, stress, responses

# Page Config
st.set_page_config(
    page_title="AI Mental Health Companion",
    page_icon="🧠",
    layout="centered"
)

# Custom CSS for styling
st.markdown("""
<style>
    .stTextInput > div > div > input {
        background-color: #f0f2f6;
    }
    .main-header {
        font-size: 2.5rem;
        color: #4B4B4B;
        text-align: center;
        margin-bottom: 1rem;
    }
    .response-box {
        background-color: #e8f4f8;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #00a8cc;
        margin-top: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-header">🧠 AI Mental Health Companion</div>', unsafe_allow_html=True)
st.write("I am here to listen. Share what's on your mind effectively and safely. Disclaimer: I am an AI, not a doctor.")

# Input
user_input = st.text_area("How are you feeling today?", height=100, placeholder="Type here... (e.g., I feel anxious about my exam)")

if st.button("Share"):
    if user_input.strip():
        with st.spinner("Listening..."):
            time.sleep(1) # Simulate processing
            
            # 1. Crisis Detection
            is_crisis, crisis_message = responses.check_crisis(user_input)
            
            if is_crisis:
                st.error("⚠️ Crisis Detected")
                st.markdown(crisis_message)
            else:
                # 2. Emotion Detection
                emotion = predictor.predict_emotion(user_input)
                
                # Check for model error
                if emotion.startswith("Error"):
                    st.error(emotion)
                else:
                    # 3. Stress Assessment
                    stress_level = stress.assess_stress(emotion, user_input)
                    
                    # 4. Generate Response
                    response_text = responses.get_response(emotion)
                    
                    # Display Results
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.metric("Detected Emotion", emotion.capitalize())
                    
                    with col2:
                        stress_color = "normal"
                        if stress_level == "High":
                            stress_color = "off" # Red-ish
                        st.metric("Stress Level", stress_level, delta_color=stress_color)
                    
                    st.markdown(f'<div class="response-box"><b>Chatbot:</b><br>{response_text}</div>', unsafe_allow_html=True)
                    
    else:
        st.warning("Please share something with me so I can help.")

# Sidebar
st.sidebar.title("About")
st.sidebar.info(
    "This AI chatbot uses Natural Language Processing to detect emotions and provide empathetic support.\n\n"
    "**Built with:** Python, Streamlit, Scikit-learn."
)
st.sidebar.warning(
    "**Important:** This tool is for educational purposes and peer support only. It is not a substitute for professional medical advice."
)
