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
    const centerX = this.x * cellSize + cellSize / 2;
    const centerY = this.y * cellSize + cellSize / 2;
    const radius = cellSize / 3;

    // Draw player
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  collectKey() {
    this.keys++;
    document.getElementById('keyCount').textContent = this.keys;
    return this.keys;
  }
}