class BalanceGame {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.stickLength = this.getDifficultyStickLength();
    this.sensitivityIncreaseInterval = this.getDifficultySensitivityInterval();
    this.gameActive = false;
    this.startTime = null;
    this.score = 0;
    this.ballPosition = 0; // -1 to 1, 0 is center
    this.ballVelocity = 0;
    this.sensitivity = 1;
    this.gameTime = 0;
    this.animationFrame = null;
    this.sensitivityTimer = null;
    this.canvas = null;
    this.ctx = null;
    this.keys = {};
    this.keyPressTime = {};
    this.mouseX = 0;
    this.touchX = 0;
    this.isTouching = false;
    this.controlMethod = 'keyboard'; // 'mouse' or 'keyboard'
    
    // Physics variables
    this.stickAngle = 0; // Current rotation angle of the stick
    this.stickAngularVelocity = 0; // Angular velocity of the stick
  }

  getDifficultyStickLength() {
    switch (this.difficulty) {
      case 'easy': return 200; // Reduced from 300 to 100 (300 * 0.333)
      case 'medium': return 130; // Reduced from 200 to 67 (200 * 0.333)
      case 'hard': return 75; // Reduced from 120 to 40 (120 * 0.333)
      default: return 150;
    }
  }

  getDifficultySensitivityInterval() {
    switch (this.difficulty) {
      case 'easy': return 10000; // Every 10 seconds
      case 'medium': return 7000; // Every 7 seconds
      case 'hard': return 5000; // Every 5 seconds
      default: return 10000;
    }
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
  }

  setupUI() {
    const gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = `
      <div class="balance-workspace">
        <div class="game-info">
          <h2>Balance It!</h2>
          <p>Keep the ball balanced on the stick. Use your mouse to tilt the stick or arrow keys.</p>
          <div class="game-stats-grid">
            <div class="stat-card">
              <h4>Time</h4>
              <div class="stat-value" id="gameTime">0.0s</div>
            </div>
            <div class="stat-card">
              <h4>Sensitivity</h4>
              <div class="stat-value" id="sensitivityLevel">1x</div>
            </div>
            <div class="stat-card">
              <h4>Score</h4>
              <div class="stat-value" id="currentScore">0</div>
            </div>
          </div>
        </div>

        <div class="balance-game-area">
          <canvas id="balanceCanvas" width="600" height="400"></canvas>
          <div class="control-instructions">
            <p><strong>Controls:</strong> Use ← → arrow keys or A/D keys to tilt the stick</p>
            <p><strong>Goal:</strong> Keep the ball on the stick as long as possible!</p>
            <p id="controlStatus" style="font-size: 0.9em; color: #666; margin-top: 5px;">Press arrow keys or A/D to start the timer</p>
          </div>
        </div>

        <div class="game-controls">
          <button class="btn-primary" id="startBtn">Start Balancing</button>
          <button class="btn-secondary" id="resetBtn" style="display: none;">Reset</button>
          <button class="btn-secondary" id="pauseBtn" style="display: none;">Pause</button>
        </div>

        <div id="resultsPanel" class="results-panel" style="display: none;">
          <h3 class="results-title">Game Over!</h3>
          <div class="results-stats">
            <div class="result-stat">
              <h4>Time Survived</h4>
              <div class="result-value" id="finalTime">0.0s</div>
            </div>
            <div class="result-stat">
              <h4>Max Sensitivity</h4>
              <div class="result-value" id="maxSensitivity">1x</div>
            </div>
            <div class="result-stat">
              <h4>Final Score</h4>
              <div class="result-value" id="finalScore">0</div>
            </div>
          </div>
          <button class="btn-primary" onclick="window.balanceGame.reset()">Play Again</button>
          <button class="btn-secondary" onclick="app.showDifficultyModal('balance')">Change Difficulty</button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('balanceCanvas');
    this.ctx = this.canvas.getContext('2d');
  }

  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());

    // Mouse controls
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.gameActive) return;
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left - this.canvas.width / 2) / (this.canvas.width / 2);
      this.mouseX = Math.max(-1, Math.min(1, this.mouseX));
      this.controlMethod = 'mouse';
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (!this.gameActive) return;
      e.preventDefault();
      this.isTouching = true;
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchX = (touch.clientX - rect.left - this.canvas.width / 2) / (this.canvas.width / 2);
      this.touchX = Math.max(-1, Math.min(1, this.touchX));
      this.controlMethod = 'touch';
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.gameActive || !this.isTouching) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchX = (touch.clientX - rect.left - this.canvas.width / 2) / (this.canvas.width / 2);
      this.touchX = Math.max(-1, Math.min(1, this.touchX));
      this.controlMethod = 'touch';
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isTouching = false;
      this.touchX = 0;
    });

    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.isTouching = false;
      this.touchX = 0;
    });

    // Keyboard controls - attach to document for better responsiveness
    this.keydownHandler = (e) => {
      if (!this.gameActive) return;
      
      this.keys[e.key] = true;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
          e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        this.controlMethod = 'keyboard';
        e.preventDefault();
        e.stopPropagation();
      }
    };

    this.keyupHandler = (e) => {
      this.keys[e.key] = false;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
          e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);

    // Focus management
    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
    });

    // Make canvas focusable and auto-focus when game starts
    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none'; // Remove focus outline
    
    // Auto-focus canvas when mouse enters
    this.canvas.addEventListener('mouseenter', () => {
      if (this.gameActive) {
        this.canvas.focus();
      }
    });

    // Prevent arrow keys from scrolling the page
    window.addEventListener('keydown', (e) => {
      if (this.gameActive && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
      }
    });
  }

  start() {
    this.gameActive = true;
    this.gameStarted = false;
    this.startTime = null;
    this.ballPosition = 0;
    this.ballVelocity = 0;
    this.sensitivity = 1;
    this.gameTime = 0;
    this.score = 0;
    this.stickAngle = 0;
    this.stickAngularVelocity = 0;

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    document.getElementById('resultsPanel').style.display = 'none';

    // Auto-focus canvas for keyboard controls
    setTimeout(() => {
      this.canvas.focus();
    }, 100);

    this.gameLoop();
  }

  startGameTimer() {
    if (!this.gameStarted && this.gameActive) {
      this.gameStarted = true;
      this.startTime = Date.now();
      this.startSensitivityTimer();
    }
  }

  startSensitivityTimer() {
    this.sensitivityTimer = setInterval(() => {
      if (this.gameActive) {
        this.sensitivity += 0.2;
        document.getElementById('sensitivityLevel').textContent = this.sensitivity.toFixed(1) + 'x';
      }
    }, this.sensitivityIncreaseInterval);
  }

  gameLoop() {
    if (!this.gameActive) return;

    this.update();
    this.draw();
    this.updateUI();

    this.animationFrame = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    const deltaTime = 1/60;
    
    if (this.gameStarted && this.startTime) {
      this.gameTime = (Date.now() - this.startTime) / 1000;
    } else {
      this.gameTime = 0;
    }

    let userTorque = 0;
    let baseKeyboardTorque, maxKeyboardTorque;
    
    // Adjust sensitivity based on difficulty to compensate for shorter sticks
    switch (this.difficulty) {
      case 'easy':
        baseKeyboardTorque = 0.08;
        maxKeyboardTorque = 0.4;
        break;
      case 'medium':
        baseKeyboardTorque = 0.05;  // Reduced for shorter stick
        maxKeyboardTorque = 0.25;   // Reduced for shorter stick
        break;
      case 'hard':
        baseKeyboardTorque = 0.03;  // Much reduced for very short stick
        maxKeyboardTorque = 0.15;   // Much reduced for very short stick
        break;
      default:
        baseKeyboardTorque = 0.08;
        maxKeyboardTorque = 0.4;
    }
    
    let hasUserInput = false;
    
    if (this.controlMethod === 'touch' && this.isTouching) {
      hasUserInput = true;
      const maxTouchTorque = maxKeyboardTorque * 3;
      userTorque = this.touchX * maxTouchTorque;
      document.getElementById('controlStatus').textContent = 'Using Touch Controls';
      document.getElementById('controlStatus').style.color = '#4ECDC4';
    } else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      hasUserInput = true;
      let pressTime = 0;
      if (this.keys['ArrowLeft'] && this.keyPressTime['ArrowLeft']) {
        pressTime = (Date.now() - this.keyPressTime['ArrowLeft']) / 1000;
      } else if (this.keys['a'] && this.keyPressTime['a']) {
        pressTime = (Date.now() - this.keyPressTime['a']) / 1000;
      } else if (this.keys['A'] && this.keyPressTime['A']) {
        pressTime = (Date.now() - this.keyPressTime['A']) / 1000;
      }
      const acceleration = Math.min(pressTime * 0.5, 1.5);
      userTorque -= baseKeyboardTorque * (1 + acceleration);
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      hasUserInput = true;
      let pressTime = 0;
      if (this.keys['ArrowRight'] && this.keyPressTime['ArrowRight']) {
        pressTime = (Date.now() - this.keyPressTime['ArrowRight']) / 1000;
      } else if (this.keys['d'] && this.keyPressTime['d']) {
        pressTime = (Date.now() - this.keyPressTime['d']) / 1000;
      } else if (this.keys['D'] && this.keyPressTime['D']) {
        pressTime = (Date.now() - this.keyPressTime['D']) / 1000;
      }
      const acceleration = Math.min(pressTime * 0.8, 2.0);
      userTorque += baseKeyboardTorque * (1 + acceleration);
    }
    
    userTorque = Math.max(-maxKeyboardTorque, Math.min(maxKeyboardTorque, userTorque));
    
    document.getElementById('controlStatus').textContent = 'Using Keyboard Controls (← → or A/D)';
    document.getElementById('controlStatus').style.color = '#FF6B6B';

    if (hasUserInput) {
      this.startGameTimer();
    }

    const gravity = 9.81;
    const ballMass = 0.3 * this.sensitivity;
    const stickMass = 0.02;
    const stickLength = this.stickLength / 100;
    
    const stickInertia = (1/12) * stickMass * (stickLength * stickLength);
    const angularAcceleration = userTorque / Math.max(stickInertia, 0.001);
    
    this.stickAngularVelocity = (this.stickAngularVelocity || 0) + angularAcceleration * deltaTime;
    this.stickAngle = (this.stickAngle || 0) + this.stickAngularVelocity * deltaTime;
    this.stickAngularVelocity *= 0.95;
    
    const maxAngle = Math.PI / 3;
    this.stickAngle = Math.max(-maxAngle, Math.min(maxAngle, this.stickAngle));
    
    const gravityAlongStick = gravity * Math.sin(this.stickAngle);
    const ballAcceleration = gravityAlongStick * this.sensitivity * 0.4;
    
    this.ballVelocity += ballAcceleration * deltaTime;
    this.ballVelocity *= 0.97;
    this.ballPosition += this.ballVelocity * deltaTime;
    
    const stickEdge = 1.0;
    if (Math.abs(this.ballPosition) >= stickEdge) {
      this.gameOver();
      return;
    }

    this.score = Math.floor(this.gameTime * 10);
  }

  draw() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 50, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 4, centerY + 50, 8, 12);

    ctx.save();
    ctx.translate(centerX, centerY + 50);
    ctx.rotate(this.stickAngle || 0);
    
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(-this.stickLength / 2, -3, this.stickLength, 6);
    
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(-this.stickLength / 2, 0, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.stickLength / 2, 0, 5, 0, 2 * Math.PI);
    ctx.fill();

    const ballX = this.ballPosition * (this.stickLength / 2);
    const ballY = -18;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(ballX, 3, 10, 3, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    const ballGradient = ctx.createRadialGradient(ballX - 4, ballY - 4, 0, ballX, ballY, 12);
    ballGradient.addColorStop(0, '#FF6B6B');
    ballGradient.addColorStop(1, '#FF4757');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(ballX - 3, ballY - 3, 3, 0, 2 * Math.PI);
    ctx.fill();

    if (Math.abs(this.ballVelocity) > 0.01) {
      ctx.strokeStyle = '#FF4757';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ballX, ballY + 15);
      const arrowLength = Math.min(Math.abs(this.ballVelocity) * 50, 30);
      const arrowX = ballX + (this.ballVelocity > 0 ? arrowLength : -arrowLength);
      ctx.lineTo(arrowX, ballY + 15);
      
      const headSize = 4;
      const direction = this.ballVelocity > 0 ? 1 : -1;
      ctx.lineTo(arrowX - direction * headSize, ballY + 15 - headSize);
      ctx.moveTo(arrowX, ballY + 15);
      ctx.lineTo(arrowX - direction * headSize, ballY + 15 + headSize);
      ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '14px Inter';
    ctx.fillText(`Difficulty: ${this.difficulty.toUpperCase()}`, 20, 30);
    ctx.fillText(`Stick Length: ${this.stickLength}px`, 20, 50);
    ctx.fillText(`Ball Mass: ${(0.3 * this.sensitivity).toFixed(2)}kg`, 20, 70);
    ctx.fillText(`Stick Angle: ${((this.stickAngle || 0) * 180 / Math.PI).toFixed(1)}°`, 20, 90);
    
    const leftPressed = this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'];
    const rightPressed = this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'];
    ctx.fillText(`Keys: ${leftPressed ? '←' : ''} ${rightPressed ? '→' : ''}`, 20, 110);

    // Draw balance indicator
    const balanceBarWidth = 200;
    const balanceBarHeight = 10;
    const balanceBarX = canvas.width - balanceBarWidth - 20;
    const balanceBarY = 20;

    // Balance bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(balanceBarX, balanceBarY, balanceBarWidth, balanceBarHeight);

    const indicatorX = balanceBarX + (balanceBarWidth / 2) + (this.ballPosition * balanceBarWidth / 2);
    ctx.fillStyle = Math.abs(this.ballPosition) > 0.7 ? '#FF4757' : '#2ED573';
    ctx.fillRect(indicatorX - 2, balanceBarY - 5, 4, balanceBarHeight + 10);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(balanceBarX + balanceBarWidth / 2, balanceBarY - 5);
    ctx.lineTo(balanceBarX + balanceBarWidth / 2, balanceBarY + balanceBarHeight + 5);
    ctx.stroke();

    const torqueBarY = 50;
    ctx.fillText('Torque:', balanceBarX, torqueBarY - 5);
    
    const ballDistanceFromPivot = this.ballPosition * (this.stickLength / 200);
    const gravitationalTorque = 0.1 * this.sensitivity * 9.81 * ballDistanceFromPivot;
    const torqueScale = 50;
    
    ctx.fillStyle = gravitationalTorque > 0 ? '#FF6B6B' : '#4ECDC4';
    const torqueWidth = Math.abs(gravitationalTorque) * torqueScale;
    const torqueX = balanceBarX + balanceBarWidth / 2;
    
    if (gravitationalTorque > 0) {
      ctx.fillRect(torqueX, torqueBarY, Math.min(torqueWidth, balanceBarWidth / 2), 8);
    } else {
      ctx.fillRect(torqueX - Math.min(torqueWidth, balanceBarWidth / 2), torqueBarY, Math.min(torqueWidth, balanceBarWidth / 2), 8);
    }
  }

  updateUI() {
    document.getElementById('gameTime').textContent = this.gameTime.toFixed(1) + 's';
    document.getElementById('currentScore').textContent = this.score;

    const gameStats = document.getElementById('gameStats');
    if (!this.gameStarted && this.gameActive) {
      gameStats.innerHTML = `
        Waiting for input | 
        Sensitivity: ${this.sensitivity.toFixed(1)}x | 
        Score: ${this.score}
      `;
    } else {
      gameStats.innerHTML = `
        Time: ${this.gameTime.toFixed(1)}s | 
        Sensitivity: ${this.sensitivity.toFixed(1)}x | 
        Score: ${this.score}
      `;
    }
  }

  togglePause() {
    this.gameActive = !this.gameActive;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (this.gameActive) {
      pauseBtn.textContent = 'Pause';
      this.startTime = Date.now() - (this.gameTime * 1000);
      this.gameLoop();
    } else {
      pauseBtn.textContent = 'Resume';
      cancelAnimationFrame(this.animationFrame);
    }
  }

  gameOver() {
    this.gameActive = false;
    cancelAnimationFrame(this.animationFrame);
    clearInterval(this.sensitivityTimer);

    document.getElementById('finalTime').textContent = this.gameTime.toFixed(1) + 's';
    document.getElementById('maxSensitivity').textContent = this.sensitivity.toFixed(1) + 'x';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('resultsPanel').style.display = 'block';

    if (auth.isAuthenticated()) {
      this.saveGameSession();
    }
  }

  async saveGameSession() {
    try {
      await api.saveGameSession({
        gameType: 'balance',
        difficulty: this.difficulty,
        score: this.score,
        duration: Math.floor(this.gameTime),
        accuracy: 100,
        gameData: {
          timesSurvived: this.gameTime,
          maxSensitivity: this.sensitivity,
          stickLength: this.stickLength,
          finalBallPosition: this.ballPosition
        }
      });
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  }

  reset() {
    this.gameActive = false;
    this.gameStarted = false;
    cancelAnimationFrame(this.animationFrame);
    clearInterval(this.sensitivityTimer);

    this.ballPosition = 0;
    this.ballVelocity = 0;
    this.sensitivity = 1;
    this.gameTime = 0;
    this.score = 0;
    this.stickAngle = 0;
    this.stickAngularVelocity = 0;
    this.keyPressTime = {};

    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('resultsPanel').style.display = 'none';

    document.getElementById('gameTime').textContent = '0.0s';
    document.getElementById('sensitivityLevel').textContent = '1x';
    document.getElementById('currentScore').textContent = '0';

    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Update game stats in header
    const gameStats = document.getElementById('gameStats');
    gameStats.innerHTML = 'Ready to balance';
  }

  // Clean up method for proper event listener removal
  cleanup() {
    this.gameActive = false;
    cancelAnimationFrame(this.animationFrame);
    clearInterval(this.sensitivityTimer);
    
    // Remove event listeners
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    if (this.keyupHandler) {
      document.removeEventListener('keyup', this.keyupHandler);
    }
  }
}

// Global instance
let balanceGame;