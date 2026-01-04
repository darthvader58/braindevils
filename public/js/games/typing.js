class SpeedTypingGame {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.words = [];
    this.currentWordIndex = 0;
    this.wordsTyped = 0;
    this.correctWords = 0;
    this.errors = 0;
    this.startTime = null;
    this.gameTime = this.getDifficultyTime();
    this.timerInterval = null;
    this.gameActive = false;
    this.currentInput = '';
    
    this.loadWords();
  }

  getDifficultyTime() {
    switch (this.difficulty) {
      case 'easy': return 60; // 60 seconds
      case 'medium': return 45; // 45 seconds
      case 'hard': return 30; // 30 seconds
      default: return 60;
    }
  }

  async loadWords() {
    try {
      const response = await fetch('words.txt');
      const text = await response.text();
      this.words = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
      
      // Filter words based on difficulty
      if (this.difficulty === 'easy') {
        this.words = this.words.filter(word => word.length <= 6);
      } else if (this.difficulty === 'medium') {
        this.words = this.words.filter(word => word.length <= 10);
      }
      
      this.shuffleWords();
    } catch (error) {
      console.error('Error loading words:', error);
      // Fallback words
      this.words = this.getFallbackWords();
    }
  }

  getFallbackWords() {
    const easyWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy'];
    const mediumWords = ['about', 'after', 'again', 'before', 'being', 'below', 'between', 'during', 'each', 'few', 'from', 'further', 'here', 'how', 'into', 'more', 'most', 'other', 'over', 'same', 'some', 'such', 'than', 'that', 'their', 'them', 'these', 'they', 'this', 'those'];
    const hardWords = ['although', 'because', 'between', 'different', 'following', 'however', 'important', 'including', 'information', 'interest', 'knowledge', 'language', 'learning', 'necessary', 'particular', 'possible', 'problem', 'question', 'remember', 'something', 'together', 'understand', 'without', 'yourself'];
    
    switch (this.difficulty) {
      case 'easy': return easyWords;
      case 'medium': return [...easyWords, ...mediumWords];
      case 'hard': return [...easyWords, ...mediumWords, ...hardWords];
      default: return easyWords;
    }
  }

  shuffleWords() {
    for (let i = this.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
    }
  }

  init() {
    this.setupUI();
  }

  setupUI() {
    const gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = `
      <div class="typing-workspace">
        <div class="word-display">
          <div class="current-word" id="currentWord">Click Start to Begin</div>
        </div>

        <input type="text" class="typing-input" id="typingInput" placeholder="Type the word above..." disabled>

        <div class="game-stats-grid">
          <div class="stat-card">
            <h4>WPM</h4>
            <div class="stat-value" id="wpmDisplay">0</div>
          </div>
          <div class="stat-card">
            <h4>Accuracy</h4>
            <div class="stat-value" id="accuracyDisplay">100%</div>
          </div>
          <div class="stat-card">
            <h4>Words</h4>
            <div class="stat-value" id="wordsDisplay">0</div>
          </div>
          <div class="stat-card">
            <h4>Time</h4>
            <div class="stat-value" id="timeDisplay">${this.gameTime}.0</div>
          </div>
        </div>

        <div class="game-controls">
          <button class="btn-primary" id="startBtn">Start Game</button>
          <button class="btn-secondary" id="resetBtn" style="display: none;">Reset</button>
        </div>

        <div id="resultsPanel" class="results-panel" style="display: none;">
          <h3 class="results-title">Game Complete!</h3>
          <div class="results-stats">
            <div class="result-stat">
              <h4>Final WPM</h4>
              <div class="result-value" id="finalWPM">0</div>
            </div>
            <div class="result-stat">
              <h4>Accuracy</h4>
              <div class="result-value" id="finalAccuracy">0%</div>
            </div>
            <div class="result-stat">
              <h4>Total Words</h4>
              <div class="result-value" id="finalWords">0</div>
            </div>
            <div class="result-stat">
              <h4>Score</h4>
              <div class="result-value" id="finalScore">0</div>
            </div>
          </div>
          <button class="btn-primary" onclick="window.typingGame.reset()">Play Again</button>
          <button class="btn-secondary" onclick="app.showDifficultyModal('typing')">Change Difficulty</button>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    
    const typingInput = document.getElementById('typingInput');
    typingInput.addEventListener('input', (e) => this.handleInput(e));
    typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  start() {
    this.gameActive = true;
    this.startTime = Date.now();
    this.currentWordIndex = 0;
    this.wordsTyped = 0;
    this.correctWords = 0;
    this.errors = 0;
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'inline-block';
    document.getElementById('resultsPanel').style.display = 'none';
    
    const typingInput = document.getElementById('typingInput');
    typingInput.disabled = false;
    typingInput.focus();
    typingInput.value = '';
    
    this.shuffleWords();
    this.displayCurrentWord();
    this.startTimer();
    this.updateStats();
  }

  displayCurrentWord() {
    const currentWordElement = document.getElementById('currentWord');
    if (currentWordElement && this.words.length > 0) {
      currentWordElement.textContent = this.words[this.currentWordIndex];
      currentWordElement.className = 'current-word';
    }
  }

  handleInput(event) {
    if (!this.gameActive) return;
    
    const input = event.target;
    const inputValue = input.value.trim();
    const currentWord = this.words[this.currentWordIndex];
    
    // Real-time feedback
    if (currentWord.startsWith(inputValue)) {
      input.className = 'typing-input correct';
    } else {
      input.className = 'typing-input incorrect';
    }
    
    this.currentInput = inputValue;
  }

  handleKeyDown(event) {
    if (!this.gameActive) return;
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.checkWord();
    }
  }

  checkWord() {
    const currentWord = this.words[this.currentWordIndex];
    const currentWordElement = document.getElementById('currentWord');
    const typingInput = document.getElementById('typingInput');
    
    this.wordsTyped++;
    
    if (this.currentInput === currentWord) {
      this.correctWords++;
      currentWordElement.classList.add('correct');
      
      // Visual feedback
      setTimeout(() => {
        currentWordElement.classList.remove('correct');
      }, 300);
    } else {
      this.errors++;
      currentWordElement.classList.add('incorrect');
      
      // Visual feedback
      setTimeout(() => {
        currentWordElement.classList.remove('incorrect');
      }, 300);
    }
    
    // Move to next word
    this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
    this.displayCurrentWord();
    
    // Clear input
    typingInput.value = '';
    typingInput.className = 'typing-input';
    this.currentInput = '';
    
    this.updateStats();
  }

  updateStats() {
    const elapsedTime = this.gameActive ? (Date.now() - this.startTime) / 1000 : 0;
    const wpm = elapsedTime > 0 ? Math.round((this.correctWords / elapsedTime) * 60) : 0;
    const accuracy = this.wordsTyped > 0 ? Math.round((this.correctWords / this.wordsTyped) * 100) : 100;
    
    document.getElementById('wpmDisplay').textContent = wpm;
    document.getElementById('accuracyDisplay').textContent = accuracy + '%';
    document.getElementById('wordsDisplay').textContent = this.wordsTyped;
    
    // Update game stats in header
    const gameStats = document.getElementById('gameStats');
    gameStats.innerHTML = `
      WPM: ${wpm} | 
      Accuracy: ${accuracy}% | 
      Words: ${this.correctWords}/${this.wordsTyped}
    `;
  }

  startTimer() {
    let timeLeft = this.gameTime;
    
    this.timerInterval = setInterval(() => {
      timeLeft -= 0.1;
      document.getElementById('timeDisplay').textContent = timeLeft.toFixed(1);
      
      if (timeLeft <= 0) {
        this.complete();
      }
    }, 100);
  }

  complete() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    const finalWPM = Math.round((this.correctWords / this.gameTime) * 60);
    const finalAccuracy = this.wordsTyped > 0 ? Math.round((this.correctWords / this.wordsTyped) * 100) : 100;
    const finalScore = Math.round(finalWPM * (finalAccuracy / 100) * 10);
    
    document.getElementById('finalWPM').textContent = finalWPM;
    document.getElementById('finalAccuracy').textContent = finalAccuracy + '%';
    document.getElementById('finalWords').textContent = this.wordsTyped;
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('resultsPanel').style.display = 'block';
    
    document.getElementById('typingInput').disabled = true;
    document.getElementById('currentWord').textContent = 'Game Complete!';
    
    // Save game session if user is authenticated
    if (auth.isAuthenticated()) {
      this.saveGameSession(finalScore, finalWPM, finalAccuracy);
    }
  }

  async saveGameSession(finalScore, wpm, accuracy) {
    try {
      await api.saveGameSession({
        gameType: 'speedTyping',
        difficulty: this.difficulty,
        score: finalScore,
        duration: this.gameTime,
        accuracy: accuracy,
        gameData: {
          wpm: wpm,
          wordsTyped: this.wordsTyped,
          correctWords: this.correctWords,
          errors: this.errors
        }
      });
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  }

  reset() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    this.currentWordIndex = 0;
    this.wordsTyped = 0;
    this.correctWords = 0;
    this.errors = 0;
    this.currentInput = '';
    
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('resultsPanel').style.display = 'none';
    
    const typingInput = document.getElementById('typingInput');
    typingInput.disabled = true;
    typingInput.value = '';
    typingInput.className = 'typing-input';
    
    document.getElementById('timeDisplay').textContent = this.gameTime.toFixed(1);
    document.getElementById('currentWord').textContent = 'Click Start to Begin';
    
    this.updateStats();
  }
}

// Global instance
let typingGame;