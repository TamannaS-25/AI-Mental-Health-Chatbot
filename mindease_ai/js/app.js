/* ==========================================================================
   MINDEASE AI SPA APPLICATION SCRIPT
   ========================================================================== */

// -------------------------------------------------------------
// 1. SPA ROUTER DEFINITION
// -------------------------------------------------------------
class AppRouter {
  constructor() {
    this.currentView = 'landing'; // default
    this.currentSubView = 'chat'; // default sidebar sub-view
    
    this.landingView = document.getElementById('landing-view');
    this.appView = document.getElementById('app-view');
    this.sidebarItems = document.querySelectorAll('.menu-item');
    this.viewTitle = document.getElementById('current-view-title');
    
    this.initEvents();
  }

  initEvents() {
    // Sidebar clicks
    this.sidebarItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const target = item.getAttribute('data-target');
        if (target) {
          e.preventDefault();
          this.switchSubView(target);
        }
      });
    });
  }

  navigateTo(viewName) {
    if (viewName === 'chat' || viewName === 'app') {
      this.landingView.classList.add('hidden');
      this.appView.classList.remove('hidden');
      this.appView.classList.add('active');
      this.landingView.classList.remove('active');
      
      // Auto-load sub-view
      this.switchSubView(this.currentSubView);
      
      // Initialize charts when entering dashboard
      if (window.chartsManager) {
        const activeTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        window.chartsManager.initCharts(activeTheme);
      }
    } else {
      this.appView.classList.add('hidden');
      this.landingView.classList.remove('hidden');
      this.landingView.classList.add('active');
      this.appView.classList.remove('active');
      
      if (window.breathingManager) {
        window.breathingManager.stop();
      }
    }
    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchSubView(subViewName) {
    // Stop breathing if switching away from breathing
    if (this.currentSubView === 'breathing' && subViewName !== 'breathing') {
      if (window.breathingManager) window.breathingManager.stop();
    }

    this.currentSubView = subViewName;
    
    // Hide all sub-views
    const subViews = document.querySelectorAll('.sub-view');
    subViews.forEach(view => {
      view.classList.remove('active');
    });

    // Show target sub-view
    const targetView = document.getElementById(`view-${subViewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update active class on sidebar
    this.sidebarItems.forEach(item => {
      if (item.getAttribute('data-target') === subViewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Header Title
    const titleMap = {
      'chat': 'Conversational Chat',
      'dashboard': 'Wellness Dashboard',
      'mood': 'Mood Tracker Log',
      'breathing': 'Guided Breathing Exercise',
      'journal': 'Daily Reflections Journal',
      'activities': 'Mindfulness Library',
      'profile': 'My Profile & Goal Tracker',
      'emergency': 'Emergency & Crisis Support'
    };
    if (this.viewTitle) {
      this.viewTitle.innerText = titleMap[subViewName] || 'MindEase Workspace';
    }

    // Special trigger for subviews
    if (subViewName === 'dashboard' && window.chartsManager) {
      const activeTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      setTimeout(() => {
        window.chartsManager.initCharts(activeTheme);
      }, 50);
    }
    
    if (subViewName === 'journal') {
      journalManager.loadHistory();
    }
  }
}

// -------------------------------------------------------------
// 2. CHAT ENGINE (CHATBOT INTERACTION)
// -------------------------------------------------------------
class ChatEngine {
  constructor() {
    this.chatContainer = document.getElementById('chat-messages');
    this.inputField = document.getElementById('chat-input-field');
    this.sendBtn = document.getElementById('send-message-btn');
    this.suggestsContainer = document.getElementById('suggested-replies-container');
    
    // Voice/Mic trigger indicator
    this.voiceBtn = document.getElementById('voice-input-btn');
    this.isListening = false;

    this.history = this.loadChatHistory();
    this.initEvents();
    this.renderHistory();
    
    // Load initial context insight labels
    this.updateContextLabels();
  }

  loadChatHistory() {
    const saved = localStorage.getItem('mindease_chat_history');
    if (saved) return JSON.parse(saved);
    return [
      {
        role: 'assistant',
        content: "Hello! I am your MindEase Companion. I'm here to listen to whatever is on your mind in a safe, non-judgmental space. How are you feeling today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: 'neutral',
        stress: 'Low',
        tip: null
      }
    ];
  }

  saveChatHistory() {
    localStorage.setItem('mindease_chat_history', JSON.stringify(this.history));
  }

  initEvents() {
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.sendMessage());
    }
    if (this.inputField) {
      this.inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
    if (this.voiceBtn) {
      this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
    }
    
    // Event delegation for suggested replies
    if (this.suggestsContainer) {
      this.suggestsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggest-btn')) {
          this.inputField.value = e.target.innerText;
          this.sendMessage();
        }
      });
    }
  }

  renderHistory() {
    if (!this.chatContainer) return;
    this.chatContainer.innerHTML = '';
    
    this.history.forEach(msg => {
      this.appendMessageHTML(msg.role, msg.content, msg.timestamp, msg.tip);
    });
    this.scrollToBottom();
    this.renderSuggestedReplies();
  }

  renderSuggestedReplies() {
    if (!this.suggestsContainer) return;
    this.suggestsContainer.innerHTML = '';
    
    const lastMsg = this.history[this.history.length - 1];
    let options = [];
    
    if (lastMsg && lastMsg.role === 'assistant') {
      const emotion = lastMsg.emotion || 'neutral';
      if (emotion === 'neutral') {
        options = ["I feel stressed about my exams.", "I had a really good day!", "Just looking to unwind."];
      } else if (emotion === 'anxious') {
        options = ["I want to try a breathing exercise.", "Can you help me ground myself?", "I am overthinking."];
      } else if (emotion === 'sad') {
        options = ["I feel lonely today.", "How do I deal with feeling down?", "Just want to write in my journal."];
      } else if (emotion === 'angry') {
        options = ["I need to vent.", "Someone treated me unfairly.", "How do I calm my anger?"];
      } else if (emotion === 'happy') {
        options = ["Grateful for some support.", "Let's track my goals.", "Have a wonderful day!"];
      }
    } else {
      options = ["I feel stressed.", "I am feeling okay.", "Can we do breathing guides?"];
    }

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'suggest-btn';
      btn.innerText = opt;
      this.suggestsContainer.appendChild(btn);
    });
  }

  appendMessageHTML(role, content, timestamp, tip) {
    const isUser = role === 'user';
    const avatar = isUser ? 
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Tamanna' : 
      'assets/ai_avatar.png';
      
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${role}`;
    
    let tipHTML = '';
    if (tip) {
      tipHTML = `
        <div class="tip-card">
          <div class="tip-title"><i data-lucide="sparkles" style="width:16px;"></i> Coping Tip</div>
          <div class="tip-content">${tip}</div>
        </div>
      `;
    }

    msgDiv.innerHTML = `
      <img src="${avatar}" alt="${role} Avatar" class="msg-avatar">
      <div class="msg-bubble-container">
        <div class="msg-bubble">${content} ${tipHTML}</div>
        <span class="msg-timestamp">${timestamp}</span>
      </div>
    `;
    
    this.chatContainer.appendChild(msgDiv);
    if (window.lucide) window.lucide.createIcons();
  }

  sendMessage() {
    const query = this.inputField.value.trim();
    if (!query) return;

    // Clear input
    this.inputField.value = '';
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg = { role: 'user', content: query, timestamp: timestamp };
    this.history.push(userMsg);
    this.saveChatHistory();
    
    // Append to UI
    this.appendMessageHTML('user', query, timestamp);
    this.scrollToBottom();
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Fetch simulated NLP response
    setTimeout(() => {
      this.hideTypingIndicator();
      this.generateAIResponse(query);
    }, 1200);
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg assistant typing-indicator';
    indicator.id = 'chat-typing-indicator';
    indicator.innerHTML = `
      <img src="assets/ai_avatar.png" alt="Assistant Avatar" class="msg-avatar">
      <div class="msg-bubble-container">
        <div class="msg-bubble typing-indicator-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    this.chatContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
  }

  toggleVoiceInput() {
    if (this.isListening) {
      this.isListening = false;
      this.voiceBtn.style.color = 'var(--text-muted)';
      this.voiceBtn.style.backgroundColor = 'transparent';
      this.voiceBtn.classList.remove('animate-pulse');
    } else {
      this.isListening = true;
      this.voiceBtn.style.color = 'white';
      this.voiceBtn.style.backgroundColor = 'var(--status-crisis)';
      this.voiceBtn.classList.add('animate-pulse');
      
      // Simulate listening and typing after 2 seconds
      setTimeout(() => {
        if (this.isListening) {
          this.inputField.value = "I am overthinking about my exam grade tomorrow.";
          this.toggleVoiceInput();
        }
      }, 2000);
    }
  }

  // -------------------------------------------------------------
  // SIMULATED NATURAL LANGUAGE RESPONSES & METRIC CALCULATOR
  // -------------------------------------------------------------
  generateAIResponse(query) {
    const queryLower = query.toLowerCase();
    let responseText = "";
    let emotion = "neutral";
    let stressLevel = "Low";
    let tip = null;
    
    // Check Crisis first
    const crisisWords = ["suicide", "die", "kill myself", "end it all", "hurt myself", "cutting", "overdose"];
    let isCrisis = false;
    for (let word of crisisWords) {
      if (queryLower.includes(word)) {
        isCrisis = true;
        break;
      }
    }

    if (isCrisis) {
      responseText = "I am so sorry that you are feeling this way, but please know you are not alone and there is support available. I strongly encourage you to speak with someone who can help right now. You can connect with compassionate, trained professionals instantly.";
      emotion = "sad";
      stressLevel = "High";
      tip = "Please look at our **Emergency Support** tab on the sidebar. You can call or text **988** (USA/Canada) anytime. It is free and confidential.";
      
      // Send alert
      appRouter.switchSubView('emergency');
    } else {
      // Analyze Emotion & Stress (Rule-based heuristics)
      if (queryLower.includes("exam") || queryLower.includes("grade") || queryLower.includes("fail") || queryLower.includes("study") || queryLower.includes("test")) {
        emotion = "anxious";
        stressLevel = "High";
        responseText = "It's completely normal to feel overwhelmed by exams and academic pressure. Remember that your grades do not define your worth. Try to focus on breaking your revision into small, bite-sized tasks.";
        tip = "Try taking a 5-minute study break and join the **Guided Breathing** session (4-7-8 rhythm) to reset your nervous system.";
      } else if (queryLower.includes("anxious") || queryLower.includes("nervous") || queryLower.includes("panic") || queryLower.includes("scared") || queryLower.includes("worry") || queryLower.includes("terrified")) {
        emotion = "anxious";
        stressLevel = "Medium";
        responseText = "Anxiety can feel like a heavy wave crashing down on you, but please take a slow breath. You are safe in this moment. We can take this one step at a time.";
        tip = "Practice the **5-4-3-2-1 Grounding Method**: Look around you and name 5 things you can see, 4 things you can feel, 3 things you hear, 2 things you smell, and 1 thing you taste.";
      } else if (queryLower.includes("depressed") || queryLower.includes("sad") || queryLower.includes("lonely") || queryLower.includes("cry") || queryLower.includes("hopeless") || queryLower.includes("empty")) {
        emotion = "sad";
        stressLevel = "High";
        responseText = "I hear you, and it's completely okay to not feel okay. Sadness is a heavy weight to carry alone. I'm here to sit with you in this space. Be extremely gentle with yourself today.";
        tip = "Consider writing down your heavy thoughts in our **Daily Journal** tab. Sometimes getting the words out onto paper can release their grip on you.";
      } else if (queryLower.includes("angry") || queryLower.includes("furious") || queryLower.includes("mad") || queryLower.includes("pissed") || queryLower.includes("frustrated") || queryLower.includes("hate")) {
        emotion = "angry";
        stressLevel = "High";
        responseText = "Your frustration is completely valid. It makes sense that you are angry about this. Let it all out — venting is a healthy way to release that intense energy.";
        tip = "Physical movement helps process anger. Try standing up, clenching and unclenching your fists, or doing a quick stretch right now.";
      } else if (queryLower.includes("happy") || queryLower.includes("good") || queryLower.includes("excited") || queryLower.includes("great") || queryLower.includes("glad")) {
        emotion = "happy";
        stressLevel = "Low";
        responseText = "That is absolutely wonderful to hear! I'm so glad to see you feeling positive. Sharing these uplifting moments is a great way to anchor them in your mind.";
        tip = "Take a moment to write a quick entry in your journal about what made today feel good. It helps build a gratitude habit!";
      } else if (queryLower.includes("hello") || queryLower.includes("hi ") || queryLower.includes("hey")) {
        emotion = "neutral";
        stressLevel = "Low";
        responseText = "Hello there! It is wonderful to chat with you today. How has your day been treating you so far?";
      } else {
        emotion = "neutral";
        stressLevel = "Low";
        responseText = "I understand. Thank you for sharing that with me. It takes courage to open up. Tell me more about what is going on or how that makes you feel.";
      }
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replyMsg = {
      role: 'assistant',
      content: responseText,
      timestamp: timestamp,
      emotion: emotion,
      stress: stressLevel,
      tip: tip
    };
    
    this.history.push(replyMsg);
    this.saveChatHistory();
    this.appendMessageHTML('assistant', responseText, timestamp, tip);
    this.scrollToBottom();
    
    // Update labels in real-time
    this.updateContextLabels();
    this.renderSuggestedReplies();
    
    // Update chart if user enters dashboard
    if (window.chartsManager) {
      let rating = 3;
      if (emotion === 'happy') rating = 5;
      else if (emotion === 'calm') rating = 4;
      else if (emotion === 'neutral') rating = 3;
      else if (emotion === 'anxious') rating = 2;
      else if (emotion === 'sad' || emotion === 'angry') rating = 1;
      window.chartsManager.appendNewMood(rating);
    }
  }

  updateContextLabels() {
    const lastAssistant = [...this.history].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) {
      const moodVal = document.getElementById('chat-mood-val');
      const stressVal = document.getElementById('chat-stress-val');
      const moodIconBg = document.getElementById('chat-mood-icon-bg');
      const moodIcon = document.getElementById('chat-mood-icon');
      const stressIconBg = document.getElementById('chat-stress-icon-bg');
      const tipBox = document.getElementById('chat-context-tip-box');
      const tipText = document.getElementById('chat-context-tip-text');

      if (moodVal) moodVal.innerText = lastAssistant.emotion.toUpperCase();
      if (stressVal) stressVal.innerText = lastAssistant.stress;
      
      // Update icons
      if (moodIconBg && moodIcon) {
        moodIconBg.className = `metric-icon-bg ${lastAssistant.emotion}`;
        const icons = { 'happy': 'smile', 'sad': 'frown', 'anxious': 'alert-circle', 'angry': 'angry', 'neutral': 'meh' };
        moodIcon.setAttribute('data-lucide', icons[lastAssistant.emotion] || 'meh');
      }

      if (stressIconBg) {
        stressIconBg.className = `metric-icon-bg ${lastAssistant.stress.toLowerCase()}`;
      }

      if (lastAssistant.tip && tipBox && tipText) {
        tipBox.classList.remove('hidden');
        tipText.innerHTML = lastAssistant.tip;
      } else if (tipBox) {
        tipBox.classList.add('hidden');
      }

      if (window.lucide) window.lucide.createIcons();
    }
  }

  clearHistory() {
    this.history = [
      {
        role: 'assistant',
        content: "Hello! I am your MindEase Companion. I'm here to listen to whatever is on your mind in a safe, non-judgmental space. How are you feeling today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: 'neutral',
        stress: 'Low',
        tip: null
      }
    ];
    this.saveChatHistory();
    this.renderHistory();
    this.updateContextLabels();
  }
}

// -------------------------------------------------------------
// 3. MOOD LOGGER MANAGER
// -------------------------------------------------------------
class MoodTrackerManager {
  constructor() {
    this.selectedMood = null;
    this.moodCards = document.querySelectorAll('.mood-card-select');
    this.confirmBox = document.getElementById('mood-confirm-box');
    this.logBtn = document.getElementById('log-mood-btn');
    this.notesInput = document.getElementById('mood-notes-input');
    
    this.initEvents();
  }

  initEvents() {
    this.moodCards.forEach(card => {
      card.addEventListener('click', () => {
        this.moodCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedMood = card.getAttribute('data-mood');
        
        // Show confirm notes box
        if (this.confirmBox) {
          this.confirmBox.classList.remove('hidden');
        }
      });
    });

    if (this.logBtn) {
      this.logBtn.addEventListener('click', () => this.logMood());
    }
  }

  logMood() {
    if (!this.selectedMood) return;
    
    const note = this.notesInput ? this.notesInput.value : '';
    
    // Save to local storage mood log history
    const savedLogs = localStorage.getItem('mindease_mood_history') ? 
      JSON.parse(localStorage.getItem('mindease_mood_history')) : [];
      
    const newLog = {
      mood: this.selectedMood,
      note: note,
      timestamp: new Date().toISOString()
    };
    
    savedLogs.push(newLog);
    localStorage.setItem('mindease_mood_history', JSON.stringify(savedLogs));
    
    // Clear selections
    this.notesInput.value = '';
    this.moodCards.forEach(c => c.classList.remove('selected'));
    if (this.confirmBox) this.confirmBox.classList.add('hidden');
    
    // Show Toast
    this.showToast(`Mood logged as ${this.selectedMood.toUpperCase()}!`);
    
    // Update chart
    if (window.chartsManager) {
      let rating = 3;
      if (this.selectedMood === 'happy') rating = 5;
      else if (this.selectedMood === 'calm') rating = 4;
      else if (this.selectedMood === 'neutral') rating = 3;
      else if (this.selectedMood === 'anxious') rating = 2;
      else if (this.selectedMood === 'sad' || this.selectedMood === 'angry') rating = 1;
      window.chartsManager.appendNewMood(rating);
    }

    // Switch view back to Dashboard to see results
    setTimeout(() => {
      appRouter.switchSubView('dashboard');
    }, 1000);
  }

  showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
      toastMsg.innerText = message;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 2500);
    }
  }
}

// -------------------------------------------------------------
// 4. DAILY JOURNAL MANAGER
// -------------------------------------------------------------
class JournalManager {
  constructor() {
    this.titleInput = document.getElementById('journal-title');
    this.contentInput = document.getElementById('journal-content');
    this.saveBtn = document.getElementById('save-journal-btn');
    this.historyList = document.getElementById('journal-history-list');
    this.searchInput = document.getElementById('journal-search-input');
    
    this.entries = this.loadEntries();
    this.initEvents();
  }

  loadEntries() {
    const saved = localStorage.getItem('mindease_journal');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        title: "Deep reflection before exams",
        content: "Feeling slightly anxious about tomorrow's study session, but I have organized all my study guides. I will do my best and remember to breathe.",
        date: new Date().toLocaleDateString()
      }
    ];
  }

  saveEntries() {
    localStorage.setItem('mindease_journal', JSON.stringify(this.entries));
  }

  initEvents() {
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => this.saveEntry());
    }
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.filterEntries());
    }
  }

  saveEntry() {
    const title = this.titleInput.value.trim();
    const content = this.contentInput.value.trim();
    
    if (!title || !content) {
      alert("Please fill in both the title and content of your reflection.");
      return;
    }
    
    const newEntry = {
      id: Date.now(),
      title: title,
      content: content,
      date: new Date().toLocaleDateString()
    };
    
    this.entries.unshift(newEntry); // Add to beginning
    this.saveEntries();
    
    // Clear inputs
    this.titleInput.value = '';
    this.contentInput.value = '';
    
    // Reload history list
    this.loadHistory();
    
    // Add streak to profile metrics
    this.incrementStreak();
  }

  loadHistory() {
    if (!this.historyList) return;
    this.historyList.innerHTML = '';
    
    if (this.entries.length === 0) {
      this.historyList.innerHTML = '<div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding: 20px;">No entries written yet.</div>';
      return;
    }

    this.entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'journal-card';
      card.innerHTML = `
        <div class="journal-card-header">
          <h4>${entry.title}</h4>
          <span class="journal-card-date">${entry.date}</span>
        </div>
        <p class="journal-card-snippet">${entry.content}</p>
      `;
      
      // Let user read journal entry inside editor
      card.addEventListener('click', () => {
        this.titleInput.value = entry.title;
        this.contentInput.value = entry.content;
      });

      this.historyList.appendChild(card);
    });
  }

  filterEntries() {
    const query = this.searchInput.value.toLowerCase();
    const cards = this.historyList.querySelectorAll('.journal-card');
    
    cards.forEach((card, index) => {
      const entry = this.entries[index];
      if (entry) {
        const text = (entry.title + " " + entry.content).toLowerCase();
        if (text.includes(query)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      }
    });
  }

  incrementStreak() {
    // Basic streak local increment logic
    let streak = parseInt(localStorage.getItem('mindease_journal_streak') || '5');
    streak++;
    localStorage.setItem('mindease_journal_streak', streak.toString());
  }
}

// -------------------------------------------------------------
// 5. MINDFULNESS ACTIVITIES MANAGER
// -------------------------------------------------------------
class MindfulnessActivitiesManager {
  constructor() {
    this.modal = document.getElementById('activity-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalContent = document.getElementById('modal-body-content');
    this.closeBtn = document.getElementById('close-modal-btn');
    
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }
    
    // Close modal on overlay click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }
  }

  openModal(title, contentHTML) {
    if (!this.modal) return;
    this.modalTitle.innerText = title;
    this.modalContent.innerHTML = contentHTML;
    this.modal.classList.remove('hidden');
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  openAffirmationsModal() {
    const affirmations = [
      "I am breathing in strength, and exhaling stress.",
      "My mind is calm, clear, and quiet.",
      "I have the ability to handle whatever study challenges come my way.",
      "I am safe, I am supported, and I am worthy of love and care.",
      "One study block at a time. I am doing my absolute best."
    ];
    
    let html = '<div style="display:flex; flex-direction:column; gap:14px; text-align:center; padding:10px 0;">';
    affirmations.forEach(aff => {
      html += `<blockquote style="font-style:italic; font-size:1.1rem; color:var(--primary-color); padding: 10px; border-radius:10px; background:rgba(0,0,0,0.02)">"${aff}"</blockquote>`;
    });
    html += '</div>';

    this.openModal("Positive Affirmations", html);
  }

  openQuoteModal() {
    const quotes = [
      { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
      { text: "Rule your mind or it will rule you.", author: "Horace" },
      { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" }
    ];
    const rand = quotes[Math.floor(Math.random() * quotes.length)];
    
    const html = `
      <div style="padding: 20px 0;">
        <p style="font-size:1.3rem; font-style:italic; line-height:1.5; color:var(--text-main); margin-bottom:12px;">"${rand.text}"</p>
        <span style="font-weight:600; color:var(--secondary-color);">— ${rand.author}</span>
      </div>
    `;
    this.openModal("Daily Wisdom", html);
  }
}

// -------------------------------------------------------------
// 6. PROFILE GOALS MANAGER
// -------------------------------------------------------------
class ProfileGoalsManager {
  constructor() {
    this.goalsContainer = document.getElementById('goals-checklist-container');
    this.newGoalInput = document.getElementById('new-goal-input');
    this.addGoalBtn = document.getElementById('add-goal-btn');
    this.clearAllBtn = document.getElementById('clear-all-data-btn');

    this.goals = this.loadGoals();
    this.initEvents();
    this.renderGoals();
  }

  loadGoals() {
    const saved = localStorage.getItem('mindease_goals');
    if (saved) return JSON.parse(saved);
    return [
      { text: "Practice deep breathing daily (3 minutes)", checked: true },
      { text: "Write in the daily journal before sleep", checked: false },
      { text: "Maintain average stress score below \"Medium\"", checked: true }
    ];
  }

  saveGoals() {
    localStorage.setItem('mindease_goals', JSON.stringify(this.goals));
  }

  initEvents() {
    if (this.addGoalBtn) {
      this.addGoalBtn.addEventListener('click', () => this.addGoal());
    }
    if (this.clearAllBtn) {
      this.clearAllBtn.addEventListener('click', () => this.clearAllData());
    }
  }

  renderGoals() {
    if (!this.goalsContainer) return;
    this.goalsContainer.innerHTML = '';

    this.goals.forEach((goal, index) => {
      const label = document.createElement('label');
      label.className = 'checkbox-container';
      label.innerHTML = `
        <input type="checkbox" ${goal.checked ? 'checked' : ''} data-index="${index}">
        <span class="checkmark"></span>
        <span>${goal.text}</span>
      `;
      
      // Toggle checked
      label.querySelector('input').addEventListener('change', (e) => {
        this.goals[index].checked = e.target.checked;
        this.saveGoals();
      });

      this.goalsContainer.appendChild(label);
    });
  }

  addGoal() {
    const text = this.newGoalInput.value.trim();
    if (!text) return;

    this.goals.push({ text: text, checked: false });
    this.saveGoals();
    this.newGoalInput.value = '';
    this.renderGoals();
  }

  clearAllData() {
    const confirmClear = confirm("Are you sure you want to clear all your local MindEase workspace files? This includes chat history, journals, and mood logs.");
    if (confirmClear) {
      localStorage.clear();
      alert("All data cleared. MindEase is resetting.");
      location.reload();
    }
  }
}

// -------------------------------------------------------------
// 7. INITIALIZATION & LIGHT/DARK THEME TOGGLE
// -------------------------------------------------------------
let appRouter;
let chatEngine;
let moodManager;
let journalManager;
let activitiesManager;
let goalsManager;

document.addEventListener('DOMContentLoaded', () => {
  // Instantiate all modules
  appRouter = new AppRouter();
  chatEngine = new ChatEngine();
  moodManager = new MoodTrackerManager();
  journalManager = new JournalManager();
  activitiesManager = new MindfulnessActivitiesManager();
  goalsManager = new ProfileGoalsManager();

  // Create Lucide Icons
  if (window.lucide) window.lucide.createIcons();

  // New Chat Trigger click
  const newChatTrigger = document.getElementById('new-chat-trigger');
  if (newChatTrigger) {
    newChatTrigger.addEventListener('click', () => {
      chatEngine.clearHistory();
      appRouter.switchSubView('chat');
    });
  }

  // Light/Dark Theme Toggles
  const landingThemeBtn = document.getElementById('theme-toggle-btn');
  const appThemeBtn = document.getElementById('app-theme-toggle');
  
  const savedTheme = localStorage.getItem('mindease_theme') || 'light';
  applyTheme(savedTheme);

  if (landingThemeBtn) {
    landingThemeBtn.addEventListener('click', () => toggleTheme());
  }
  if (appThemeBtn) {
    appThemeBtn.addEventListener('click', () => toggleTheme());
  }

  function toggleTheme() {
    const active = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(active);
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    
    // Set classes
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      
      // Update icons
      updateThemeIcons('sun', 'Light Mode');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      
      // Update icons
      updateThemeIcons('moon', 'Dark Mode');
    }
    
    localStorage.setItem('mindease_theme', theme);
    
    // Re-initialize Chart colors
    if (window.chartsManager) {
      window.chartsManager.initCharts(theme);
    }
  }

  function updateThemeIcons(iconName, textVal) {
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');
    const navThemeIcon = document.querySelector('#theme-toggle-btn i');
    
    if (themeIcon) themeIcon.setAttribute('data-lucide', iconName);
    if (themeText) themeText.innerText = textVal;
    if (navThemeIcon) navThemeIcon.setAttribute('data-lucide', iconName);
    
    if (window.lucide) window.lucide.createIcons();
  }
});
