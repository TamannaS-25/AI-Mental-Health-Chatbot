def assess_stress(emotion, text):
    """
    Assesses stress level based on detected emotion and text intensity.
    
    Current Logic (Rule-based):
    - Angry, Sad -> High Stress
    - Anxious -> Medium Stress
    - Happy, Neutral -> Low Stress
    
    Args:
        emotion (str): Detected emotion (happy, sad, etc.)
        text (str): Original user text (unused in simple logic but kept for interface)
        
    Returns:
        str: 'Low', 'Medium', or 'High'
    """
    emotion = emotion.lower()
    
    if emotion in ["angry", "sad"]:
        return "High"
    elif emotion in ["anxious"]:
        return "Medium"
    else:
        return "Low"
