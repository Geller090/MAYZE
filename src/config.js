class GameConfig {
  constructor() {
    // Default game settings
    this.mazeWidth = 20;
    this.mazeHeight = 20;
    this.cellSize = 20;
    this.keyCount = 3;
    
    // Fog of war settings
    this.fogOfWarEnabled = true;
    this.visibilityRadius = 2;
    this.exploredOpacity = 0.5; // 50%
    
    // Player movement history for recalculation
    this.playerHistory = [];
    
    // Initialize UI bindings
    this.initializeUI();
  }
  
  initializeUI() {
    // Bind all sliders to update their display values
    document.querySelectorAll('input[type="range"]').forEach(slider => {
      const valueDisplay = document.getElementById(`${slider.id}Value`);
      if (valueDisplay) {
        slider.addEventListener('input', () => {
          valueDisplay.textContent = slider.value;
        });
      }
    });
    
    // Set initial values
    this.updateUIFromConfig();
    
    // Bind apply button
    const applyButton = document.getElementById('applySettings');
    if (applyButton) {
      applyButton.addEventListener('click', () => {
        this.updateConfigFromUI();
        // Dispatch event that settings have changed
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: this }));
      });
    }
    
    // Bind reset button
    const resetButton = document.getElementById('resetGame');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        // Dispatch event to reset the game
        window.dispatchEvent(new CustomEvent('resetGame'));
      });
    }
    
    // Bind fog of war toggle
    const fogToggle = document.getElementById('fogEnabled');
    if (fogToggle) {
      fogToggle.addEventListener('change', () => {
        this.fogOfWarEnabled = fogToggle.checked;
        // Dispatch event that fog of war has toggled
        window.dispatchEvent(new CustomEvent('fogToggled', { detail: this.fogOfWarEnabled }));
      });
    }
    
    // Bind real-time updates for fog settings
    const visibilitySlider = document.getElementById('visibilityRadius');
    const opacitySlider = document.getElementById('exploredOpacity');
    
    if (visibilitySlider) {
      visibilitySlider.addEventListener('input', () => {
        this.visibilityRadius = parseInt(visibilitySlider.value);
        window.dispatchEvent(new CustomEvent('fogSettingsChanged', { 
          detail: { visibilityRadius: this.visibilityRadius } 
        }));
      });
    }
    
    if (opacitySlider) {
      opacitySlider.addEventListener('input', () => {
        this.exploredOpacity = parseInt(opacitySlider.value) / 100;
        window.dispatchEvent(new CustomEvent('fogSettingsChanged', { 
          detail: { exploredOpacity: this.exploredOpacity } 
        }));
      });
    }
  }
  
  updateUIFromConfig() {
    // Update all UI elements to match the current config values
    document.getElementById('mazeWidth').value = this.mazeWidth;
    document.getElementById('mazeWidthValue').textContent = this.mazeWidth;
    
    document.getElementById('mazeHeight').value = this.mazeHeight;
    document.getElementById('mazeHeightValue').textContent = this.mazeHeight;
    
    document.getElementById('cellSize').value = this.cellSize;
    document.getElementById('cellSizeValue').textContent = this.cellSize;
    
    document.getElementById('keyCount').value = this.keyCount;
    document.getElementById('keyCountValue').textContent = this.keyCount;
    
    document.getElementById('fogEnabled').checked = this.fogOfWarEnabled;
    
    document.getElementById('visibilityRadius').value = this.visibilityRadius;
    document.getElementById('visibilityRadiusValue').textContent = this.visibilityRadius;
    
    document.getElementById('exploredOpacity').value = this.exploredOpacity * 100;
    document.getElementById('exploredOpacityValue').textContent = Math.round(this.exploredOpacity * 100);
  }
  
  updateConfigFromUI() {
    // Update config from UI values
    this.mazeWidth = parseInt(document.getElementById('mazeWidth').value);
    this.mazeHeight = parseInt(document.getElementById('mazeHeight').value);
    this.cellSize = parseInt(document.getElementById('cellSize').value);
    this.keyCount = parseInt(document.getElementById('keyCount').value);
    this.fogOfWarEnabled = document.getElementById('fogEnabled').checked;
    this.visibilityRadius = parseInt(document.getElementById('visibilityRadius').value);
    this.exploredOpacity = parseInt(document.getElementById('exploredOpacity').value) / 100;
    
    // Reset player history on major config changes
    this.playerHistory = [];
  }
  
  // Add position to player history
  addPlayerPosition(x, y) {
    this.playerHistory.push({ x, y });
  }
  
  // Reset player history
  resetPlayerHistory() {
    this.playerHistory = [];
  }
  
  // Get player history
  getPlayerHistory() {
    return this.playerHistory;
  }
}