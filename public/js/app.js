class App {
  constructor() {
    this.currentGame = null;
    this.currentGameType = null;
    this.currentDifficulty = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });

      document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    }

    document.getElementById('backBtn').addEventListener('click', () => {
      this.showMainMenu();
    });

    document.getElementById('closeDifficultyModal').addEventListener('click', () => {
      this.hideDifficultyModal();
    });

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const difficulty = e.currentTarget.dataset.difficulty;
        this.startGame(this.currentGameType, difficulty);
        this.hideDifficultyModal();
      });
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  }

  showMainMenu() {
    document.getElementById('gameContainer').style.display = 'none';
    document.querySelector('.main').style.display = 'block';
    
    if (this.currentGame) {
      if (typeof this.currentGame.cleanup === 'function') {
        this.currentGame.cleanup();
      }
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
    
    const modal = document.getElementById('difficultyModal');
    const title = modal.querySelector('h2');
    
    switch (gameType) {
      case 'balance':
        title.textContent = 'Select Balance Difficulty';
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
    
    document.querySelector('.main').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    const gameTitle = document.getElementById('gameTitle');
    const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    switch (gameType) {
      case 'balance':
        gameTitle.textContent = `Balance It - ${difficultyText}`;
        this.currentGame = new BalanceGame(difficulty);
        window.balanceGame = this.currentGame;
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
    
    if (this.currentGame && typeof this.currentGame.init === 'function') {
      this.currentGame.init();
    }
    
    document.getElementById('gameStats').innerHTML = 'Ready to play';
  }

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

function selectGame(gameType) {
  app.showDifficultyModal(gameType);
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});

window.balanceGame = null;
window.typingGame = null;
window.memoryGame = null;