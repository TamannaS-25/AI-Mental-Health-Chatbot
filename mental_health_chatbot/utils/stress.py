def assess_stress(emotion, text):
    """
    Assesses stress level based on detected emotion and text intensity indicators
    (capitalization, punctuation, and keyword boosters).
    
    Args:
        emotion (str): Detected emotion (happy, sad, etc.)
        text (str): Original user text
        
    Returns:
        str: 'Low', 'Medium', or 'High'
    """
    emotion = emotion.lower()
    text_lower = text.lower()
    
    # Base stress score based on emotion
    score = 0
    if emotion in ["angry", "sad"]:
        score = 3  # High base stress
    elif emotion in ["anxious"]:
        score = 2  # Medium base stress
    else:
        score = 1  # Low base stress
        
    # Intensity Boosters
    # 1. Capitalization (Shouting) - checking if there's uppercase words
    words = text.split()
    uppercase_words = [w for w in words if w.isupper() and len(w) > 1]
    if len(uppercase_words) >= 2 or (len(words) > 0 and len(uppercase_words) / len(words) > 0.3):
        score += 1
        
    # 2. Exclamation marks (exaggeration/panic)
    if text.count('!') >= 2:
        score += 1
        
    # 3. Intensive words
    intensifiers = ["very", "extremely", "terrible", "worst", "hate", "furious", "panic", "shaking", "screaming", "constant", "always", "never", "cannot", "can't"]
    for word in intensifiers:
        if word in text_lower:
            score += 1
            break
            
    # Resolve score to level
    if score >= 4:
        return "High"
    elif score >= 2.5 or (emotion == "anxious" and score >= 2):
        return "Medium"
    else:
        return "Low"
