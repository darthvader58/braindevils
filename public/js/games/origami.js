class OrigamiGame {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.currentStep = 0;
    this.totalSteps = this.getDifficultySteps();
    this.score = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.gameActive = false;
    this.accuracy = 100;
    this.mistakes = 0;
    this.paperState = this.initializePaper();
    this.targetShape = null;
    this.currentInstruction = null;
    
    this.origamiPatterns = {
      easy: [
        {
          name: 'Paper Boat',
          steps: [
            { type: 'fold', direction: 'horizontal', position: 0.5, description: 'Fold the paper in half horizontally' },
            { type: 'fold', direction: 'vertical', position: 0.25, description: 'Fold the top corners to the center' },
            { type: 'fold', direction: 'vertical', position: 0.75, description: 'Fold the other corners to the center' },
            { type: 'unfold', direction: 'horizontal', description: 'Open the boat by pulling the sides apart' }
          ]
        },
        {
          name: 'Simple Crane Base',
          steps: [
            { type: 'fold', direction: 'diagonal1', position: 0.5, description: 'Fold diagonally from top-left to bottom-right' },
            { type: 'fold', direction: 'diagonal2', position: 0.5, description: 'Fold diagonally from top-right to bottom-left' },
            { type: 'fold', direction: 'horizontal', position: 0.5, description: 'Fold horizontally through the center' },
            { type: 'collapse', description: 'Push the sides together to form the preliminary base' }
          ]
        }
      ],
      medium: [
        {
          name: 'Traditional Crane',
          steps: [
            { type: 'fold', direction: 'diagonal1', position: 0.5, description: 'Make a diagonal valley fold' },
            { type: 'fold', direction: 'diagonal2', position: 0.5, description: 'Make the opposite diagonal valley fold' },
            { type: 'fold', direction: 'horizontal', position: 0.5, description: 'Fold horizontally and unfold' },
            { type: 'fold', direction: 'vertical', position: 0.5, description: 'Fold vertically and unfold' },
            { type: 'collapse', description: 'Bring the corners together to form bird base' },
            { type: 'petal_fold', description: 'Make petal folds on both sides' }
          ]
        }
      ],
      hard: [
        {
          name: 'Complex Rose',
          steps: [
            { type: 'fold', direction: 'diagonal1', position: 0.5, description: 'Valley fold diagonally' },
            { type: 'fold', direction: 'diagonal2', position: 0.5, description: 'Valley fold the other diagonal' },
            { type: 'fold', direction: 'horizontal', position: 0.33, description: 'Fold horizontally at 1/3' },
            { type: 'fold', direction: 'horizontal', position: 0.67, description: 'Fold horizontally at 2/3' },
            { type: 'twist', angle: 45, description: 'Twist the center 45 degrees' },
            { type: 'petal_fold', description: 'Create petal folds around the center' },
            { type: 'shape', description: 'Shape the petals by curving edges' },
            { type: 'final', description: 'Final shaping and positioning' }
          ]
        }
      ]
    };
  }

  getDifficultySteps() {
    switch (this.difficulty) {
      case 'easy': return 4;
      case 'medium': return 6;
      case 'hard': return 8;
      default: return 4;
    }
  }

  initializePaper() {
    return {
      folds: [],
      shape: 'square',
      layers: 1,
      corners: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 }
      ]
    };
  }

  init() {
    this.setupUI();
    this.loadPattern();
  }

  setupUI() {
    const gameContent = document.getElementById('gameContent');
    gameContent.innerHTML = `
      <div class="origami-workspace">
        <div class="origami-main">
          <div class="paper-container">
            <canvas id="origamiCanvas" width="400" height="400"></canvas>
            <div class="fold-guides" id="foldGuides"></div>
          </div>
          
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="step-indicator">
              Step <span id="currentStepNum">0</span> of <span id="totalStepsNum">${this.totalSteps}</span>
            </div>
          </div>

          <div class="current-instruction" id="currentInstruction">
            <div class="instruction-text">Click Start to begin your origami journey</div>
          </div>

          <div class="game-controls">
            <button class="btn-primary" id="startBtn">Start Folding</button>
            <button class="btn-secondary" id="resetBtn" style="display: none;">Reset</button>
            <button class="btn-secondary" id="hintBtn" style="display: none;">Show Hint</button>
            <button class="btn-secondary" id="undoBtn" style="display: none;">Undo</button>
          </div>

          <div id="resultsPanel" class="results-panel" style="display: none;">
            <h3 class="results-title">Origami Complete!</h3>
            <div class="results-stats">
              <div class="result-stat">
                <h4>Time</h4>
                <div class="result-value" id="finalTime">0:00</div>
              </div>
              <div class="result-stat">
                <h4>Accuracy</h4>
                <div class="result-value" id="finalAccuracy">100%</div>
              </div>
              <div class="result-stat">
                <h4>Score</h4>
                <div class="result-value" id="finalScore">0</div>
              </div>
            </div>
            <button class="btn-primary" onclick="origamiGame.reset()">Try Again</button>
          </div>
        </div>

        <div class="origami-sidebar">
          <h3>Target Shape</h3>
          <div class="target-shape">
            <div id="targetPattern" class="pattern-name">Loading...</div>
            <div class="pattern-preview" id="patternPreview"></div>
          </div>

          <h3>Instructions</h3>
          <div class="instructions" id="instructionsList">
            <div class="instruction-item">
              <div class="step-number">1</div>
              <div class="step-description">Click Start to begin</div>
            </div>
          </div>

          <div class="fold-legend">
            <h4>Fold Types</h4>
            <div class="legend-item">
              <div class="legend-line valley"></div>
              <span>Valley Fold (dashed)</span>
            </div>
            <div class="legend-item">
              <div class="legend-line mountain"></div>
              <span>Mountain Fold (dash-dot)</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('origamiCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupEventListeners();
    this.drawPaper();
  }

  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
    document.getElementById('undoBtn').addEventListener('click', () => this.undoLastFold());
    
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
  }

  loadPattern() {
    const patterns = this.origamiPatterns[this.difficulty];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    this.currentPattern = pattern;
    this.totalSteps = pattern.steps.length;
    
    document.getElementById('targetPattern').textContent = pattern.name;
    document.getElementById('totalStepsNum').textContent = this.totalSteps;
    this.setupInstructions();
  }

  setupInstructions() {
    const instructionsList = document.getElementById('instructionsList');
    instructionsList.innerHTML = '';

    this.currentPattern.steps.forEach((step, index) => {
      const stepElement = document.createElement('div');
      stepElement.className = 'instruction-item';
      stepElement.innerHTML = `
        <div class="step-number" id="step-${index}">${index + 1}</div>
        <div class="step-description">${step.description}</div>
      `;
      instructionsList.appendChild(stepElement);
    });

    this.updateCurrentStep();
  }

  drawPaper() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up paper styling
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    
    // Draw paper based on current state
    this.drawPaperShape();
    this.drawFoldLines();
    this.drawCurrentFoldGuide();
  }

  drawPaperShape() {
    const ctx = this.ctx;
    const size = 300;
    const offsetX = (this.canvas.width - size) / 2;
    const offsetY = (this.canvas.height - size) / 2;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // Draw main paper shape
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.fill();
    ctx.stroke();
    
    // Add subtle gradient for depth
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  }

  drawFoldLines() {
    const ctx = this.ctx;
    const size = 300;
    const offsetX = (this.canvas.width - size) / 2;
    const offsetY = (this.canvas.height - size) / 2;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // Draw existing fold lines
    this.paperState.folds.forEach(fold => {
      this.drawFoldLine(fold);
    });
    
    ctx.restore();
  }

  drawFoldLine(fold) {
    const ctx = this.ctx;
    const size = 300;
    
    ctx.strokeStyle = fold.type === 'valley' ? '#007bff' : '#dc3545';
    ctx.lineWidth = 2;
    
    if (fold.type === 'valley') {
      ctx.setLineDash([10, 5]);
    } else {
      ctx.setLineDash([10, 5, 2, 5]);
    }
    
    ctx.beginPath();
    
    switch (fold.direction) {
      case 'horizontal':
        const y = size * fold.position;
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        break;
      case 'vertical':
        const x = size * fold.position;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        break;
      case 'diagonal1':
        ctx.moveTo(0, 0);
        ctx.lineTo(size, size);
        break;
      case 'diagonal2':
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size);
        break;
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawCurrentFoldGuide() {
    if (!this.gameActive || this.currentStep >= this.totalSteps) return;
    
    const currentStepData = this.currentPattern.steps[this.currentStep];
    if (!currentStepData || currentStepData.type !== 'fold') return;
    
    const ctx = this.ctx;
    const size = 300;
    const offsetX = (this.canvas.width - size) / 2;
    const offsetY = (this.canvas.height - size) / 2;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // Draw guide line with animation
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 10]);
    ctx.globalAlpha = 0.7;
    
    ctx.beginPath();
    
    switch (currentStepData.direction) {
      case 'horizontal':
        const y = size * currentStepData.position;
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        break;
      case 'vertical':
        const x = size * currentStepData.position;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        break;
      case 'diagonal1':
        ctx.moveTo(0, 0);
        ctx.lineTo(size, size);
        break;
      case 'diagonal2':
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size);
        break;
    }
    
    ctx.stroke();
    ctx.restore();
  }

  handleCanvasClick(event) {
    if (!this.gameActive || this.currentStep >= this.totalSteps) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const currentStepData = this.currentPattern.steps[this.currentStep];
    
    if (this.isValidFoldClick(x, y, currentStepData)) {
      this.performFold(currentStepData);
      this.currentStep++;
      this.score += Math.floor(100 / this.totalSteps);
      this.updateProgress();
      this.updateCurrentStep();
      
      if (this.currentStep >= this.totalSteps) {
        this.complete();
      }
    } else {
      this.handleIncorrectClick();
    }
  }

  isValidFoldClick(x, y, stepData) {
    const size = 300;
    const offsetX = (this.canvas.width - size) / 2;
    const offsetY = (this.canvas.height - size) / 2;
    
    const relativeX = (x - offsetX) / size;
    const relativeY = (y - offsetY) / size;
    
    const tolerance = 0.1;
    
    switch (stepData.direction) {
      case 'horizontal':
        return Math.abs(relativeY - stepData.position) < tolerance;
      case 'vertical':
        return Math.abs(relativeX - stepData.position) < tolerance;
      case 'diagonal1':
        return Math.abs(relativeX - relativeY) < tolerance;
      case 'diagonal2':
        return Math.abs(relativeX + relativeY - 1) < tolerance;
      default:
        return true; // For special folds like collapse, petal_fold, etc.
    }
  }

  performFold(stepData) {
    // Add fold to paper state
    this.paperState.folds.push({
      type: stepData.type === 'fold' ? 'valley' : 'mountain',
      direction: stepData.direction,
      position: stepData.position || 0.5,
      step: this.currentStep
    });
    
    // Update paper layers and complexity
    this.paperState.layers++;
    
    // Redraw paper with new fold
    this.drawPaper();
    
    // Show fold animation
    this.animateFold();
  }

  animateFold() {
    // Simple animation effect
    this.canvas.style.transform = 'scale(1.05)';
    setTimeout(() => {
      this.canvas.style.transform = 'scale(1)';
    }, 200);
  }

  handleIncorrectClick() {
    this.mistakes++;
    this.accuracy = Math.max(0, Math.floor(((this.totalSteps - this.mistakes) / this.totalSteps) * 100));
    
    // Visual feedback for incorrect click
    this.canvas.style.filter = 'hue-rotate(180deg)';
    setTimeout(() => {
      this.canvas.style.filter = 'none';
    }, 300);
  }

  handleCanvasHover(event) {
    if (!this.gameActive) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const currentStepData = this.currentPattern.steps[this.currentStep];
    
    if (this.isValidFoldClick(x, y, currentStepData)) {
      this.canvas.style.cursor = 'pointer';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  updateCurrentStep() {
    // Update step indicators
    this.currentPattern.steps.forEach((step, index) => {
      const stepNumber = document.getElementById(`step-${index}`);
      if (!stepNumber) return;
      
      stepNumber.className = 'step-number';
      
      if (index < this.currentStep) {
        stepNumber.classList.add('completed');
      } else if (index === this.currentStep) {
        stepNumber.classList.add('current');
      }
    });
    
    // Update current instruction
    const instructionElement = document.getElementById('currentInstruction');
    if (this.currentStep < this.totalSteps) {
      const currentStepData = this.currentPattern.steps[this.currentStep];
      instructionElement.querySelector('.instruction-text').textContent = currentStepData.description;
    }
    
    document.getElementById('currentStepNum').textContent = this.currentStep;
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const percentage = (this.currentStep / this.totalSteps) * 100;
    progressFill.style.width = `${percentage}%`;
    
    // Update game stats in header
    const gameStats = document.getElementById('gameStats');
    const elapsed = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    gameStats.innerHTML = `
      Time: ${minutes}:${seconds.toString().padStart(2, '0')} | 
      Progress: ${this.currentStep}/${this.totalSteps} | 
      Accuracy: ${this.accuracy}%
    `;
  }

  start() {
    this.gameActive = true;
    this.startTime = Date.now();
    this.currentStep = 0;
    this.score = 0;
    this.mistakes = 0;
    this.accuracy = 100;
    this.paperState = this.initializePaper();
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'inline-block';
    document.getElementById('hintBtn').style.display = 'inline-block';
    document.getElementById('undoBtn').style.display = 'inline-block';
    document.getElementById('resultsPanel').style.display = 'none';
    
    this.updateCurrentStep();
    this.startTimer();
    this.updateProgress();
    this.drawPaper();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.updateProgress();
    }, 1000);
  }

  showHint() {
    if (this.currentStep < this.totalSteps) {
      // Highlight the current fold area
      this.drawCurrentFoldGuide();
      
      // Flash the instruction
      const instructionElement = document.getElementById('currentInstruction');
      instructionElement.style.background = 'var(--warning)';
      instructionElement.style.color = 'white';
      
      setTimeout(() => {
        instructionElement.style.background = '';
        instructionElement.style.color = '';
      }, 1000);
    }
  }

  undoLastFold() {
    if (this.paperState.folds.length > 0 && this.currentStep > 0) {
      this.paperState.folds.pop();
      this.paperState.layers--;
      this.currentStep--;
      this.updateCurrentStep();
      this.updateProgress();
      this.drawPaper();
    }
  }

  complete() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    // Calculate final score with time bonus
    const timeBonus = Math.max(0, 100 - elapsed);
    const finalScore = this.score + timeBonus + (this.accuracy - 100);
    
    document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('finalAccuracy').textContent = `${this.accuracy}%`;
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('resultsPanel').style.display = 'block';
    
    // Save game session if user is authenticated
    if (auth.isAuthenticated()) {
      this.saveGameSession(finalScore, elapsed);
    }
  }

  async saveGameSession(finalScore, duration) {
    try {
      await api.saveGameSession({
        gameType: 'origami',
        difficulty: this.difficulty,
        score: finalScore,
        duration: duration,
        accuracy: this.accuracy,
        gameData: {
          pattern: this.currentPattern.name,
          mistakes: this.mistakes,
          stepsCompleted: this.currentStep,
          folds: this.paperState.folds.length
        }
      });
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  }

  reset() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    
    this.currentStep = 0;
    this.score = 0;
    this.mistakes = 0;
    this.accuracy = 100;
    this.paperState = this.initializePaper();
    
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('hintBtn').style.display = 'none';
    document.getElementById('undoBtn').style.display = 'none';
    document.getElementById('resultsPanel').style.display = 'none';
    
    this.loadPattern();
    this.updateProgress();
    this.drawPaper();
  }
}

// Global instance
let origamiGame;