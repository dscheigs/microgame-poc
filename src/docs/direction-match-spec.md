# Direction Match Microgame Specification

## Overview
Direction Match is a quick visual recognition game where the player must identify and tap the arrow pointing in a specific direction among several arrows pointing in different directions.

## Objective
Tap the arrow pointing in the direction specified by the instruction text (e.g., "Tap the arrow pointing RIGHT").

## Game Mechanics

### Setup
- Display instruction: "Tap the arrow pointing [DIRECTION]"
- Show 4 arrows in a grid
- Each arrow points in a different direction
- Only one arrow matches the requested direction

### Win Condition
Player successfully taps the arrow pointing in the correct direction.

### Difficulty Considerations (POC)
- 4 cardinal directions only (up, down, left, right)
- Clear visual arrows
- Large tap targets
- Simple instruction

## Props Interface

```typescript
interface DirectionMatchProps {
  onComplete: () => void;
  level: number;
}
```

## Internal State

```typescript
interface DirectionMatchState {
  targetDirection: Direction;
  arrows: ArrowConfig[];
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface ArrowConfig {
  id: number;
  direction: Direction;
  rotation: number;  // degrees for CSS transform
  isTarget: boolean;
}
```

## Direction Configuration

```typescript
const DIRECTIONS: Record<Direction, { label: string; rotation: number }> = {
  up: { label: 'UP', rotation: 0 },
  right: { label: 'RIGHT', rotation: 90 },
  down: { label: 'DOWN', rotation: 180 },
  left: { label: 'LEFT', rotation: 270 },
};

const ALL_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];
```

## Game Generation

```typescript
const generateGame = (): DirectionMatchState => {
  // Select random target direction
  const targetDirection = ALL_DIRECTIONS[
    Math.floor(Math.random() * ALL_DIRECTIONS.length)
  ];
  
  // Create shuffled array of all 4 directions
  const shuffledDirections = [...ALL_DIRECTIONS].sort(() => Math.random() - 0.5);
  
  // Create arrow configs
  const arrows: ArrowConfig[] = shuffledDirections.map((direction, index) => ({
    id: index,
    direction,
    rotation: DIRECTIONS[direction].rotation,
    isTarget: direction === targetDirection,
  }));
  
  return {
    targetDirection,
    arrows,
  };
};
```

## UI Layout

```
┌─────────────────────────────────┐
│                                 │
│   "Tap the arrow pointing"      │
│          "RIGHT"                │
│                                 │
│                                 │
│     ┌─────────┬─────────┐      │
│     │    ↑    │    →    │      │
│     │         │         │      │
│     ├─────────┼─────────┤      │
│     │    ↓    │    ←    │      │
│     │         │         │      │
│     └─────────┴─────────┘      │
│                                 │
│    (One arrow matches target)   │
│                                 │
└─────────────────────────────────┘
```

### Element Specifications

**Instruction Text**
- Two lines:
  - "Tap the arrow pointing"
  - "[DIRECTION]" (larger, bold, colored)
- Top of screen, centered
- Direction text prominent and clear

**Arrow Grid**
- 2×2 grid of arrow buttons
- Each cell: 120-140px square
- 20-30px spacing between cells
- Centered on screen
- All arrows same size and style

**Arrow Design**
- Large, bold arrow (80-100px)
- Single color (e.g., white or black)
- Clear directional indication
- Consistent style across all arrows

## Arrow Component

### SVG Arrow
```typescript
interface ArrowProps {
  rotation: number;
  size?: number;
  color?: string;
}

const Arrow: React.FC<ArrowProps> = ({ 
  rotation, 
  size = 80, 
  color = '#1F2937' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <path
      d="M12 4l-8 8h5v8h6v-8h5l-8-8z"
      fill={color}
    />
  </svg>
);
```

### Alternative: Unicode Arrow
```typescript
const UnicodeArrow: React.FC<ArrowProps> = ({ rotation }) => {
  const arrows = {
    0: '↑',
    90: '→',
    180: '↓',
    270: '←',
  };
  
  return (
    <span style={{ fontSize: '80px' }}>
      {arrows[rotation as keyof typeof arrows]}
    </span>
  );
};
```

## User Interaction

### Tap Handling
```typescript
const handleArrowTap = (index: number): void => {
  const arrow = arrows[index];
  
  if (arrow.isTarget) {
    // Correct!
    playCorrectFeedback(index);
    setTimeout(() => {
      onComplete();
    }, 300);
  } else {
    // Wrong!
    playWrongFeedback(index);
    // Let them try again
  }
};
```

### Feedback

**Correct Tap**
- Brief green glow/pulse on tapped arrow
- Immediate progression (with short delay)
- Success animation

**Wrong Tap**
- Shake animation on tapped arrow
- Brief red flash or border
- Can immediately try again
- No penalty

## Tablet Optimization

