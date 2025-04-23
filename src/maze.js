class Maze {
  constructor(width = 20, height = 20, cellSize = 20) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.grid = [];
    this.explored = [];
    this.visible = []; // Currently visible cells
    
    // Fog of war configuration with sensible defaults
    this.fogOfWarEnabled = true;
    this.visibilityRadius = 3; // How far the player can see
    this.exploredOpacity = 0.4; // 40% opacity for explored areas
    
    // Player tracking
    this.lastPlayerX = 0;
    this.lastPlayerY = 0;
    this.playerHistory = [];
    
    // Initialize and generate the maze
    this.initializeGrid();
    this.generateMaze();
  }

  initializeGrid() {
    // Initialize grid with walls
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      this.explored[y] = [];
      this.visible[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = {
          x: x,
          y: y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        };
        this.explored[y][x] = false;
        this.visible[y][x] = false;
      }
    }
  }

  generateMaze() {
    // Depth-first search with backtracking
    const stack = [];
    let current = this.grid[0][0];
    current.visited = true;

    // Set entry and exit
    this.grid[0][0].walls.top = false; // Entry
    this.grid[this.height - 1][this.width - 1].walls.bottom = false; // Exit

    do {
      const neighbors = this.getUnvisitedNeighbors(current);
      
      if (neighbors.length > 0) {
        // Choose a random neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);
        
        // Remove walls between current and next cell
        this.removeWalls(current, next);
        
        current = next;
        current.visited = true;
      } else if (stack.length > 0) {
        current = stack.pop();
      }
    } while (stack.length > 0);
  }

  getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { x, y } = cell;
    const directions = [
      { x: 0, y: -1, name: 'top' },    // Top
      { x: 1, y: 0, name: 'right' },   // Right
      { x: 0, y: 1, name: 'bottom' },  // Bottom
      { x: -1, y: 0, name: 'left' }    // Left
    ];

    directions.forEach(dir => {
      const nx = x + dir.x;
      const ny = y + dir.y;
      
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        if (!this.grid[ny][nx].visited) {
          neighbors.push(this.grid[ny][nx]);
        }
      }
    });

    return neighbors;
  }

  removeWalls(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) {
      a.walls.left = false;
      b.walls.right = false;
    } else if (dx === -1) {
      a.walls.right = false;
      b.walls.left = false;
    }

    if (dy === 1) {
      a.walls.top = false;
      b.walls.bottom = false;
    } else if (dy === -1) {
      a.walls.bottom = false;
      b.walls.top = false;
    }
  }

  render(ctx) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    // Draw black background for fog of war
    if (this.fogOfWarEnabled) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const isExplored = this.explored[y][x];
        const isVisible = this.visible[y][x];
        
        // Skip cells that haven't been explored when fog of war is enabled
        if (this.fogOfWarEnabled && !isExplored) continue;
        
        // Set opacity based on visibility status
        if (this.fogOfWarEnabled) {
          if (isVisible) {
            ctx.globalAlpha = 1.0; // Currently visible
          } else if (isExplored) {
            ctx.globalAlpha = this.exploredOpacity; // Explored but not currently visible
          }
        } else {
          ctx.globalAlpha = 1.0; // No fog of war, full visibility
        }

        const startX = x * this.cellSize;
        const startY = y * this.cellSize;
        
        // Draw cell background for explored areas
        if (isExplored || !this.fogOfWarEnabled) {
          ctx.fillStyle = '#111';
          ctx.fillRect(startX, startY, this.cellSize, this.cellSize);
        }
        
        // Draw walls
        if (cell.walls.top) {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + this.cellSize, startY);
          ctx.stroke();
        }
        
        if (cell.walls.right) {
          ctx.beginPath();
          ctx.moveTo(startX + this.cellSize, startY);
          ctx.lineTo(startX + this.cellSize, startY + this.cellSize);
          ctx.stroke();
        }
        
        if (cell.walls.bottom) {
          ctx.beginPath();
          ctx.moveTo(startX + this.cellSize, startY + this.cellSize);
          ctx.lineTo(startX, startY + this.cellSize);
          ctx.stroke();
        }
        
        if (cell.walls.left) {
          ctx.beginPath();
          ctx.moveTo(startX, startY + this.cellSize);
          ctx.lineTo(startX, startY);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // Check if a move from current position to newX, newY is valid
  isValidMove(currentX, currentY, newX, newY) {
    // Check if the new position is out of bounds
    if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) {
      return false;
    }

    // Calculate direction of movement
    const dx = newX - currentX;
    const dy = newY - currentY;

    // Check if trying to move through a wall
    if (dx === 1 && this.grid[currentY][currentX].walls.right) return false; // Moving right
    if (dx === -1 && this.grid[currentY][currentX].walls.left) return false; // Moving left
    if (dy === 1 && this.grid[currentY][currentX].walls.bottom) return false; // Moving down
    if (dy === -1 && this.grid[currentY][currentX].walls.top) return false; // Moving up

    return true;
  }
  
  // Mark a cell as explored
  exploreCell(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.explored[y][x] = true;
    }
  }
  
  // Toggle fog of war
  toggleFogOfWar() {
    this.fogOfWarEnabled = !this.fogOfWarEnabled;
    this.updateVisibility(this.lastPlayerX, this.lastPlayerY);
    return this.fogOfWarEnabled;
  }
  
  // Update visibility based on player position
  updateVisibility(playerX, playerY) {
    // Store last player position
    this.lastPlayerX = playerX;
    this.lastPlayerY = playerY;
    
    // Add to player history
    this.playerHistory.push({ x: playerX, y: playerY });
    
    // Reset visibility
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.visible[y][x] = false;
      }
    }
    
    if (!this.fogOfWarEnabled) {
      // If fog of war is disabled, all cells are visible
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.visible[y][x] = true;
        }
      }
      return;
    }

    // Mark cells within visibility radius as visible
    this.calculateVisibility(playerX, playerY);
  }
  
  // Calculate which cells are visible from player position
  calculateVisibility(playerX, playerY) {
    // Mark current cell as visible and explored
    this.visible[playerY][playerX] = true;
    this.explored[playerY][playerX] = true;
    
    // Cast rays in all directions to find visible cells
    for (let angle = 0; angle < 360; angle += 10) {
      this.castRay(playerX, playerY, angle);
    }
  }
  
  // Cast a ray from origin point at given angle
  castRay(originX, originY, angleDegrees) {
    const angleRadians = angleDegrees * Math.PI / 180;
    // Use the current visibility radius
    const rayLength = this.visibilityRadius;
    
    let prevX = originX;
    let prevY = originY;
    
    for (let i = 0; i <= rayLength * 2; i += 0.1) {
      // Calculate cell coordinates along the ray
      const cellX = Math.floor(originX + Math.cos(angleRadians) * i);
      const cellY = Math.floor(originY + Math.sin(angleRadians) * i);
      
      // Stop if out of bounds
      if (cellX < 0 || cellX >= this.width || cellY < 0 || cellY >= this.height) {
        break;
      }
      
      // Mark cell as visible and explored
      this.visible[cellY][cellX] = true;
      this.explored[cellY][cellX] = true;
      
      // Check if we hit a wall
      if (prevX !== cellX || prevY !== cellY) {
        // Moving right and there's a wall
        if (cellX > prevX && this.grid[prevY][prevX].walls.right) {
          break;
        }
        // Moving left and there's a wall
        if (cellX < prevX && this.grid[cellY][cellX].walls.right) {
          break;
        }
        // Moving down and there's a wall
        if (cellY > prevY && this.grid[prevY][prevX].walls.bottom) {
          break;
        }
        // Moving up and there's a wall
        if (cellY < prevY && this.grid[cellY][cellX].walls.bottom) {
          break;
        }
        
        prevX = cellX;
        prevY = cellY;
      }
    }
  }
  
  // Check if a cell is currently visible
  isVisible(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    return this.visible[y][x];
  }
}