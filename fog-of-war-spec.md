# Fog of War Specification

## Overview
The fog of war feature limits player visibility to only explored areas of the maze, creating a sense of mystery and discovery.

## Requirements

### Core Mechanics
- All unexplored areas should be completely hidden (black)
- Areas become visible when the player visits them or when they are within the player's field of view
- Once explored, areas remain visible but may appear slightly different than the current view

### Implementation Details

#### Exploration Tracking
- Maintain a 2D array matching the maze dimensions to track explored cells
- Each cell has a boolean value: `true` for explored, `false` for unexplored
- Update exploration status when player moves

#### Visibility Calculation
1. **Basic Implementation (V1)**
   - Only cells the player has visited are marked as explored
   - Exploration is permanent (cells don't return to unexplored state)

2. **Enhanced Implementation (V2)**
   - Player has a "field of view" extending 2-3 cells in each direction
   - Walls block the field of view (cannot see through walls)
   - Use a raycasting algorithm to determine which cells are visible from player's position

3. **Advanced Implementation (V3)**
   - Add a "memory fade" effect where cells gradually become less visible over time since last seen
   - Implement a torch/light source mechanic that can be upgraded to extend visibility

#### Rendering
- Unexplored areas should be rendered as solid black
- Explored but not currently visible areas should be dimmed (30-50% opacity)
- Currently visible areas should be fully bright (100% opacity)
- Apply a smooth transition effect when cells change state (optional)

#### User Interface
- Toggle fog of war on/off with 'F' key
- Add a mini-map option showing only explored areas
- Consider adding a compass or directional indicator

## Technical Considerations
- Use the existing `explored` array in the Maze class
- Optimization is important - recalculate visibility only when the player moves
- For raycasting, use a simplified algorithm appropriate for grid-based exploration

## Testing
- Verify that cells appropriately change state when explored
- Confirm that walls properly block visibility in enhanced implementations
- Test edge cases (maze borders, dead ends, etc.)