### Touch Targets
- Each arrow button: 120-140px square
- Large enough for easy tapping
- Clear spacing prevents mis-taps
- No precision required

### Visual Clarity
- Large arrows easy to see
- High contrast against background
- Direction immediately obvious
- No ambiguity in arrow orientation

### Performance
- Lightweight SVG or Unicode arrows
- Instant tap response
- Smooth animations

## Accessibility

### Visual
- Large, clear arrows
- High contrast
- Obvious direction indicators
- Clear instruction text

### Semantic HTML
```typescript
<div role="main" aria-label="Direction match game">
  <div className="instructions" aria-live="polite">
    <p>Tap the arrow pointing</p>
    <p className="target-direction">
      {DIRECTIONS[targetDirection].label}
    </p>
  </div>
  
  <div 
    className="arrow-grid"
    role="grid"
    aria-label="Directional arrows"
  >
    {arrows.map((arrow, index) => (
      <button
        key={arrow.id}
        className="arrow-button"
        onClick={() => handleArrowTap(index)}
        aria-label={`Arrow pointing ${arrow.direction}`}
      >
        <Arrow rotation={arrow.rotation} />
      </button>
    ))}
  </div>
</div>
```

### Direction Labels
- Use clear cardinal direction names
- "UP", "DOWN", "LEFT", "RIGHT"
- Consider using direction + emoji (e.g., "UP ↑")

## Component Lifecycle

### On Mount
1. Select random target direction
2. Generate arrow grid with all 4 directions
3. Shuffle arrow positions
4. Render game

### On Correct Selection
1. Play success animation (300ms)
2. Call `onComplete()`
3. Component unmounts

### On Incorrect Selection
1. Play error feedback
2. Keep game state
3. Allow immediate retry

## Edge Cases

### Visual Orientation
- Ensure arrows are clearly oriented
- Test on different screen orientations
- Verify rotation values are correct

### Instruction Clarity
- Direction names must be obvious
- Consider cultural/language differences in direction terms
- "LEFT" and "RIGHT" vs "WEST" and "EAST"

### Tap Response
- Immediate feedback
- No delay between taps
- Clear which arrow was tapped

## Testing Scenarios

1. **Each direction:** Test with each direction as target
2. **Each position:** Verify target works in all grid positions
3. **Correct tap:** Verify completion
4. **Wrong tap:** Verify no completion, can retry
5. **Visual verification:** All arrows clearly point in correct directions
6. **Multiple wrong taps:** Verify game doesn't break

## Animation Examples

### Correct Tap Feedback
```typescript
// CSS
.arrow-button.correct {
  animation: correctPulse 0.3s ease-in-out;
}

@keyframes correctPulse {
  0%, 100% { 
    transform: scale(1);
    background-color: transparent;
  }
  50% { 
    transform: scale(1.15);
    background-color: rgba(16, 185, 129, 0.2);
  }
}

.arrow-button.correct svg {
  animation: arrowGlow 0.3s ease-in-out;
}

@keyframes arrowGlow {
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50% { filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.8)); }
}
```

### Wrong Tap Feedback
```typescript
// CSS
.arrow-button.wrong {
  animation: wrongShake 0.3s ease-in-out;
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.arrow-button.wrong::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #EF4444;
  animation: flashBorder 0.3s ease-out;
}

@keyframes flashBorder {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
```

### Hover/Press Effect
```typescript
// CSS
.arrow-button:active {
  transform: scale(0.95);
  background-color: rgba(0, 0, 0, 0.05);
}
```

## Grid Layout Options

### Option 1: Square Grid (2×2)
```
[ ↑ ] [ → ]
[ ↓ ] [ ← ]
```
- Clean, symmetrical
- Easy to scan
- Recommended for POC

### Option 2: Diamond Layout
```
    [ ↑ ]
[ ← ]   [ → ]
    [ ↓ ]
```
- Matches actual directions visually
- More intuitive
- Requires more screen space

### Option 3: Row Layout
```
[ ↑ ] [ → ] [ ↓ ] [ ← ]
```
- Horizontal arrangement
- Works better in landscape
- Takes less vertical space

## Variations for POC

### Standard (Recommended)
- 4 cardinal directions
- 2×2 grid layout
- Simple arrow icons
- Clear text instructions

### With Icons
- Add emoji to instructions
- "Tap the arrow pointing UP ⬆️"
- More visual clarity

### Color-Coded (Optional)
- Each direction has a color
- "Tap the BLUE arrow pointing RIGHT"
- Adds another recognition layer

## Future Enhancements (Not in POC)
- Diagonal directions (NE, SE, SW, NW)
- More arrows (3×3 grid with 8 directions)
- Moving/rotating arrows
- Time pressure (limited time to respond)
- Multiple correct answers
- Sequence of directions
- Arrow colors that must also match
- Arrows that point to a target location