class BreathingExerciseManager {
  constructor() {
    this.startBtn = document.getElementById('start-breathing-exercise-btn');
    this.bubble = document.getElementById('breathing-bubble');
    this.timerText = document.getElementById('breathing-phase-timer');
    this.label = document.getElementById('breathing-phase-label');
    this.subtext = document.getElementById('breathing-phase-subtext');
    
    this.isRunning = false;
    this.currentCycleTimeout = null;
    this.countdownInterval = null;
    
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.toggleBreathing());
    }
  }

  toggleBreathing() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    this.startBtn.innerHTML = '<i data-lucide="square"></i> Stop Session';
    if (window.lucide) window.lucide.createIcons();
    this.runCycle();
  }

  stop() {
    this.isRunning = false;
    this.startBtn.innerHTML = '<i data-lucide="play"></i> Start Breathing';
    if (window.lucide) window.lucide.createIcons();
    
    // Clear timeouts and intervals
    if (this.currentCycleTimeout) clearTimeout(this.currentCycleTimeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    
    // Reset Bubble styles
    this.bubble.style.transition = 'all 1s ease-in-out';
    this.bubble.style.transform = 'scale(1)';
    this.bubble.style.background = 'radial-gradient(circle, rgba(162, 217, 206, 0.9) 0%, rgba(115, 198, 182, 0.5) 100%)';
    this.bubble.style.boxShadow = '0 0 30px rgba(115, 198, 182, 0.6)';
    
    this.timerText.innerText = 'Ready';
    this.label.innerText = 'Click Start to Begin';
    this.subtext.innerText = 'Find a comfortable, seated position.';
  }

  runCycle() {
    if (!this.isRunning) return;

    // PHASE 1: INHALE (4 Seconds)
    const INHALE_TIME = 4;
    this.label.innerText = 'Inhale';
    this.subtext.innerText = 'Breathe in slowly through your nose';
    
    this.bubble.style.transition = 'all 4000ms ease-in-out';
    this.bubble.style.transform = 'scale(1.8)';
    this.bubble.style.background = 'radial-gradient(circle, rgba(162, 217, 206, 0.95) 0%, rgba(72, 201, 176, 0.6) 100%)';
    this.bubble.style.boxShadow = '0 0 40px rgba(72, 201, 176, 0.8)';
    
    this.startCountdown(INHALE_TIME, () => {
      if (!this.isRunning) return;

      // PHASE 2: HOLD (7 Seconds)
      const HOLD_TIME = 7;
      this.label.innerText = 'Hold';
      this.subtext.innerText = 'Keep the air in your lungs calmly';
      
      this.bubble.style.transition = 'all 7000ms linear';
      this.bubble.style.transform = 'scale(1.8)'; // Keep expanded
      this.bubble.style.boxShadow = '0 0 50px rgba(244, 208, 63, 0.7)'; // Glow yellow
      
      this.startCountdown(HOLD_TIME, () => {
        if (!this.isRunning) return;

        // PHASE 3: EXHALE (8 Seconds)
        const EXHALE_TIME = 8;
        this.label.innerText = 'Exhale';
        this.subtext.innerText = 'Release slowly through your mouth with a soft whoosh';
        
        this.bubble.style.transition = 'all 8000ms ease-in-out';
        this.bubble.style.transform = 'scale(1.0)'; // Contract bubble
        this.bubble.style.background = 'radial-gradient(circle, rgba(91, 141, 239, 0.8) 0%, rgba(91, 141, 239, 0.4) 100%)';
        this.bubble.style.boxShadow = '0 0 25px rgba(91, 141, 239, 0.5)';
        
        this.startCountdown(EXHALE_TIME, () => {
          if (!this.isRunning) return;
          
          // Loop cycle
          this.runCycle();
        });
      });
    });
  }

  startCountdown(seconds, callback) {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    
    let current = seconds;
    this.timerText.innerText = current;
    
    this.countdownInterval = setInterval(() => {
      current--;
      if (current > 0) {
        this.timerText.innerText = current;
      } else {
        clearInterval(this.countdownInterval);
        callback();
      }
    }, 1000);
  }
}

// Instantiate breathing manager
let breathingManager;
document.addEventListener('DOMContentLoaded', () => {
  breathingManager = new BreathingExerciseManager();
});
