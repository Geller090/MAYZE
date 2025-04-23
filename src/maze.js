class Maze {
  constructor(width, height, cellSize = 20) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.grid = [];
    this.explored = [];
    this.initializeGrid();
    this.generateMaze();
  }

  initializeGrid() {
    // Initialize grid with walls
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      this.explored[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = {
          x: x,
          y: y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        };
        this.explored[y][x] = false;
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

  render(ctx, showUnexplored = true) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const isExplored = this.explored[y][x];
        
        // Skip cells that haven't been explored if showUnexplored is false
        if (!showUnexplored && !isExplored) continue;
        
        // Dim unexplored cells
        if (!isExplored && showUnexplored) {
          ctx.globalAlpha = 0.3;
        } else {
          ctx.globalAlpha = 1.0;
        }

        const startX = x * this.cellSize;
        const startY = y * this.cellSize;
        
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
}