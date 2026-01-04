class MemoryGame {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.gridSize = this.getDifficultyGridSize();
    this.memoryTime = this.getDifficultyMemoryTime();
    this.recallTime = this.getDifficultyRecallTime();
    this.shapes = ['star', 'square', 'circle', 'triangle'];
    this.originalGrid = [];
    this.userInputs = [];
    this.currentPhase = 'ready'; // ready, memorize, recall, results
    this.score = 0;
    this.timerInterval = null;
    this.timeLeft = 0;
    this.gameActive = false;
  }

  getDifficultyGridSize() {
    switch (this.difficulty) {
      case 'easy': return 2; // 2x2
      case 'medium': return 3; // 3x3
      case 'hard': return 4; // 4x4
      default: return 2;
    }
  }

  getDifficultyMemoryTime() {
    switch (this.difficulty) {
      case 'easy': return 5; // 5 seconds
      case 'medium': return 4; // 4 seconds
      case 'hard': return 3; // 3 seconds
      default: return 5;
    }
  }

  getDifficultyRecallTime() {
    switch (this.difficulty) {
      case 'easy': return 30; // 30 seconds
      case 'medium': return 25; // 25 seconds
      case 'hard': return 20; // 20 seconds
      default: return 30;
    }
  }

  init() {
    this.setupUI();
    this.initializeGrid();
  }

  setupUI() {
    const gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = `
      <div class="memory-workspace">
        <div class="game-phase">
          <h2 class="phase-title" id="phaseTitle">Memory Challenge</h2>
          <p class="phase-description" id="phaseDescription">
            Memorize the shapes and their positions, then recall them correctly.
          </p>
        </div>

        <div class="countdown" id="countdown" style="display: none;">3</div>

        <div class="memory-grid grid-${this.gridSize}x${this.gridSize}" id="memoryGrid">
          <!-- Grid cells will be generated here -->
        </div>

        <div class="shape-reference" id="shapeReference" style="display: none;">
          <div class="reference-item">
            <div class="shape reference-shape shape-star"></div>
            <div class="reference-number">1</div>
          </div>
          <div class="reference-item">
            <div class="shape reference-shape shape-square"></div>
            <div class="reference-number">2</div>
          </div>
          <div class="reference-item">
            <div class="shape reference-shape shape-circle"></div>
            <div class="reference-number">3</div>
          </div>
          <div class="reference-item">
            <div class="shape reference-shape shape-triangle"></div>
            <div class="reference-number">4</div>
          </div>
        </div>

        <div class="game-controls">
          <button class="btn-primary" id="startBtn">Start Challenge</button>
          <button class="btn-secondary" id="resetBtn" style="display: none;">Reset</button>
        </div>

        <div id="resultsPanel" class="results-panel" style="display: none;">
          <h3 class="results-title">Challenge Complete!</h3>
          <div class="results-stats">
            <div class="result-stat">
              <h4>Score</h4>
              <div class="result-value" id="finalScore">0/4</div>
            </div>
            <div class="result-stat">
              <h4>Accuracy</h4>
              <div class="result-value" id="finalAccuracy">0%</div>
            </div>
            <div class="result-stat">
              <h4>Time Bonus</h4>
              <div class="result-value" id="timeBonus">0</div>
            </div>
            <div class="result-stat">
              <h4>Total Score</h4>
              <div class="result-value" id="totalScore">0</div>
            </div>
          </div>
          <button class="btn-primary" onclick="window.memoryGame.reset()">Play Again</button>
          <button class="btn-secondary" onclick="app.showDifficultyModal('memory')">Change Difficulty</button>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
  }

  initializeGrid() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    
    // Generate random shapes for grid
    this.originalGrid = [];
    const totalCells = this.gridSize * this.gridSize;
    
    for (let i = 0; i < totalCells; i++) {
      const randomShape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
      this.originalGrid.push(randomShape);
    }
    
    // Create grid cells
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'memory-cell';
      cell.dataset.index = i;
      grid.appendChild(cell);
    }
    
    this.userInputs = new Array(totalCells).fill(null);
  }

  start() {
    this.gameActive = true;
    this.currentPhase = 'countdown';
    this.score = 0;
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'inline-block';
    document.getElementById('resultsPanel').style.display = 'none';
    
    this.updatePhase();
    this.startCountdown();
  }

  startCountdown() {
    const countdownElement = document.getElementById('countdown');
    countdownElement.style.display = 'block';
    
    let count = 3;
    countdownElement.textContent = count;
    
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownElement.textContent = count;
      } else {
        clearInterval(countdownInterval);
        countdownElement.style.display = 'none';
        this.startMemorizePhase();
      }
    }, 1000);
  }

  startMemorizePhase() {
    this.currentPhase = 'memorize';
    this.timeLeft = this.memoryTime;
    this.updatePhase();
    
    // Show shapes
    const cells = document.querySelectorAll('.memory-cell');
    cells.forEach((cell, index) => {
      cell.classList.add('revealed');
      const shape = document.createElement('div');
      shape.className = `shape shape-${this.originalGrid[index]}`;
      cell.appendChild(shape);
    });
    
    this.startTimer(() => {
      this.startRecallPhase();
    });
  }

  startRecallPhase() {
    this.currentPhase = 'recall';
    this.timeLeft = this.recallTime;
    this.updatePhase();
    
    // Hide shapes and show input fields
    const cells = document.querySelectorAll('.memory-cell');
    cells.forEach((cell, index) => {
      cell.innerHTML = '';
      cell.classList.remove('revealed');
      cell.classList.add('input-mode');
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'input-cell';
      input.maxLength = 1;
      input.placeholder = '?';
      input.dataset.index = index;
      input.addEventListener('input', (e) => this.handleInput(e));
      input.addEventListener('keydown', (e) => this.handleKeyDown(e));
      cell.appendChild(input);
    });
    
    // Show shape reference
    document.getElementById('shapeReference').style.display = 'flex';
    
    // Focus first input
    if (cells[0]) {
      const firstInput = cells[0].querySelector('input');
      if (firstInput) firstInput.focus();
    }
    
    this.startTimer(() => {
      this.complete();
    });
  }

  handleInput(event) {
    const input = event.target;
    const value = input.value;
    const index = parseInt(input.dataset.index);
    
    // Only allow numbers 1-4
    if (!/^[1-4]$/.test(value)) {
      input.value = '';
      return;
    }
    
    // Store user input
    this.userInputs[index] = parseInt(value);
    
    // Check if all inputs are filled
    const totalCells = this.gridSize * this.gridSize;
    const filledInputs = this.userInputs.filter(input => input !== null).length;
    
    if (filledInputs === totalCells) {
      setTimeout(() => {
        this.checkAnswers();
      }, 500);
    }
  }

  handleKeyDown(event) {
    const input = event.target;
    const index = parseInt(input.dataset.index);
    const totalCells = this.gridSize * this.gridSize;
    
    if (event.key === 'ArrowRight' || event.key === 'Tab') {
      event.preventDefault();
      const nextIndex = (index + 1) % totalCells;
      const nextInput = document.querySelector(`input[data-index="${nextIndex}"]`);
      if (nextInput) nextInput.focus();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (index - 1 + totalCells) % totalCells;
      const prevInput = document.querySelector(`input[data-index="${prevIndex}"]`);
      if (prevInput) prevInput.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + this.gridSize) % totalCells;
      const nextInput = document.querySelector(`input[data-index="${nextIndex}"]`);
      if (nextInput) nextInput.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - this.gridSize + totalCells) % totalCells;
      const prevInput = document.querySelector(`input[data-index="${prevIndex}"]`);
      if (prevInput) prevInput.focus();
    }
  }

  checkAnswers() {
    const cells = document.querySelectorAll('.memory-cell');
    let correctCount = 0;
    const totalCells = this.gridSize * this.gridSize;
    
    cells.forEach((cell, index) => {
      const userInput = this.userInputs[index];
      const correctShape = this.originalGrid[index];
      const correctNumber = this.shapes.indexOf(correctShape) + 1;
      
      // Clear previous content
      cell.innerHTML = '';
      cell.classList.remove('input-mode');
      
      if (userInput === correctNumber) {
        cell.classList.add('correct');
        correctCount++;
        
        // Show correct shape
        const shape = document.createElement('div');
        shape.className = `shape shape-${correctShape}`;
        cell.appendChild(shape);
      } else {
        cell.classList.add('incorrect');
        
        // Show correct shape with reduced opacity
        const shape = document.createElement('div');
        shape.className = `shape shape-${correctShape}`;
        shape.style.opacity = '0.6';
        cell.appendChild(shape);
        
        // Show what user entered
        const userAnswer = document.createElement('div');
        userAnswer.style.position = 'absolute';
        userAnswer.style.top = '5px';
        userAnswer.style.right = '5px';
        userAnswer.style.background = 'var(--error)';
        userAnswer.style.color = 'white';
        userAnswer.style.borderRadius = '50%';
        userAnswer.style.width = '20px';
        userAnswer.style.height = '20px';
        userAnswer.style.display = 'flex';
        userAnswer.style.alignItems = 'center';
        userAnswer.style.justifyContent = 'center';
        userAnswer.style.fontSize = '0.75rem';
        userAnswer.style.fontWeight = 'bold';
        userAnswer.textContent = userInput || '?';
        cell.appendChild(userAnswer);
      }
    });
    
    this.score = correctCount;
    setTimeout(() => {
      this.complete();
    }, 2000);
  }

  complete() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    this.currentPhase = 'results';
    this.updatePhase();
    
    const totalCells = this.gridSize * this.gridSize;
    const accuracy = Math.round((this.score / totalCells) * 100);
    const timeBonus = Math.max(0, Math.floor(this.timeLeft));
    const totalScore = (this.score * 25) + timeBonus;
    
    document.getElementById('finalScore').textContent = `${this.score}/${totalCells}`;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('timeBonus').textContent = timeBonus;
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('resultsPanel').style.display = 'block';
    
    // Hide shape reference
    document.getElementById('shapeReference').style.display = 'none';
    
    // Save game session if user is authenticated
    if (auth.isAuthenticated()) {
      this.saveGameSession(totalScore, accuracy);
    }
  }

  async saveGameSession(totalScore, accuracy) {
    try {
      const duration = this.memoryTime + this.recallTime - this.timeLeft;
      await api.saveGameSession({
        gameType: 'memoryGame',
        difficulty: this.difficulty,
        score: totalScore,
        duration: duration,
        accuracy: accuracy,
        gameData: {
          gridSize: this.gridSize,
          correctAnswers: this.score,
          totalQuestions: this.gridSize * this.gridSize,
          timeBonus: Math.max(0, Math.floor(this.timeLeft))
        }
      });
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  }

  startTimer(callback) {
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      
      // Update game stats in header
      const gameStats = document.getElementById('gameStats');
      gameStats.innerHTML = `
        Phase: ${this.currentPhase} | 
        Time: ${this.timeLeft.toFixed(1)}s | 
        Score: ${this.score}
      `;
      
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        callback();
      }
    }, 100);
  }

  updatePhase() {
    const phaseTitle = document.getElementById('phaseTitle');
    const phaseDescription = document.getElementById('phaseDescription');
    
    switch (this.currentPhase) {
      case 'countdown':
        phaseTitle.textContent = 'Get Ready!';
        phaseDescription.textContent = 'Prepare to memorize the shapes and their positions.';
        break;
      case 'memorize':
        phaseTitle.textContent = 'Memorize Phase';
        phaseDescription.textContent = 'Study the shapes and remember their positions.';
        break;
      case 'recall':
        phaseTitle.textContent = 'Recall Phase';
        phaseDescription.textContent = 'Enter the numbers corresponding to each shape position.';
        break;
      case 'results':
        phaseTitle.textContent = 'Results';
        phaseDescription.textContent = 'See how well you remembered the pattern!';
        break;
    }
    
    // Update game stats in header
    const gameStats = document.getElementById('gameStats');
    gameStats.innerHTML = `
      Phase: ${this.currentPhase} | 
      Grid: ${this.gridSize}x${this.gridSize} | 
      Score: ${this.score}
    `;
  }

  reset() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    this.currentPhase = 'ready';
    this.score = 0;
    this.timeLeft = 0;
    
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('resultsPanel').style.display = 'none';
    document.getElementById('shapeReference').style.display = 'none';
    document.getElementById('countdown').style.display = 'none';
    
    document.getElementById('phaseTitle').textContent = 'Memory Challenge';
    document.getElementById('phaseDescription').textContent = 'Memorize the shapes and their positions, then recall them correctly.';
    
    // Update game stats in header
    const gameStats = document.getElementById('gameStats');
    gameStats.innerHTML = `
      Phase: ready | 
      Grid: ${this.gridSize}x${this.gridSize} | 
      Score: 0
    `;
    
    this.initializeGrid();
  }
}

// Global instance
let memoryGame;