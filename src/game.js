class Game {
  constructor(canvasId, mazeWidth = 20, mazeHeight = 20, cellSize = 20) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Game configuration
    this.mazeWidth = mazeWidth;
    this.mazeHeight = mazeHeight;
    this.cellSize = cellSize;
    this.keyCount = 3;
    
    // Set canvas size
    this.canvas.width = this.mazeWidth * this.cellSize;
    this.canvas.height = this.mazeHeight * this.cellSize;
    
    this.init();
  }
  
  init() {
    // Initialize maze
    this.maze = new Maze(this.mazeWidth, this.mazeHeight, this.cellSize);
    
    // Initialize player at the entry point (top-left)
    this.player = new Player(this.maze, 0, 0);
    
    // Initialize collectibles
    this.collectibles = new Collectibles(this.maze, this.keyCount);
    
    // Set up event listeners
    this.setupInput();
    
    // Pixelated boot screen animation
    this.showBootSequence(() => {
      // Start game loop after boot animation
      this.lastTime = 0;
      requestAnimationFrame(this.gameLoop.bind(this));
    });
  }
  
  // Show pixelated boot sequence animation
  showBootSequence(callback) {
    this.ctx.fillStyle = '#0a0a12';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#9acdff';
    this.ctx.font = '20px VT323, monospace';
    this.ctx.textAlign = 'center';
    
    const bootText = [
      'LOADING FOG OF WAR SYSTEM',
      'INITIALIZING MAZE GENERATORS',
      'CALIBRATING VISIBILITY CALCULATIONS',
      'RENDERING PIXELATED ENVIRONMENT',
      'SYSTEM READY'
    ];
    
    let currentLine = 0;
    const textY = this.canvas.height / 2 - 40;
    const lineHeight = 30;
    
    const typeText = () => {
      if (currentLine >= bootText.length) {
        setTimeout(callback, 500);
        return;
      }
      
      const text = bootText[currentLine];
      this.ctx.fillText(text, this.canvas.width / 2, textY + currentLine * lineHeight);
      currentLine++;
      
      // Progress bar
      const progress = currentLine / bootText.length;
      this.ctx.fillStyle = '#304050';
      this.ctx.fillRect(this.canvas.width * 0.2, this.canvas.height * 0.6, 
                       this.canvas.width * 0.6, 10);
      this.ctx.fillStyle = '#5af';
      this.ctx.fillRect(this.canvas.width * 0.2, this.canvas.height * 0.6, 
                       this.canvas.width * 0.6 * progress, 10);
      this.ctx.fillStyle = '#9acdff';
      
      setTimeout(typeText, 400);
    };
    
    typeText();
  }
  
  setupInput() {
    document.addEventListener('keydown', (event) => {
      // Handle arrow keys
      switch (event.key) {
        case 'ArrowUp':
          this.handleMove('up');
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.handleMove('right');
          event.preventDefault();
          break;
        case 'ArrowDown':
          this.handleMove('down');
          event.preventDefault();
          break;
        case 'ArrowLeft':
          this.handleMove('left');
          event.preventDefault();
          break;
        case 'f':
          // Toggle fog of war
          this.maze.toggleFogOfWar();
          break;
        case 'r':
          // Reset game
          this.init();
          break;
      }
    });
  }
  
  handleMove(direction) {
    if (this.player.move(direction)) {
      // Check if player collected anything
      const collectedType = this.collectibles.checkCollection(this.player.x, this.player.y);
      
      if (collectedType === 'key') {
        this.player.collectKey();
      }
      
      // Check if player reached the exit with all keys
      if (this.player.x === this.mazeWidth - 1 && 
          this.player.y === this.mazeHeight - 1 &&
          this.player.keys === this.keyCount) {
        setTimeout(() => {
          alert('Congratulations! You escaped the maze!');
          this.init(); // Reset game
        }, 100);
      }
    }
  }
  
  gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add pixelation effect
    this.ctx.imageSmoothingEnabled = false;
    
    // Render maze
    this.maze.render(this.ctx);
    
    // Render collectibles
    this.collectibles.render(this.ctx);
    
    // Render player
    this.player.render(this.ctx);
    
    // Add screen effect (scanlines)
    this.renderScreenEffect();
    
    // Continue game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  // Add pixelated screen effect
  renderScreenEffect() {
    // Scanlines effect
    const scanlineHeight = 2;
    const scanlineOpacity = 0.1;
    this.ctx.fillStyle = `rgba(0, 0, 0, ${scanlineOpacity})`;
    
    for (let y = 0; y < this.canvas.height; y += scanlineHeight * 2) {
      this.ctx.fillRect(0, y, this.canvas.width, scanlineHeight);
    }
    
    // CRT vignette effect (darker corners)
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 
      this.canvas.height * 0.3,
      this.canvas.width / 2, this.canvas.height / 2, 
      this.canvas.height * 0.8
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';
  }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('mazeCanvas');
  
  // Add game instructions with pixelated styling
  const gameContainer = document.querySelector('.game-container');
  const instructions = document.createElement('div');
  instructions.className = 'instructions';
  instructions.innerHTML = `
    <p>► USE ARROW KEYS TO MOVE</p>
    <p>► COLLECT ALL KEYS (${game.keyCount}) TO UNLOCK THE EXIT</p>
    <p>► PRESS F TO TOGGLE FOG-OF-WAR</p>
    <p>► PRESS R TO RESET THE MAZE</p>
  `;
  gameContainer.appendChild(instructions);
  
  // Add pixel grain effect to entire page
  const pixelOverlay = document.createElement('div');
  pixelOverlay.className = 'pixel-overlay';
  document.body.appendChild(pixelOverlay);
});