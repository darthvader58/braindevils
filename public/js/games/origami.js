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
            { type: 'fold', direction: 'horizontal', position: 0.5, description: 'Fold the paper in half horizontally', complexity: 1 },
            { type: 'fold', direction: 'diagonal_corner', position: [0.25, 0.25], description: 'Fold the top corners to meet at center', complexity: 1 },
            { type: 'fold', direction: 'horizontal', position: 0.75, description: 'Fold the bottom flap up', complexity: 1 },
            { type: 'unfold', direction: 'expand', description: 'Open the boat by pulling the sides apart', complexity: 1 }
          ]
        },
        {
          name: 'Simple House',
          steps: [
            { type: 'fold', direction: 'vertical', position: 0.5, description: 'Fold vertically down the middle', complexity: 1 },
            { type: 'fold', direction: 'diagonal1', position: 0.5, description: 'Fold diagonally to form roof', complexity: 1 },
            { type: 'fold', direction: 'horizontal', position: 0.7, description: 'Fold bottom up for base', complexity: 1 },
            { type: 'shape', description: 'Adjust angles to form house shape', complexity: 1 }
          ]
        }
      ],
      medium: [
        {
          name: 'Traditional Crane',
          steps: [
            { type: 'fold', direction: 'diagonal1', position: 0.5, description: 'Valley fold main diagonal', complexity: 2 },
            { type: 'fold', direction: 'diagonal2', position: 0.5, description: 'Valley fold opposite diagonal', complexity: 2 },
            { type: 'fold', direction: 'horizontal', position: 0.5, description: 'Mountain fold horizontally', complexity: 2 },
            { type: 'collapse', direction: 'preliminary_base', description: 'Collapse into preliminary base', complexity: 3 },
            { type: 'petal_fold', direction: 'both_sides', description: 'Petal fold on front and back', complexity: 3 },
            { type: 'reverse_fold', direction: 'neck_tail', description: 'Inside reverse fold for neck and tail', complexity: 3 }
          ]
        },
        {
          name: 'Jumping Frog',
          steps: [
            { type: 'fold', direction: 'horizontal', position: 0.5, description: 'Fold horizontally in half', complexity: 2 },
            { type: 'fold', direction: 'diagonal_legs', position: [0.3, 0.7], description: 'Fold corners for legs', complexity: 2 },
            { type: 'fold', direction: 'accordion', position: [0.4, 0.6], description: 'Create accordion fold for spring', complexity: 3 },
            { type: 'fold', direction: 'tuck', position: 0.8, description: 'Tuck flaps under body', complexity: 2 },
            { type: 'shape', description: 'Shape legs and adjust spring mechanism', complexity: 2 },
            { type: 'final', description: 'Test jumping mechanism', complexity: 1 }
          ]
        }
      ],
      hard: [
        {
          name: 'Complex Rose',
          steps: [
            { type: 'fold', direction: 'diagonal1', position: 0.5, description: 'Primary diagonal valley fold', complexity: 3 },
            { type: 'fold', direction: 'diagonal2', position: 0.5, description: 'Secondary diagonal valley fold', complexity: 3 },
            { type: 'fold', direction: 'grid', position: [0.33, 0.67], description: 'Create grid folds at thirds', complexity: 4 },
            { type: 'twist', angle: 45, description: 'Twist center point 45 degrees', complexity: 4 },
            { type: 'petal_fold', direction: 'radial', description: 'Create radial petal folds', complexity: 4 },
            { type: 'sink_fold', direction: 'center', description: 'Sink fold the center point', complexity: 4 },
            { type: 'curl', direction: 'petals', description: 'Curl petal edges for natural look', complexity: 3 },
            { type: 'final', description: 'Final shaping and stem formation', complexity: 2 }
          ]
        },
        {
          name: 'Dragon',
          steps: [
            { type: 'fold', direction: 'bird_base', description: 'Start with bird base', complexity: 4 },
            { type: 'stretch', direction: 'neck', description: 'Stretch and thin the neck', complexity: 4 },
            { type: 'reverse_fold', direction: 'head', description: 'Inside reverse fold for head', complexity: 4 },
            { type: 'crimp_fold', direction: 'jaw', description: 'Crimp fold to open jaw', complexity: 4 },
            { type: 'fold', direction: 'wings', description: 'Shape wing membranes', complexity: 3 },
            { type: 'segment', direction: 'body', description: 'Create body segments', complexity: 4 },
            { type: 'taper', direction: 'tail', description: 'Taper tail to point', complexity: 3 },
            { type: 'detail', description: 'Add scales and final details', complexity: 4 }
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
            <button class="btn-primary" onclick="window.origamiGame.reset()">Try Again</button>
            <button class="btn-secondary" onclick="app.showDifficultyModal('origami')">Change Difficulty</button>
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
    
    // Draw main paper shape with transformations based on folds
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 2;
    
    // Apply paper transformations based on completed folds
    this.applyPaperTransformations(ctx, size);
    
    // Draw main paper
    ctx.beginPath();
    this.drawTransformedPaper(ctx, size);
    ctx.fill();
    ctx.stroke();
    
    // Add depth and shadow effects for folded areas
    this.drawFoldedAreas(ctx, size);
    
    ctx.restore();
  }

  applyPaperTransformations(ctx, size) {
    // Apply transformations based on completed folds
    this.paperState.folds.forEach((fold, index) => {
      if (fold.step < this.currentStep) {
        this.applyFoldTransformation(ctx, fold, size);
      }
    });
  }

  applyFoldTransformation(ctx, fold, size) {
    ctx.save();
    
    switch (fold.direction) {
      case 'horizontal':
        // Create realistic horizontal fold effect
        const foldY = size * fold.position;
        ctx.translate(0, foldY);
        
        // Create folded paper effect - top part folds over bottom
        if (fold.position < 0.5) {
          // Fold from top
          ctx.scale(1, 1 - fold.position);
          ctx.skewX(Math.PI / 12); // Add slight skew for depth
        } else {
          // Fold from bottom
          ctx.scale(1, fold.position);
          ctx.skewX(-Math.PI / 12);
        }
        ctx.translate(0, -foldY);
        break;
        
      case 'vertical':
        // Create realistic vertical fold effect
        const foldX = size * fold.position;
        ctx.translate(foldX, 0);
        
        if (fold.position < 0.5) {
          // Fold from left
          ctx.scale(1 - fold.position, 1);
          ctx.skewY(Math.PI / 12);
        } else {
          // Fold from right
          ctx.scale(fold.position, 1);
          ctx.skewY(-Math.PI / 12);
        }
        ctx.translate(-foldX, 0);
        break;
        
      case 'diagonal1':
        // Diagonal fold from top-left to bottom-right
        ctx.translate(size/2, size/2);
        ctx.rotate(Math.PI / 4);
        ctx.scale(0.7, 0.7); // Make paper smaller after fold
        ctx.skewX(Math.PI / 8); // Add realistic fold distortion
        ctx.translate(-size/2, -size/2);
        break;
        
      case 'diagonal2':
        // Diagonal fold from top-right to bottom-left
        ctx.translate(size/2, size/2);
        ctx.rotate(-Math.PI / 4);
        ctx.scale(0.7, 0.7);
        ctx.skewX(-Math.PI / 8);
        ctx.translate(-size/2, -size/2);
        break;
        
      case 'diagonal_corner':
        // Corner folds create triangular shapes
        ctx.translate(size/2, size/2);
        ctx.scale(0.8, 0.8);
        ctx.rotate(Math.PI / 6);
        ctx.translate(-size/2, -size/2);
        break;
        
      case 'accordion':
        // Accordion folds create zigzag pattern
        ctx.translate(0, size/2);
        ctx.scale(1, 0.3);
        ctx.translate(0, -size/2);
        break;
        
      case 'preliminary_base':
      case 'bird_base':
        // Complex base folds
        ctx.translate(size/2, size/2);
        ctx.scale(0.6, 0.6);
        ctx.rotate(Math.PI / 8);
        ctx.translate(-size/2, -size/2);
        break;
    }
    
    ctx.restore();
  }

  drawTransformedPaper(ctx, size) {
    // Draw paper shape that changes based on folds
    const complexity = this.paperState.folds.length;
    
    if (complexity === 0) {
      // Original square
      ctx.rect(0, 0, size, size);
    } else if (complexity === 1) {
      // Simple fold - rectangle or triangle
      const firstFold = this.paperState.folds[0];
      if (firstFold.direction === 'horizontal') {
        ctx.rect(0, 0, size, size * firstFold.position);
        ctx.rect(0, size * firstFold.position, size, size * (1 - firstFold.position));
      } else {
        ctx.rect(0, 0, size, size);
      }
    } else {
      // Complex shape based on multiple folds
      this.drawComplexPaperShape(ctx, size);
    }
  }

  drawComplexPaperShape(ctx, size) {
    // Create a more complex shape based on fold history
    const folds = this.paperState.folds;
    
    ctx.beginPath();
    
    if (folds.length === 0) {
      // Original square
      ctx.rect(0, 0, size, size);
      return;
    }
    
    // Create shape that progressively resembles the target craft
    const targetName = this.currentPattern.name.toLowerCase();
    const progress = folds.length / this.totalSteps;
    
    if (targetName.includes('boat')) {
      this.drawBoatShape(ctx, size, progress);
    } else if (targetName.includes('crane')) {
      this.drawCraneShape(ctx, size, progress);
    } else if (targetName.includes('house')) {
      this.drawHouseShape(ctx, size, progress);
    } else if (targetName.includes('frog')) {
      this.drawFrogShape(ctx, size, progress);
    } else if (targetName.includes('rose')) {
      this.drawRoseShape(ctx, size, progress);
    } else if (targetName.includes('dragon')) {
      this.drawDragonShape(ctx, size, progress);
    } else {
      // Default progressive folding shape
      this.drawProgressiveShape(ctx, size, progress);
    }
  }
  
  drawBoatShape(ctx, size, progress) {
    const width = size * (1 - progress * 0.3);
    const height = size * (0.6 + progress * 0.2);
    const x = (size - width) / 2;
    const y = (size - height) / 2;
    
    // Boat hull
    ctx.moveTo(x, y + height);
    ctx.quadraticCurveTo(x + width/2, y + height - 20, x + width, y + height);
    ctx.lineTo(x + width * 0.8, y + height * 0.3);
    ctx.lineTo(x + width * 0.2, y + height * 0.3);
    ctx.closePath();
  }
  
  drawCraneShape(ctx, size, progress) {
    const centerX = size / 2;
    const centerY = size / 2;
    const wingSpan = size * (0.3 + progress * 0.4);
    
    // Crane body and wings
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX - wingSpan/2, centerY);
    ctx.lineTo(centerX - wingSpan/4, centerY + 30);
    ctx.lineTo(centerX, centerY + 10);
    ctx.lineTo(centerX + wingSpan/4, centerY + 30);
    ctx.lineTo(centerX + wingSpan/2, centerY);
    ctx.closePath();
    
    // Neck
    if (progress > 0.5) {
      ctx.moveTo(centerX, centerY - 20);
      ctx.lineTo(centerX - 10, centerY - 40);
      ctx.lineTo(centerX - 5, centerY - 50);
    }
  }
  
  drawHouseShape(ctx, size, progress) {
    const width = size * 0.6;
    const height = size * 0.7;
    const x = (size - width) / 2;
    const y = (size - height) / 2;
    
    // House base
    ctx.rect(x, y + height * 0.4, width, height * 0.6);
    
    // Roof (appears as folding progresses)
    if (progress > 0.3) {
      ctx.moveTo(x, y + height * 0.4);
      ctx.lineTo(x + width/2, y);
      ctx.lineTo(x + width, y + height * 0.4);
    }
  }
  
  drawFrogShape(ctx, size, progress) {
    const centerX = size / 2;
    const centerY = size / 2;
    const bodyWidth = size * (0.4 + progress * 0.2);
    const bodyHeight = size * (0.3 + progress * 0.1);
    
    // Frog body
    ctx.ellipse(centerX, centerY, bodyWidth/2, bodyHeight/2, 0, 0, 2 * Math.PI);
    
    // Legs (appear as folding progresses)
    if (progress > 0.4) {
      // Front legs
      ctx.ellipse(centerX - bodyWidth/3, centerY + bodyHeight/3, 15, 8, 0, 0, 2 * Math.PI);
      ctx.ellipse(centerX + bodyWidth/3, centerY + bodyHeight/3, 15, 8, 0, 0, 2 * Math.PI);
      
      // Back legs
      ctx.ellipse(centerX - bodyWidth/2, centerY - bodyHeight/4, 20, 12, 0, 0, 2 * Math.PI);
      ctx.ellipse(centerX + bodyWidth/2, centerY - bodyHeight/4, 20, 12, 0, 0, 2 * Math.PI);
    }
  }
  
  drawRoseShape(ctx, size, progress) {
    const centerX = size / 2;
    const centerY = size / 2;
    const petalCount = Math.floor(4 + progress * 4);
    const radius = size * (0.2 + progress * 0.2);
    
    // Rose petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 2 * Math.PI) / petalCount;
      const petalX = centerX + Math.cos(angle) * radius;
      const petalY = centerY + Math.sin(angle) * radius;
      
      ctx.moveTo(centerX, centerY);
      ctx.quadraticCurveTo(
        petalX + Math.cos(angle + Math.PI/2) * 10,
        petalY + Math.sin(angle + Math.PI/2) * 10,
        petalX,
        petalY
      );
      ctx.quadraticCurveTo(
        petalX + Math.cos(angle - Math.PI/2) * 10,
        petalY + Math.sin(angle - Math.PI/2) * 10,
        centerX,
        centerY
      );
    }
  }
  
  drawDragonShape(ctx, size, progress) {
    const centerX = size / 2;
    const centerY = size / 2;
    const bodyLength = size * (0.3 + progress * 0.4);
    
    // Dragon body (serpentine)
    ctx.moveTo(centerX - bodyLength/2, centerY);
    ctx.quadraticCurveTo(centerX - bodyLength/4, centerY - 30, centerX, centerY);
    ctx.quadraticCurveTo(centerX + bodyLength/4, centerY + 30, centerX + bodyLength/2, centerY);
    
    // Wings (appear later in folding)
    if (progress > 0.6) {
      ctx.moveTo(centerX - 20, centerY - 10);
      ctx.lineTo(centerX - 40, centerY - 30);
      ctx.lineTo(centerX - 30, centerY + 10);
      
      ctx.moveTo(centerX + 20, centerY - 10);
      ctx.lineTo(centerX + 40, centerY - 30);
      ctx.lineTo(centerX + 30, centerY + 10);
    }
    
    // Head (appears at the end)
    if (progress > 0.8) {
      ctx.moveTo(centerX + bodyLength/2, centerY);
      ctx.lineTo(centerX + bodyLength/2 + 20, centerY - 10);
      ctx.lineTo(centerX + bodyLength/2 + 15, centerY + 10);
    }
  }
  
  drawProgressiveShape(ctx, size, progress) {
    // Default progressive shape that gets more complex
    const complexity = Math.floor(progress * 6) + 3;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * (0.3 - progress * 0.1);
    
    ctx.moveTo(centerX + radius, centerY);
    
    for (let i = 1; i <= complexity; i++) {
      const angle = (i * 2 * Math.PI) / complexity;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.lineTo(x, y);
    }
    
    ctx.closePath();
  }

  drawFoldedAreas(ctx, size) {
    // Draw shadow and highlight effects for folded areas
    this.paperState.folds.forEach((fold, index) => {
      if (fold.step < this.currentStep) {
        this.drawFoldShadow(ctx, fold, size);
      }
    });
  }

  drawFoldShadow(ctx, fold, size) {
    ctx.save();
    
    // Create shadow effect along fold lines
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.3;
    
    switch (fold.direction) {
      case 'horizontal':
        const y = size * fold.position;
        ctx.fillRect(0, y - 5, size, 10);
        break;
      case 'vertical':
        const x = size * fold.position;
        ctx.fillRect(x - 5, 0, 10, size);
        break;
      case 'diagonal1':
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, size);
        ctx.lineTo(size - 10, size);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();
        break;
      case 'diagonal2':
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(10, size);
        ctx.lineTo(size, 10);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
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
    if (!currentStepData) return;
    
    const ctx = this.ctx;
    const size = 300;
    const offsetX = (this.canvas.width - size) / 2;
    const offsetY = (this.canvas.height - size) / 2;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // Draw guide line with animation based on complexity
    const complexity = currentStepData.complexity || 1;
    ctx.strokeStyle = complexity > 3 ? '#dc3545' : complexity > 2 ? '#f59e0b' : '#28a745';
    ctx.lineWidth = 2 + complexity;
    ctx.setLineDash([15, 10]);
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    
    this.drawComplexFoldGuide(ctx, currentStepData, size);
    
    ctx.stroke();
    ctx.restore();
  }

  drawComplexFoldGuide(ctx, stepData, size) {
    switch (stepData.direction) {
      case 'horizontal':
        const y = size * stepData.position;
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        break;
      case 'vertical':
        const x = size * stepData.position;
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
      case 'diagonal_corner':
        // Multiple corner folds
        if (Array.isArray(stepData.position)) {
          stepData.position.forEach(pos => {
            ctx.moveTo(pos * size, 0);
            ctx.lineTo(size / 2, size / 2);
          });
        }
        break;
      case 'grid':
        // Grid pattern for complex folds
        if (Array.isArray(stepData.position)) {
          stepData.position.forEach(pos => {
            // Vertical lines
            ctx.moveTo(pos * size, 0);
            ctx.lineTo(pos * size, size);
            // Horizontal lines
            ctx.moveTo(0, pos * size);
            ctx.lineTo(size, pos * size);
          });
        }
        break;
      case 'radial':
        // Radial pattern for petal folds
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.3;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        }
        break;
      case 'accordion':
        // Accordion fold pattern
        if (Array.isArray(stepData.position)) {
          const [start, end] = stepData.position;
          for (let i = start; i <= end; i += 0.1) {
            const y = size * i;
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
          }
        }
        break;
      case 'preliminary_base':
        // Complex preliminary base pattern
        ctx.moveTo(0, 0);
        ctx.lineTo(size, size);
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size);
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size / 2, size);
        ctx.moveTo(0, size / 2);
        ctx.lineTo(size, size / 2);
        break;
      case 'bird_base':
        // Bird base fold pattern
        const quarter = size / 4;
        ctx.moveTo(quarter, quarter);
        ctx.lineTo(3 * quarter, 3 * quarter);
        ctx.moveTo(3 * quarter, quarter);
        ctx.lineTo(quarter, 3 * quarter);
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size / 2, size);
        break;
      default:
        // Default simple fold
        ctx.moveTo(0, size / 2);
        ctx.lineTo(size, size / 2);
    }
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
    
    // Adjust tolerance based on complexity
    const complexity = stepData.complexity || 1;
    const tolerance = 0.15 - (complexity * 0.02); // Harder folds need more precision
    
    switch (stepData.direction) {
      case 'horizontal':
        return Math.abs(relativeY - stepData.position) < tolerance;
      case 'vertical':
        return Math.abs(relativeX - stepData.position) < tolerance;
      case 'diagonal1':
        return Math.abs(relativeX - relativeY) < tolerance;
      case 'diagonal2':
        return Math.abs(relativeX + relativeY - 1) < tolerance;
      case 'diagonal_corner':
        if (Array.isArray(stepData.position)) {
          return stepData.position.some(pos => 
            Math.abs(relativeX - pos) < tolerance && relativeY < 0.5
          );
        }
        return true;
      case 'grid':
        if (Array.isArray(stepData.position)) {
          return stepData.position.some(pos => 
            Math.abs(relativeX - pos) < tolerance || Math.abs(relativeY - pos) < tolerance
          );
        }
        return true;
      case 'radial':
        // Check if click is near center for radial folds
        const centerDistance = Math.sqrt(Math.pow(relativeX - 0.5, 2) + Math.pow(relativeY - 0.5, 2));
        return centerDistance < 0.3;
      case 'accordion':
      case 'preliminary_base':
      case 'bird_base':
      case 'both_sides':
      case 'neck_tail':
      case 'center':
      case 'petals':
      case 'expand':
        // For complex folds, accept clicks in the center area
        return Math.abs(relativeX - 0.5) < 0.3 && Math.abs(relativeY - 0.5) < 0.3;
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
      step: this.currentStep,
      complexity: stepData.complexity || 1
    });
    
    // Update paper layers and complexity
    this.paperState.layers++;
    
    // Update paper shape based on fold
    this.updatePaperGeometry(stepData);
    
    // Redraw paper with new fold
    this.drawPaper();
    
    // Show fold animation
    this.animateFold(stepData);
  }

  updatePaperGeometry(stepData) {
    // Update the paper's corner positions based on the fold
    switch (stepData.direction) {
      case 'horizontal':
        // Fold affects vertical positioning
        this.paperState.corners = this.paperState.corners.map(corner => ({
          x: corner.x,
          y: corner.y > stepData.position ? stepData.position + (stepData.position - corner.y) : corner.y
        }));
        break;
      case 'vertical':
        // Fold affects horizontal positioning
        this.paperState.corners = this.paperState.corners.map(corner => ({
          x: corner.x > stepData.position ? stepData.position + (stepData.position - corner.x) : corner.x,
          y: corner.y
        }));
        break;
      case 'diagonal1':
        // Diagonal fold from top-left to bottom-right
        this.paperState.corners = this.paperState.corners.map(corner => {
          if (corner.x + corner.y > 1) {
            return { x: 1 - corner.y, y: 1 - corner.x };
          }
          return corner;
        });
        break;
      case 'diagonal2':
        // Diagonal fold from top-right to bottom-left
        this.paperState.corners = this.paperState.corners.map(corner => {
          if (corner.x - corner.y > 0) {
            return { x: corner.y, y: corner.x };
          }
          return corner;
        });
        break;
    }
  }

  animateFold(stepData) {
    // Enhanced animation based on fold complexity
    const complexity = stepData.complexity || 1;
    const duration = 200 + (complexity * 100);
    
    this.canvas.style.transform = `scale(${1 + complexity * 0.02}) rotate(${complexity}deg)`;
    this.canvas.style.filter = `brightness(${1 + complexity * 0.1})`;
    
    setTimeout(() => {
      this.canvas.style.transform = 'scale(1) rotate(0deg)';
      this.canvas.style.filter = 'brightness(1)';
    }, duration);
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
      const currentStepData = this.currentPattern.steps[this.currentStep];
      
      // Automatically perform the fold for the user
      this.performFold(currentStepData);
      this.currentStep++;
      this.score += Math.floor(50 / this.totalSteps); // Reduced score for using hint
      this.updateProgress();
      this.updateCurrentStep();
      
      // Show hint feedback
      const instructionElement = document.getElementById('currentInstruction');
      instructionElement.style.background = 'var(--success)';
      instructionElement.style.color = 'white';
      instructionElement.querySelector('.instruction-text').textContent = 'Hint used! Fold completed automatically.';
      
      setTimeout(() => {
        instructionElement.style.background = '';
        instructionElement.style.color = '';
        if (this.currentStep < this.totalSteps) {
          const nextStepData = this.currentPattern.steps[this.currentStep];
          instructionElement.querySelector('.instruction-text').textContent = nextStepData.description;
        }
      }, 2000);
      
      if (this.currentStep >= this.totalSteps) {
        this.complete();
      }
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