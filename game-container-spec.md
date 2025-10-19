# Main Game Container Specification

## Overview
The Main Game Container is the orchestrator component for the microgame experience. It manages the overall game state, timer, level progression, and coordinates between individual microgames and UI elements.

## Responsibilities

### Core Functions
- Initialize and manage the global game timer
- Track current level/microgame index (1-5)
- Handle level progression and completion
- Manage skip functionality with time penalties
- Aggregate and display final results
- Coordinate state between microgames and UI components

### State Management
The container maintains the following state:

```typescript
type GameState = 'idle' | 'playing' | 'completed';

interface LevelResult {
  completed: boolean;
  skipped: boolean;
  timeSpent: number; // milliseconds for this level
}

interface GameContainerState {
  gameState: GameState;
  currentLevel: number; // 1-5
  startTime: number | null; // timestamp
  totalTime: number; // milliseconds
  levelResults: LevelResult[]; // array of 5 results
  showSkipButton: boolean;
}
```

## Component Structure

### Props
None - this is the root game component

### Key Methods

#### `startGame(): void`
- Initializes game state
- Resets all timers and level results
- Sets gameState to 'playing'
- Records startTime timestamp
- Sets currentLevel to 1

#### `handleLevelComplete(): void`
- Called when a microgame is successfully completed
- Records completion in levelResults array
- Increments currentLevel
- If currentLevel > 5, calls `endGame()`
- Otherwise, loads next microgame

#### `handleSkip(): void`
- Marks current level as skipped in levelResults
- Adds 30-second (30000ms) penalty to totalTime
- Calls `handleLevelComplete()` to progress

#### `endGame(): void`
- Calculates final totalTime (current timestamp - startTime + penalties)
- Sets gameState to 'completed'
- Displays results screen

#### `resetGame(): void`
- Resets all state to initial values
- Called from results screen to start over

### Skip Button Logic
- Timer to show skip button starts when microgame loads
- Skip button appears after 5 seconds of gameplay
- Resets when moving to next level
- Hidden during idle and completed states

## Child Components

The Main Game Container renders:

1. **Timer Display** (always visible during play)
   - Shows elapsed time in MM:SS format
   - Updates every 100ms for smooth display

2. **Progress Tracker**
   - Visual indicator of current level (e.g., "3/5")
   - Shows completed/skipped/current status for each level

3. **Microgame Component** (dynamic)
   - Renders current level's microgame
   - Receives `onComplete` callback
   - Only one active at a time

4. **Skip Button** (conditional)
   - Appears after 5 seconds
   - Shows time penalty on button ("Skip (+30s)")

5. **Results Screen** (game completed)
   - Final time display
   - Level-by-level breakdown
   - Restart button

## Data Flow

### Starting a Game
```
User clicks Start 
  → startGame() 
  → gameState = 'playing' 
  → Load Microgame 1
```

### Completing a Level
```
User completes puzzle 
  → Microgame calls onComplete() 
  → handleLevelComplete() 
  → Update levelResults 
  → Load next Microgame or endGame()
```

### Skipping a Level
```
User clicks Skip 
  → handleSkip() 
  → Add 30s penalty 
  → Mark as skipped 
  → Progress to next level
```

## Timer Implementation

### Global Timer
- Starts on game initialization
- Runs continuously (not paused between levels)
- Final time = (endTime - startTime) + total skip penalties

### Display Timer
- Uses `useEffect` with interval for updates
- Calculates: `Date.now() - startTime + accumulatedPenalties`
- Formats to MM:SS.MS

## Integration Points

### With Microgames
- Each microgame receives:
  ```typescript
  interface MicrogameProps {
    onComplete: () => void;
    level: number; // for potential future difficulty scaling
  }
  ```
  
- Microgames are responsible for:
  - Their own internal state
  - Determining when puzzle is solved
  - Calling `onComplete()` when solved

### With Progress Tracker
- Passes current level and levelResults array
  ```typescript
  interface ProgressTrackerProps {
    currentLevel: number;
    levelResults: LevelResult[];
  }
  ```
- Tracker component handles its own visualization

### With Results Screen
- Passes totalTime and levelResults
  ```typescript
  interface ResultsScreenProps {
    totalTime: number;
    levelResults: LevelResult[];
    onRestart: () => void;
  }
  ```
- Results component handles formatting and display

## Performance Considerations

### Tablet Optimization
- Touch targets minimum 44x44px
- Large, clear text for timer and instructions
- Responsive layout that works in both orientations
- No hover states (touch-only interactions)

### State Management
- Use React's `useState` for component-level state
- Timer updates don't trigger full component re-renders
- Microgames should be memoized to prevent unnecessary re-renders

## File Structure
```
src/
  types/
    game.types.ts          // Shared type definitions
  components/
    GameContainer.tsx      // Main container component
    Timer.tsx              // Timer display
    ProgressTracker.tsx    // Level progress UI
    SkipButton.tsx         // Skip functionality
    ResultsScreen.tsx      // Final results display
    microgames/
      ColorMatch.tsx
      SequenceMemory.tsx
      OddOneOut.tsx
      SpeedTap.tsx
      DirectionMatch.tsx
```

## Type Definitions (game.types.ts)
```typescript
export type GameState = 'idle' | 'playing' | 'completed';

export interface LevelResult {
  completed: boolean;
  skipped: boolean;
  timeSpent: number;
}

export interface MicrogameProps {
  onComplete: () => void;
  level: number;
}

export interface ProgressTrackerProps {
  currentLevel: number;
  levelResults: LevelResult[];
}

export interface ResultsScreenProps {
  totalTime: number;
  levelResults: LevelResult[];
  onRestart: () => void;
}

export interface TimerProps {
  startTime: number;
  additionalTime: number; // penalties
}

export interface SkipButtonProps {
  onSkip: () => void;
  visible: boolean;
}
```

## Future Enhancements (Not in POC)
- Difficulty progression
- High score persistence
- Sound effects
- Animations between levels
- Customizable time penalties