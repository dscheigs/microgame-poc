# Color Match Microgame Specification

## Overview
Color Match is a simple reaction-based microgame where the player must identify and tap the circle that matches a target color displayed above.

## Objective
Tap the circle that matches the target color shown at the top of the screen.

## Game Mechanics

### Setup
- Display a target color swatch/circle at the top
- Show 4 colored circles as options below
- One circle matches the target color exactly
- Three circles are different colors

### Win Condition
Player successfully taps the circle that matches the target color.

### Difficulty Considerations (POC)
- Use clearly distinguishable colors
- No time pressure beyond the global timer
- Single correct answer

## Props Interface

```typescript
interface ColorMatchProps {
  onComplete: () => void;
  level: number;
}
```

## Internal State

```typescript
interface ColorMatchState {
  targetColor: string;      // hex color code
  options: ColorOption[];   // array of 4 options
  selectedIndex: number | null;
}

interface ColorOption {
  color: string;            // hex color code
  isCorrect: boolean;
}
```

## Color Palette

### Recommended Colors (High Contrast)
```typescript
const COLORS = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Deep Orange
];
```

### Color Selection Logic
1. Randomly select target color from palette
2. Randomly select 3 different colors for incorrect options
3. Shuffle all 4 options randomly
4. Ensure no duplicate colors in options

```typescript
const generateGame = (): ColorMatchState => {
  const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
  const targetColor = shuffled[0];
  const incorrectColors = shuffled.slice(1, 4);
  
  const options = [
    { color: targetColor, isCorrect: true },
    { color: incorrectColors[0], isCorrect: false },
    { color: incorrectColors[1], isCorrect: false },
    { color: incorrectColors[2], isCorrect: false },
  ].sort(() => Math.random() - 0.5); // Shuffle options
  
  return {
    targetColor,
    options,
    selectedIndex: null,
  };
};
```

## UI Layout

```
┌─────────────────────────────────┐
│                                 │
│         "Match this color"      │
│                                 │
│          ┌─────────┐            │
│          │         │            │
│          │  [■]    │  ← Target  │
│          │         │            │
│          └─────────┘            │
│                                 │
│     ┌─────┐  ┌─────┐           │
│     │  A  │  │  B  │           │
│     └─────┘  └─────┘           │
│                                 │
│     ┌─────┐  ┌─────┐           │
│     │  C  │  │  D  │           │
│     └─────┘  └─────┘           │
│                                 │
└─────────────────────────────────┘
```

### Element Specifications

**Target Color Display**
- Large circle or square (120-150px)
- Centered horizontally
- Clear label above: "Match this color" or "Find this color"
- Upper third of screen

**Option Circles**
- 2x2 grid layout
- Each circle: 100-120px diameter
- Adequate spacing between circles (20-30px minimum)
- Centered in lower 2/3 of screen

## User Interaction

### Tap Handling
```typescript
const handleOptionTap = (index: number): void => {
  const option = options[index];
  
  if (option.isCorrect) {
    // Brief success feedback (optional)
    onComplete();
  } else {
    // Brief error feedback (shake animation, red flash)
    // Do not call onComplete - let player try again
  }
};
```

### Feedback
- **Correct:** Immediate progression to next level
- **Incorrect:** 
  - Visual feedback (shake/pulse animation)
  - Optional: brief red border flash
  - Player can immediately try again
  - No time penalty (global timer continues)

## Tablet Optimization

### Touch Targets
- Minimum 100px diameter circles
- 20-30px spacing between options
- Large enough to avoid mis-taps
- No hover states needed

### Orientation Support
- Works in both portrait and landscape
- Grid adjusts to available space
- Target always visible at top

### Performance
- No complex animations
- Instant tap response
- Smooth transitions

## Accessibility

### Visual
- High contrast colors
- Clear distinction between all color options
- Large touch targets

### Semantic HTML
```typescript
<div role="main" aria-label="Color matching game">
  <div className="target-section">
    <p>Match this color:</p>
    <div 
      className="target-color"
      style={{ backgroundColor: targetColor }}
      aria-label={`Target color: ${targetColor}`}
    />
  </div>
  
  <div className="options-grid" role="group" aria-label="Color options">
    {options.map((option, index) => (
      <button
        key={index}
        className="color-option"
        style={{ backgroundColor: option.color }}
        onClick={() => handleOptionTap(index)}
        aria-label={`Option ${index + 1}: ${option.color}`}
      />
    ))}
  </div>
</div>
```

## Component Lifecycle

### On Mount
1. Generate random target color
2. Generate random option set
3. Shuffle options
4. Render game

### On Correct Selection
1. (Optional) Brief success animation
2. Call `onComplete()`
3. Component will unmount as next level loads

### On Incorrect Selection
1. Play error feedback
2. Keep game state
3. Allow immediate retry

## Edge Cases

### Rapid Tapping
- Debounce or disable buttons briefly after wrong answer
- Prevent multiple simultaneous taps
- Ensure only one answer can be selected at a time

### Color Accessibility
- Use colors from predefined palette with good contrast
- All colors should be distinguishable for common color blindness types
- Consider adding subtle patterns/textures (future enhancement)

## Testing Scenarios

1. **Correct first try:** Tap correct color, verify onComplete called
2. **Wrong then right:** Tap wrong color, verify no completion, tap correct, verify completion
3. **Multiple wrong attempts:** Verify game doesn't break
4. **Rapid tapping:** Verify no double-completion or errors
5. **Visual verification:** All 4 colors distinct and visible

## Animation Examples (Optional)

### Wrong Answer Feedback
```typescript
// CSS
.color-option.wrong {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### Correct Answer Feedback
```typescript
// CSS
.color-option.correct {
  animation: success 0.3s ease-in-out;
}

@keyframes success {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

## Future Enhancements (Not in POC)
- More colors in options (5-6 instead of 4)
- Similar colors for increased difficulty
- Color names instead of swatches
- Time bonus for quick correct answers
- Patterns or textures for color-blind accessibility