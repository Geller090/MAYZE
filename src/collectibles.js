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

  render(ctx) {
    const cellSize = this.maze.cellSize;
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      
      // Skip if collected
      if (item.collected) continue;
      
      // Skip if not visible in fog of war mode
      if (this.maze.fogOfWarEnabled && !this.maze.isVisible(item.x, item.y) && !this.maze.explored[item.y][item.x]) continue;
      
      // Set opacity based on visibility
      if (this.maze.fogOfWarEnabled) {
        if (this.maze.isVisible(item.x, item.y)) {
          ctx.globalAlpha = 1.0; // Currently visible
        } else if (this.maze.explored[item.y][item.x]) {
          ctx.globalAlpha = this.maze.exploredOpacity; // Explored but not currently visible
        }
      } else {
        ctx.globalAlpha = 1.0; // No fog of war
      }
      
      const centerX = item.x * cellSize + cellSize / 2;
      const centerY = item.y * cellSize + cellSize / 2;
      
      // Draw key (pixelated style)
      const keySize = cellSize * 0.6;
      const keyX = centerX - keySize / 2;
      const keyY = centerY - keySize / 2;
      
      // Key base
      ctx.fillStyle = '#fa0';
      ctx.fillRect(keyX, keyY, keySize, keySize);
      
      // Key details
      ctx.fillStyle = '#fc0';
      ctx.fillRect(keyX + keySize * 0.2, keyY + keySize * 0.2, keySize * 0.6, keySize * 0.6);
      
      // Key teeth (pixelated)
      ctx.fillStyle = '#ff0';
      const teethSize = Math.max(2, Math.floor(cellSize / 10));
      ctx.fillRect(keyX + keySize * 0.3, keyY + keySize * 0.3, teethSize, teethSize);
      ctx.fillRect(keyX + keySize * 0.6, keyY + keySize * 0.4, teethSize, teethSize);
      ctx.fillRect(keyX + keySize * 0.4, keyY + keySize * 0.6, teethSize, teethSize);
      
      // Add glow effect
      ctx.beginPath();
      ctx.arc(centerX, centerY, keySize * 0.8, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, keySize * 0.8
      );
      gradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
  }
}