class App {
  constructor() {
    this.currentGame = null;
    this.currentGameType = null;
    this.currentDifficulty = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateGoogleClientId();
  }

  updateGoogleClientId() {
    // In production, this should be set via environment variables
    const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID
    const onloadDiv = document.getElementById('g_id_onload');
    if (onloadDiv) {
      onloadDiv.setAttribute('data-client_id', clientId);
    }
  }

  setupEventListeners() {
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