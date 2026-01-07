class App {
  constructor() {
    this.currentGame = null;
    this.currentGameType = null;
    this.currentDifficulty = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.updateGoogleClientId();
  }

  async updateGoogleClientId() {
    try {
      // Fetch Google Client ID from server
      const response = await fetch('/api/config/google');
      const config = await response.json();
      
      const onloadDiv = document.getElementById('g_id_onload');
      if (onloadDiv && config.clientId) {
        onloadDiv.setAttribute('data-client_id', config.clientId);
        
        // Initialize Google Sign-In after setting client ID
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: config.clientId,
            callback: window.handleCredentialResponse
          });
        }
      }
    } catch (error) {
      console.error('Failed to load Google Client ID:', error);
    }
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close mobile menu when clicking on a nav link
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    }

    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
      this.showMainMenu();
    });

    // Difficulty modal
    document.getElementById('closeDifficultyModal').addEventListener('click', () => {
      this.hideDifficultyModal();
    });

    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const difficulty = e.currentTarget.dataset.difficulty;
        this.startGame(this.currentGameType, difficulty);
        this.hideDifficultyModal();
      });
    });

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  }

  showMainMenu() {
    document.getElementById('gameContainer').style.display = 'none';
    document.querySelector('.main').style.display = 'block';
    
    // Clean up current game
    if (this.currentGame) {
      if (typeof this.currentGame.reset === 'function') {
        this.currentGame.reset();
      }
      this.currentGame = null;
    }
    
    this.currentGameType = null;
    this.currentDifficulty = null;
  }

  showDifficultyModal(gameType) {
    this.currentGameType = gameType;
    
    // Update modal content based on game type
    const modal = document.getElementById('difficultyModal');
    const title = modal.querySelector('h2');
    
    switch (gameType) {
      case 'origami':
        title.textContent = 'Select Origami Difficulty';
        break;
      case 'typing':
        title.textContent = 'Select Typing Difficulty';
        break;
      case 'memory':
        title.textContent = 'Select Memory Difficulty';
        break;
    }
    
    modal.style.display = 'flex';
  }

  hideDifficultyModal() {
    document.getElementById('difficultyModal').style.display = 'none';
  }

  startGame(gameType, difficulty) {
    this.currentGameType = gameType;
    this.currentDifficulty = difficulty;
    
    // Hide main menu and show game container
    document.querySelector('.main').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // Update game title
    const gameTitle = document.getElementById('gameTitle');
    const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    switch (gameType) {
      case 'origami':
        gameTitle.textContent = `Origami Master - ${difficultyText}`;
        this.currentGame = new OrigamiGame(difficulty);
        window.origamiGame = this.currentGame;
        break;
      case 'typing':
        gameTitle.textContent = `Speed Typing - ${difficultyText}`;
        this.currentGame = new SpeedTypingGame(difficulty);
        window.typingGame = this.currentGame;
        break;
      case 'memory':
        gameTitle.textContent = `Memory Challenge - ${difficultyText}`;
        this.currentGame = new MemoryGame(difficulty);
        window.memoryGame = this.currentGame;
        break;
    }
    
    // Initialize the game
    if (this.currentGame && typeof this.currentGame.init === 'function') {
      this.currentGame.init();
    }
    
    // Clear game stats initially
    document.getElementById('gameStats').innerHTML = 'Ready to play';
  }

  // Method to handle game completion and stats update
  async updateUserStats() {
    if (auth.isAuthenticated()) {
      try {
        const profile = await api.getUserProfile();
        auth.user = profile;
        auth.updateUI();
      } catch (error) {
        console.error('Failed to update user stats:', error);
      }
    }
  }
}

// Global functions for game selection
function selectGame(gameType) {
  app.showDifficultyModal(gameType);
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});

// Global game instances (will be set when games are started)
window.origamiGame = null;
window.typingGame = null;
window.memoryGame = null;