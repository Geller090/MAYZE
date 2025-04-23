class Player {
  constructor(maze, x = 0, y = 0) {
    this.maze = maze;
    this.x = x;
    this.y = y;
    this.keys = 0;
    
    // Mark starting position as explored
    this.maze.exploreCell(this.x, this.y);
    
    // Update visibility around player
    this.updateVisibility();
  }

  move(direction) {
    let newX = this.x;
    let newY = this.y;

    switch (direction) {
      case 'up':
        newY--;
        break;
      case 'right':
        newX++;
        break;
      case 'down':
        newY++;
        break;
      case 'left':
        newX--;
        break;
    }

    if (this.maze.isValidMove(this.x, this.y, newX, newY)) {
      this.x = newX;
      this.y = newY;
      
      // Mark the new cell as explored
      this.maze.exploreCell(this.x, this.y);
      
      // Update visibility around player
      this.updateVisibility();
      
      return true;
    }
    return false;
  }
  
  // Update visibility around player
  updateVisibility() {
    this.maze.updateVisibility(this.x, this.y);
  }

  render(ctx) {
    const cellSize = this.maze.cellSize;
    const startX = this.x * cellSize;
    const startY = this.y * cellSize;
    const playerSize = cellSize * 0.7;
    const offsetX = (cellSize - playerSize) / 2;
    const offsetY = (cellSize - playerSize) / 2;

    // Draw player base (character sprite) - pixelated style
    // Character body
    ctx.fillStyle = '#5af';
    ctx.fillRect(startX + offsetX, startY + offsetY, playerSize, playerSize);
    
    // Inner details (pixelated face)
    ctx.fillStyle = '#3af';
    const headSize = playerSize * 0.6;
    const headOffsetX = (cellSize - headSize) / 2;
    const headOffsetY = (cellSize - headSize) / 2;
    ctx.fillRect(startX + headOffsetX, startY + headOffsetY, headSize, headSize);
    
    // Eyes
    ctx.fillStyle = '#fff';
    const eyeSize = Math.max(2, Math.floor(cellSize / 10));
    // Left eye
    ctx.fillRect(startX + headOffsetX + headSize * 0.25 - eyeSize/2, 
                 startY + headOffsetY + headSize * 0.35, eyeSize, eyeSize);
    // Right eye
    ctx.fillRect(startX + headOffsetX + headSize * 0.75 - eyeSize/2, 
                 startY + headOffsetY + headSize * 0.35, eyeSize, eyeSize);
    
    // Add light effect (glow) around the player
    ctx.beginPath();
    ctx.arc(startX + cellSize/2, startY + cellSize/2, 
            cellSize * 0.8, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      startX + cellSize/2, startY + cellSize/2, 0,
      startX + cellSize/2, startY + cellSize/2, cellSize * 0.8
    );
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 100, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  collectKey() {
    this.keys++;
    document.getElementById('keyCount').textContent = this.keys;
    return this.keys;
  }
}