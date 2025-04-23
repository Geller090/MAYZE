class Collectibles {
  constructor(maze, count = 3) {
    this.maze = maze;
    this.items = [];
    this.generateKeys(count);
  }

  generateKeys(count) {
    // Clear existing items
    this.items = [];
    
    // Set max attempts to prevent infinite loop
    const maxAttempts = 100;
    let attempts = 0;
    
    while (this.items.length < count && attempts < maxAttempts) {
      attempts++;
      
      // Generate random position
      const x = Math.floor(Math.random() * this.maze.width);
      const y = Math.floor(Math.random() * this.maze.height);
      
      // Don't put keys at start or end positions
      if ((x === 0 && y === 0) || 
          (x === this.maze.width - 1 && y === this.maze.height - 1)) {
        continue;
      }
      
      // Check if position is already used
      if (!this.items.some(item => item.x === x && item.y === y)) {
        this.items.push({
          x,
          y,
          type: 'key',
          collected: false
        });
      }
    }
  }

  checkCollection(playerX, playerY) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (!item.collected && item.x === playerX && item.y === playerY) {
        item.collected = true;
        return item.type;
      }
    }
    return null;
  }

  render(ctx, showUnexplored = true) {
    const cellSize = this.maze.cellSize;
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      
      // Skip if collected
      if (item.collected) continue;
      
      // Check if item is in explored area when fog of war is active
      if (!showUnexplored && !this.maze.explored[item.y][item.x]) continue;
      
      // Set opacity based on exploration
      if (!this.maze.explored[item.y][item.x] && showUnexplored) {
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 1.0;
      }
      
      const centerX = item.x * cellSize + cellSize / 2;
      const centerY = item.y * cellSize + cellSize / 2;
      
      // Draw key
      ctx.fillStyle = '#ffcc00';
      
      // Key body
      ctx.beginPath();
      ctx.arc(centerX, centerY, cellSize / 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Key teeth
      ctx.fillRect(centerX + cellSize / 8, centerY - cellSize / 16, cellSize / 4, cellSize / 8);
    }
    
    ctx.globalAlpha = 1.0;
  }
}