import streamlit as st
import time
import pandas as pd
from utils import predictor, stress, responses

# Page Config
st.set_page_config(
    page_title="AI Mental Health Companion",
    page_icon="🧠",
    layout="centered"
)

# Custom CSS for soothing design
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    
    html, body, [data-testid="stAppViewContainer"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Soothing background */
    [data-testid="stAppViewContainer"] {
        background: linear-gradient(180deg, #f7f9fa 0%, #eef2f5 100%);
    }
    
    /* Title and header */
    .main-header {
        font-size: 2.6rem;
        font-weight: 800;
        background: linear-gradient(135deg, #16a085 0%, #2980b9 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 0.2rem;
    }
    
    .main-subheader {
        font-size: 1rem;
        color: #7f8c8d;
        text-align: center;
        margin-bottom: 1.8rem;
    }
    
    /* Coping technique card styling */
    .tip-card {
        background-color: rgba(22, 160, 133, 0.07);
        border-left: 5px solid #1abc9c;
        border-radius: 8px;
        padding: 18px;
        margin-top: 15px;
        margin-bottom: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    
    .tip-title {
        font-weight: 700;
        color: #16a085;
        font-size: 0.95rem;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .tip-content {
        font-size: 0.92rem;
        color: #34495e;
        line-height: 1.4;
    }

    /* Sidebar info boxes */
    .sidebar-card {
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(0,0,0,0.05);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 15px;
    }
    
    .sidebar-card-title {
        font-weight: 700;
        font-size: 0.9rem;
        color: #2c3e50;
        margin-bottom: 8px;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Session State
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "Hello! I am your AI Mental Health Companion. I'm here to listen to whatever is on your mind in a safe, non-judgmental space. How are you feeling today?",
            "emotion": "neutral",
            "stress": "Low",
            "tip": None,
            "crisis": False
        }
    ]

# Sidebar Analytics & Support Resources
st.sidebar.markdown("<h2 style='text-align: center; color: #16a085; font-size: 1.5rem; margin-top: 0;'>🧠 Companion Workspace</h2>", unsafe_allow_html=True)

# 1. Conversation Insights
st.sidebar.markdown("### 📊 Conversation Insights")

assistant_messages = [m for m in st.session_state.messages if m["role"] == "assistant" and "emotion" in m]
total_turns = len(assistant_messages) - 1 # Exclude initial welcome turn

if total_turns > 0:
    # Aggregate emotions
    emotion_counts = {"happy": 0, "sad": 0, "anxious": 0, "angry": 0, "neutral": 0}
    for m in assistant_messages[1:]: # Skip the initial message
        emo = m.get("emotion", "neutral")
        if emo in emotion_counts:
            emotion_counts[emo] += 1
            
    st.sidebar.write("**Mood Distribution**")
    
    # Render custom progress bars for emotions
    emojis = {"happy": "😊 Happy", "sad": "😢 Sad", "anxious": "😰 Anxious", "angry": "😠 Angry", "neutral": "😐 Neutral"}
    colors = {"happy": "#a3e4d7", "sad": "#aed6f1", "anxious": "#fad7a0", "angry": "#f1948a", "neutral": "#d5dbdb"}
    
    for emotion, count in emotion_counts.items():
        percent = count / total_turns
        st.sidebar.markdown(f"<div style='display: flex; justify-content: space-between; font-size: 0.85rem;'><span>{emojis[emotion]}</span><span>{count} ({percent:.0%})</span></div>", unsafe_allow_html=True)
        st.sidebar.markdown(f"""
        <div style='background-color: #eaeded; width: 100%; height: 6px; border-radius: 3px; margin-bottom: 8px;'>
            <div style='background-color: {colors[emotion]}; width: {percent*100}%; height: 6px; border-radius: 3px;'></div>
        </div>
        """, unsafe_allow_html=True)
        
    # Render Stress Level Trend
    st.sidebar.write("**Stress Level Trend**")
    stress_mapping = {"Low": 1, "Medium": 2, "High": 3}
    stress_history = [stress_mapping.get(m.get("stress", "Low"), 1) for m in assistant_messages[1:]]
    
    if len(stress_history) > 0:
        chart_data = pd.DataFrame(stress_history, columns=["Stress Level (1=Low, 3=High)"])
        st.sidebar.line_chart(chart_data, height=120)
        
        # Display latest status
        latest_stress = assistant_messages[-1].get("stress", "Low")
        latest_emotion = assistant_messages[-1].get("emotion", "neutral").capitalize()
        st.sidebar.markdown(f"""
        <div class="sidebar-card">
            <div style="font-size: 0.82rem; color: #7f8c8d;">CURRENT STATE</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: #2c3e50;">{latest_emotion} mood</div>
            <div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 4px;">Stress: <b>{latest_stress}</b></div>
        </div>
        """, unsafe_allow_html=True)
else:
    st.sidebar.info("As we chat, insights about your mood and stress patterns will appear here in real-time.")

# 2. Crisis Helplines
st.sidebar.markdown("### 📞 Crisis Support Services")
st.sidebar.markdown("""
<div class="sidebar-card" style="border-left: 3px solid #e74c3c;">
    <div class="sidebar-card-title" style="color: #c0392b;">Need Urgent Help?</div>
    <div style="font-size: 0.82rem; line-height: 1.4; color: #34495e;">
        If you or someone you know is in distress or danger:<br>
        • <b>USA</b>: Call or text <b>988</b> (24/7 Lifeline)<br>
        • <b>Crisis Text Line</b>: Text HOME to 741741<br>
        • <b>International</b>: Visit <a href="https://www.befrienders.org" target="_blank">befrienders.org</a>
    </div>
</div>
""", unsafe_allow_html=True)

# 3. About Section
st.sidebar.markdown("### ℹ️ About")
st.sidebar.markdown("""
<div style="font-size: 0.8rem; color: #7f8c8d; line-height: 1.4;">
    This companion uses Natural Language Processing to support emotional well-being. Your data remains private in this session.<br><br>
    <b>Disclaimer:</b> I am an AI peer assistant, not a doctor or therapist. For clinical assistance, please seek professional support.
</div>
""", unsafe_allow_html=True)

# Main Panel layout
st.markdown('<div class="main-header">🧠 AI Mental Health Companion</div>', unsafe_allow_html=True)
st.markdown('<div class="main-subheader">A safe, quiet, and private space to share what\'s on your mind.</div>', unsafe_allow_html=True)

# Setup Tabs
tab_chat, tab_breathing = st.tabs(["💬 Chat Companion", "🧘 Guided Breathing Guide"])

# TAB 1: Chat Companion
with tab_chat:
    # Display message history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            
            # If there is a coping technique stored with this assistant reply, display it beautifully
            if msg["role"] == "assistant" and msg.get("tip"):
                st.markdown(f"""
                <div class="tip-card">
                    <div class="tip-title">💡 Coping Tip</div>
                    <div class="tip-content">{msg['tip']}</div>
                </div>
                """, unsafe_allow_html=True)

    # Chat Input
    if user_query := st.chat_input("How are you feeling right now?"):
        # Display user message
        with st.chat_message("user"):
            st.markdown(user_query)
            
        # Append user message to history
        st.session_state.messages.append({"role": "user", "content": user_query})
        
        # Chatbot processing
        with st.chat_message("assistant"):
            with st.spinner("Listening..."):
                time.sleep(0.8) # Smooth conversational feel
                
                # 1. Crisis Detection
                is_crisis, crisis_message = responses.check_crisis(user_query)
                
                if is_crisis:
                    response_content = crisis_message
                    emotion = "sad"
                    stress_level = "High"
                    tip = None
                    
                    st.error("⚠️ Crisis Support Alert")
                    st.markdown(response_content)
                else:
                    # 2. Emotion Detection
                    emotion = predictor.predict_emotion(user_query)
                    
                    if emotion.startswith("Error"):
                        response_content = "I'm having a little trouble parsing my models, but I am still here to listen to you. What is on your mind?"
                        stress_level = "Low"
                        tip = None
                        st.markdown(response_content)
                    else:
                        # 3. Stress Assessment
                        stress_level = stress.assess_stress(emotion, user_query)
                        
                        # 4. Generate response and tip
                        response_content, tip = responses.get_response(emotion)
                        
                        # Display emotion tag details
                        col1, col2 = st.columns(2)
                        with col1:
                            st.markdown(f"**Detected Emotion:** `{emotion.capitalize()}`")
                        with col2:
                            st.markdown(f"**Stress Level:** `{stress_level}`")
                            
                        st.markdown(response_content)
                        
                        # Display the coping tip
                        if tip:
                            st.markdown(f"""
                            <div class="tip-card">
                                <div class="tip-title">💡 Coping Tip</div>
                                <div class="tip-content">{tip}</div>
                            </div>
                            """, unsafe_allow_html=True)
                            
                # Save assistant message to state
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": response_content,
                    "emotion": emotion,
                    "stress": stress_level,
                    "tip": tip,
                    "crisis": is_crisis
                })
                
                # Rerun to update sidebar insights immediately
                st.rerun()

# TAB 2: Guided Breathing Guide
with tab_breathing:
    st.markdown("### 🧘 4-7-8 Breathing Exercise")
    st.markdown("""
    The **4-7-8 breathing technique**, also known as "relaxing breath," is a natural tranquilizer for the nervous system. 
    Use this animated bubble to guide your breathing rhythm:
    
    1. **Breathe in** quietly through your nose for **4 seconds**.
    2. **Hold** your breath for **7 seconds**.
    3. **Exhale** completely through your mouth, making a whoosh sound, for **8 seconds**.
    """)
    
    # Animated breathing bubble HTML
    breathing_html = """
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&display=swap');
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        margin: 0;
        padding: 0;
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 380px;
        overflow: hidden;
      }
      .container {
        text-align: center;
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 30px;
        width: 320px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
        color: #2c3e50;
      }
      .circle-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        position: relative;
        margin-bottom: 20px;
      }
      .outer-circle {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        border: 2px dashed rgba(22, 160, 133, 0.2);
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .breathing-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(162, 217, 206, 0.9) 0%, rgba(115, 198, 182, 0.5) 100%);
        box-shadow: 0 0 25px rgba(115, 198, 182, 0.6);
        transition: all 4s ease-in-out;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: scale(1);
      }
      .instruction-text {
        font-size: 19px;
        font-weight: 700;
        margin-top: 10px;
        min-height: 28px;
        color: #16a085;
      }
      .sub-text {
        font-size: 13px;
        opacity: 0.8;
        margin-top: 5px;
        min-height: 20px;
        color: #34495e;
      }
      .timer-num {
        font-size: 18px;
        font-weight: 700;
        color: #2c3e50;
      }
    </style>
    </head>
    <body>
    <div class="container">
      <div class="circle-container">
        <div class="outer-circle"></div>
        <div class="breathing-circle" id="circle">
          <span class="timer-num" id="timer">4</span>
        </div>
      </div>
      <div class="instruction-text" id="instruction">Inhale</div>
      <div class="sub-text" id="subtext">Breathe in slowly through your nose</div>
    </div>

    <script>
      const circle = document.getElementById('circle');
      const instruction = document.getElementById('instruction');
      const subtext = document.getElementById('subtext');
      const timer = document.getElementById('timer');

      const INHALE_TIME = 4;
      const HOLD_TIME = 7;
      const EXHALE_TIME = 8;

      function runBreathingCycle() {
        // Phase 1: Inhale (4s)
        instruction.innerText = "Inhale";
        subtext.innerText = "Breathe in slowly through your nose";
        circle.style.transition = "all 4000ms ease-in-out";
        circle.style.transform = "scale(1.8)";
        circle.style.background = "radial-gradient(circle, rgba(162, 217, 206, 0.95) 0%, rgba(72, 201, 176, 0.6) 100%)";
        circle.style.boxShadow = "0 0 40px rgba(72, 201, 176, 0.8)";
        
        let countdown = INHALE_TIME;
        timer.innerText = countdown;
        let inhaleInterval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            timer.innerText = countdown;
          } else {
            clearInterval(inhaleInterval);
          }
        }, 1000);

        setTimeout(() => {
          // Phase 2: Hold (7s)
          instruction.innerText = "Hold";
          subtext.innerText = "Keep the air in your lungs";
          circle.style.transition = "all 7000ms linear";
          circle.style.transform = "scale(1.8)"; // Keep expanded
          circle.style.boxShadow = "0 0 50px rgba(244, 208, 63, 0.7)";
          
          let holdCountdown = HOLD_TIME;
          timer.innerText = holdCountdown;
          let holdInterval = setInterval(() => {
            holdCountdown--;
            if (holdCountdown > 0) {
              timer.innerText = holdCountdown;
            } else {
              clearInterval(holdInterval);
            }
          }, 1000);

          setTimeout(() => {
            // Phase 3: Exhale (8s)
            instruction.innerText = "Exhale";
            subtext.innerText = "Release slowly through your mouth";
            circle.style.transition = "all 8000ms ease-in-out";
            circle.style.transform = "scale(1.0)";
            circle.style.background = "radial-gradient(circle, rgba(162, 217, 206, 0.8) 0%, rgba(115, 198, 182, 0.4) 100%)";
            circle.style.boxShadow = "0 0 25px rgba(115, 198, 182, 0.6)";
            
            let exhaleCountdown = EXHALE_TIME;
            timer.innerText = exhaleCountdown;
            let exhaleInterval = setInterval(() => {
              exhaleCountdown--;
              if (exhaleCountdown > 0) {
                timer.innerText = exhaleCountdown;
              } else {
                clearInterval(exhaleInterval);
              }
            }, 1000);

            setTimeout(() => {
              // Restart cycle
              runBreathingCycle();
            }, EXHALE_TIME * 1000);

          }, HOLD_TIME * 1000);

        }, INHALE_TIME * 1000);
      }

      // Start
      runBreathingCycle();
    </script>
    </body>
    </html>
    """
    
    st.components.v1.html(breathing_html, height=400)
