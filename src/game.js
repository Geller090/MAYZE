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
    // Keyboard controls
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
    
    // Mobile touch controls
    this.setupMobileControls();
    
    // Responsive canvas sizing
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
  }
  
  // Set up mobile touch controls with swipe support
  setupMobileControls() {
    // Action buttons
    const fogBtn = document.getElementById('fog-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Setup swipe detection on canvas
    this.setupSwipeControls();
    
    // Action button event listeners
    if (fogBtn) {
      fogBtn.addEventListener('click', () => this.maze.toggleFogOfWar());
      fogBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.maze.toggleFogOfWar();
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.init());
      resetBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.init();
      });
    }
  }
  
  // Setup swipe controls for smooth movement
  setupSwipeControls() {
    // Swipe state
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    let lastMoveTime = 0;
    const moveDelay = 200; // Delay between moves in ms
    
    // Attach touch events to canvas
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isSwiping = true;
      
      // Prevent default to avoid scrolling
      e.preventDefault();
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      
      const now = Date.now();
      if (now - lastMoveTime < moveDelay) return; // Throttle moves
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Determine which direction has the largest movement
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Required minimum swipe distance
      const minSwipeDistance = 20;
      
      let direction = null;
      
      if (Math.max(absDeltaX, absDeltaY) > minSwipeDistance) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          // Vertical swipe
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // Process the move
        if (direction && this.handleMove(direction)) {
          // Move succeeded, update start position to enable continuous swiping
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
          lastMoveTime = now;
        }
      }
      
      e.preventDefault();
    });
    
    this.canvas.addEventListener('touchend', () => {
      isSwiping = false;
    });
    
    this.canvas.addEventListener('touchcancel', () => {
      isSwiping = false;
    });
  }
  
  // Handle window resize for responsive sizing
  handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Smaller maze for mobile
      const mobileScale = Math.min(1, window.innerWidth / (this.mazeWidth * this.cellSize + 20));
      
      // Scale the canvas
      this.canvas.style.transformOrigin = 'top left';
      this.canvas.style.transform = `scale(${mobileScale})`;
      
      // Ensure the container accommodates the scaled canvas
      const gameContainer = document.querySelector('.game-container');
      if (gameContainer) {
        gameContainer.style.height = 'auto';
        gameContainer.style.width = `${this.mazeWidth * this.cellSize * mobileScale}px`;
      }
    } else {
      // Reset for desktop
      this.canvas.style.transform = 'none';
      this.canvas.style.width = `${this.mazeWidth * this.cellSize}px`;
      this.canvas.style.height = `${this.mazeHeight * this.cellSize}px`;
    }
  }
  
  handleMove(direction) {
    // Try to move in the given direction
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
          this.showVictoryScreen();
        }, 300);
      }
      
      // Return true to indicate the move was successful
      return true;
    }
    
    // Return false if move failed (hit a wall)
    return false;
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
  
  // Detect if using touch device for appropriate instructions
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Add game instructions with pixelated styling
  const gameContainer = document.querySelector('.game-container');
  const instructions = document.createElement('div');
  instructions.className = 'instructions';
  
  // Different instructions based on device type
  if (isTouchDevice) {
    instructions.innerHTML = `
      <p>► SWIPE ON MAZE TO MOVE</p>
      <p>► COLLECT ALL KEYS (${game.keyCount}) TO UNLOCK THE EXIT</p>
      <p>► TAP FOG BUTTON TO TOGGLE VISIBILITY</p>
      <p>► TAP RESET TO RESTART THE MAZE</p>
    `;
  } else {
    instructions.innerHTML = `
      <p>► USE ARROW KEYS TO MOVE</p>
      <p>► COLLECT ALL KEYS (${game.keyCount}) TO UNLOCK THE EXIT</p>
      <p>► PRESS F TO TOGGLE FOG-OF-WAR</p>
      <p>► PRESS R TO RESET THE MAZE</p>
    `;
  }
  gameContainer.appendChild(instructions);
  
  // Add pixel grain effect to entire page
  const pixelOverlay = document.createElement('div');
  pixelOverlay.className = 'pixel-overlay';
  document.body.appendChild(pixelOverlay);
  
  // Add victory screen method to Game prototype
  Game.prototype.showVictoryScreen = function() {
    // Create victory screen container
    const victoryScreen = document.createElement('div');
    victoryScreen.className = 'victory-screen';
    
    // Victory content
    victoryScreen.innerHTML = `
      <div class="victory-title">MISSION COMPLETE</div>
      <div class="victory-message">YOU ESCAPED THE FOG OF WAR</div>
      <div class="victory-stats">KEYS COLLECTED: ${this.player.keys}/${this.keyCount}</div>
      <button class="play-again-btn">PLAY AGAIN</button>
    `;
    
    // Add to body
    document.body.appendChild(victoryScreen);
    
    // Add event listener to play again button
    const playAgainBtn = victoryScreen.querySelector('.play-again-btn');
    playAgainBtn.addEventListener('click', () => {
      document.body.removeChild(victoryScreen);
      this.init();
    });
    
    // Add CSS dynamically if needed
    if (!document.getElementById('victory-styles')) {
      const victoryStyles = document.createElement('style');
      victoryStyles.id = 'victory-styles';
      victoryStyles.textContent = `
        .victory-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(10, 10, 18, 0.9);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          font-family: 'VT323', monospace;
          animation: victory-fade-in 0.5s ease-in;
        }
        
        .victory-title {
          font-size: 48px;
          color: #5af;
          margin-bottom: 20px;
          text-shadow: 3px 3px 0px #102030;
          animation: victory-pulse 2s infinite;
        }
        
        .victory-message {
          font-size: 32px;
          color: #9acdff;
          margin-bottom: 40px;
          text-shadow: 2px 2px 0px #102030;
        }
        
        .victory-stats {
          font-size: 24px;
          color: #7ab;
          margin-bottom: 30px;
        }
        
        .play-again-btn {
          padding: 12px 24px;
          background-color: #304050;
          border: 2px solid #506070;
          color: #9acdff;
          font-size: 24px;
          font-family: 'VT323', monospace;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .play-again-btn:hover {
          background-color: #405060;
          transform: scale(1.05);
        }
        
        @keyframes victory-pulse {
          0% { transform: scale(1); text-shadow: 3px 3px 0px #102030; }
          50% { transform: scale(1.05); text-shadow: 4px 4px 0px #0c1620; }
          100% { transform: scale(1); text-shadow: 3px 3px 0px #102030; }
        }
        
        @keyframes victory-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(victoryStyles);
    }
  };
});