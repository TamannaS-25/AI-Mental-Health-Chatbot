import random

CRISIS_KEYWORDS = [
    "die", "suicide", "kill myself", "end it all", "hurt myself", 
    "no reason to live", "better off dead"
]

CRISIS_RESPONSE = """
It sounds like you are going through a really difficult time. Please know that you are not alone and there is help available. 

If you are in immediate danger, please call emergency services or a crisis helpline:
- **National Suicide Prevention Lifeline**: 988 (USA)
- **Crisis Text Line**: Text HOME to 741741
- **International**: Find a helpline at [befrienders.org](https://www.befrienders.org)

I am an AI and cannot provide medical help, but I encourage you to reach out to a professional or a trusted person.
"""

RESPONSES = {
    "happy": [
        "I'm so glad to hear that! What made your day so good?",
        "That's wonderful! It's great to see you feeling positive.",
        "Yay! Happiness looks good on you. Keep that energy going!",
        "That is fantastic news. Celebrate this moment!",
        "I love hearing that you're happy. Tell me more!"
    ],
    "sad": [
        "I'm sorry you're feeling this way. It's okay to not be okay.",
        "I hear you. Take your time, and be gentle with yourself.",
        "That sounds really tough. I'm here to listen if you want to share more.",
        "Sending you virtual hugs. You are stronger than you think.",
        "It's okay to feel sad. Sometimes we just need to let it out."
    ],
    "anxious": [
        "Take a deep breath. Focus on the present moment.",
        "I know it feels overwhelming right now, but this feeling will pass.",
        "Ground yourself: Name 5 things you can see and 4 things you can feel.",
        "You've handled challenges before, and you can handle this too.",
        "Let's take it one step at a time. What's the smallest thing you can do right now?"
    ],
    "angry": [
        "It makes sense that you feel this way. Anger is a valid emotion.",
        "Take a moment to breathe. Don't let the anger consume you.",
        "I hear your frustration. It helps to vent sometimes.",
        "Try to release that tension. Clench and unclench your fists.",
        "I'm listening. Tell me what's making you feel this way."
    ],
    "neutral": [
        "Got it. How has your day been otherwise?",
        "I see. Is there anything on your mind?",
        "Cool. sometimes a calm, neutral day is just what we need.",
        "I'm here if you want to chat about anything.",
        "What are you up to right now?"
    ]
}

COPING_TECHNIQUES = {
    "sad": "Try writing down your thoughts in a journal or taking a gentle walk.",
    "anxious": "Try the 4-7-8 breathing technique: Inhale for 4s, hold for 7s, exhale for 8s.",
    "angry": "Physical activity can help. Maybe a quick walk or some stretching?",
    "happy": "Share your joy with someone! Note down this moment in a gratitude journal.",
    "neutral": "Maybe learn something new or do a small task you've been putting off."
}

def check_crisis(text):
    """
    Checks if the user input contains crisis keywords.
    Returns (True, Crisis Message) if found, else (False, None).
    """
    text = text.lower()
    for keyword in CRISIS_KEYWORDS:
        if keyword in text:
            return True, CRISIS_RESPONSE
    return False, None

def get_response(emotion):
    """
    Returns a random empathetic response based on the emotion.
    Also appends a coping technique sometimes.
    """
    emotion = emotion.lower()
    if emotion not in RESPONSES:
        return "I'm listening. Tell me more."
    
    base_response = random.choice(RESPONSES[emotion])
    
    # Randomly add a coping technique (30% chance)
    if random.random() < 0.3 and emotion in COPING_TECHNIQUES:
        base_response += f"\n\n**Tip:** {COPING_TECHNIQUES[emotion]}"
        
    return base_response
