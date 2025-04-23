class Game {
  constructor(canvasId, mazeWidth = 20, mazeHeight = 20, cellSize = 20) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.mazeWidth = mazeWidth;
    this.mazeHeight = mazeHeight;
    this.cellSize = cellSize;
    
    // Set canvas size
    this.canvas.width = this.mazeWidth * this.cellSize;
    this.canvas.height = this.mazeHeight * this.cellSize;
    
    // Game configuration
    this.showUnexplored = true; // Set to false for fog-of-war
    this.keyCount = 3; // Number of keys to collect
    
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
    
    // Start game loop
    this.lastTime = 0;
    requestAnimationFrame(this.gameLoop.bind(this));
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
          this.showUnexplored = !this.showUnexplored;
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
    
    // Render maze
    this.maze.render(this.ctx, this.showUnexplored);
    
    // Render collectibles
    this.collectibles.render(this.ctx, this.showUnexplored);
    
    // Render player
    this.player.render(this.ctx);
    
    // Continue game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('mazeCanvas', 20, 20, 20);
  
  // Add game instructions
  const gameContainer = document.querySelector('.game-container');
  const instructions = document.createElement('div');
  instructions.className = 'instructions';
  instructions.innerHTML = `
    <p>Use arrow keys to move</p>
    <p>Collect all keys (${game.keyCount}) to unlock the exit</p>
    <p>Press F to toggle fog-of-war</p>
    <p>Press R to reset the maze</p>
  `;
  gameContainer.appendChild(instructions);
});