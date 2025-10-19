# Speed Tap Microgame Specification

## Overview
Speed Tap is a simple reaction-based microgame where the player must rapidly tap a specific colored target a certain number of times to complete the challenge.

## Objective
Tap the target button 10 times as quickly as possible.

## Game Mechanics

### Setup
- Display 3-4 colored buttons
- One button is designated as the "target" (highlighted/indicated)
- Player must tap the target button 10 times
- Other buttons are distractors

### Win Condition
Player successfully taps the correct target button 10 times.

### Failure Handling
Tapping a wrong button does NOT count toward the total, but also doesn't penalize (global timer continues).

## Props Interface

```typescript
interface SpeedTapProps {
  onComplete: () => void;
  level: number;
}
```

## Internal State

```typescript
interface SpeedTapState {
  buttons: ButtonConfig[];
  targetIndex: number;
  tapCount: number;          // Current taps on target
  requiredTaps: number;      // 10 for POC
  wrongTapFeedback: number | null;  // Index of wrong button tapped
}

interface ButtonConfig {
  id: number;
  color: string;
  label: string;
  isTarget: boolean;
}
```

## Button Configuration

```typescript
const BUTTON_COLORS = [
  { color: '#EF4444', label: 'Red' },
  { color: '#3B82F6', label: 'Blue' },
  { color: '#10B981', label: 'Green' },
  { color: '#F59E0B', label: 'Orange' },
];
```

## Game Generation

```typescript
const generateGame = (): SpeedTapState => {
  // Shuffle and select 3 colors
  const shuffled = [...BUTTON_COLORS].sort(() => Math.random() - 0.5);
  const selectedColors = shuffled.slice(0, 3);
  
  // Random target
  const targetIndex = Math.floor(Math.random() * 3);
  
  const buttons = selectedColors.map((config, index) => ({
    id: index,
    color: config.color,
    label: config.label,
    isTarget: index === targetIndex,
  }));
  
  return {
    buttons,
    targetIndex,
    tapCount: 0,
    requiredTaps: 10,
    wrongTapFeedback: null,
  };
};
```

## UI Layout

```
┌─────────────────────────────────┐
│                                 │
│     "Tap the GREEN button"      │
│           "10 times"            │
│                                 │
│         Progress: 3/10          │
│     ████████░░░░░░░░░░░        │
│                                 │
│                                 │
│        ┌────────────┐           │
│        │            │           │
│        │   TARGET   │ ← Larger  │
│        │   BUTTON   │           │
│        │            │           │
│        └────────────┘           │
│                                 │
│    ┌────────┐  ┌────────┐      │
│    │ WRONG  │  │ WRONG  │      │
│    │ BUTTON │  │ BUTTON │      │
│    └────────┘  └────────┘      │
│                                 │
└─────────────────────────────────┘
```

### Element Specifications

**Instruction Text**
- "Tap the [COLOR] button"
- "[NUMBER] times" or "[NUMBER] more!"
- Top of screen, large and clear
- Updates with target color

**Progress Display**
- Shows current tap count vs required (e.g., "3/10")
- Progress bar showing completion
- Updates immediately on each tap

**Target Button**
- Larger than distractor buttons (150x150px vs 100x100px)
- Positioned prominently (center top)
- Clear visual distinction (border, glow, or label)
- Matches the color mentioned in instructions

**Distractor Buttons**
- Smaller than target (100x100px)
- Below or beside target button
- Different colors from target
- 2 distractor buttons total

## User Interaction

### Tap Handling
```typescript
const handleButtonTap = (index: number): void => {
  const button = buttons[index];
  
  if (button.isTarget) {
    // Correct tap!
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    // Visual feedback
    playCorrectTapFeedback();
    
    // Check completion
    if (newCount >= requiredTaps) {
      setTimeout(() => {
        onComplete();
      }, 200);
    }
  } else {
    // Wrong button!
    playWrongTapFeedback(index);
    
    // Brief visual feedback, no penalty
    setWrongTapFeedback(index);
    setTimeout(() => {
      setWrongTapFeedback(null);
    }, 300);
  }
};
```

### Feedback

**Correct Tap**
- Brief scale/pulse animation on target button
- Progress counter increments
- Progress bar fills
- Haptic feedback (if available)
- No delay - can tap rapidly

**Wrong Tap**
- Shake animation on wrong button
- Brief red flash
- No progress increment
- Can immediately tap correct button
- No time penalty

## Progress Visualization

### Counter Display
```typescript
const ProgressCounter: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="progress-counter">
    <span className="current">{current}</span>
    <span className="separator">/</span>
    <span className="total">{total}</span>
  </div>
);
```

### Progress Bar
```typescript
const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
```

## Tablet Optimization

### Touch Targets
- Target button: 150x150px (very large)
- Distractor buttons: 100x100px
- Adequate spacing between all buttons (20-30px)
- Optimized for rapid repeated tapping

### Performance
- Instant tap response (critical for speed game)
- Efficient state updates (don't re-render entire component)
- Smooth progress bar animation
- No lag or delay between taps

### Tap Detection
- Prevent default touch behaviors
- Handle rapid successive taps
- No double-tap zoom
- Touch feedback immediate

```typescript
const handleTouchStart = (e: React.TouchEvent, index: number): void => {
  e.preventDefault(); // Prevent default behaviors
  handleButtonTap(index);
};
```

## Accessibility

### Visual
- Large, clear buttons
- High contrast colors
- Clear progress indication
- Easy-to-read text

### Instructions
- Clear target identification by color name
- Large instruction text
- Real-time progress updates

### Semantic HTML
```typescript
<div role="main" aria-label="Speed tap game">
  <div className="instructions" aria-live="polite">
    <p>Tap the <strong>{buttons[targetIndex].label}</strong> button</p>
    <p className="tap-count">10 times</p>
  </div>
  
  <div 
    className="progress-display" 
    aria-live="polite"
    aria-label={`Progress: ${tapCount} of ${requiredTaps} taps`}
  >
    <div className="counter">{tapCount}/{requiredTaps}</div>
    <div className="progress-bar" role="progressbar" aria-valuenow={tapCount} aria-valuemax={requiredTaps}>
      <div style={{ width: `${(tapCount / requiredTaps) * 100}%` }} />
    </div>
  </div>
  
  <div className="button-area">
    <button
      className={`tap-button target ${wrongTapFeedback === targetIndex ? 'tapped' : ''}`}
      style={{ backgroundColor: buttons[targetIndex].color }}
      onClick={() => handleButtonTap(targetIndex)}
      aria-label={`${buttons[targetIndex].label} target button`}
    >
      {/* Target button */}
    </button>
    
    <div className="distractor-buttons">
      {buttons.map((button, index) => (
        !button.isTarget && (
          <button
            key={button.id}
            className={`tap-button distractor ${wrongTapFeedback === index ? 'wrong' : ''}`}
            style={{ backgroundColor: button.color }}
            onClick={() => handleButtonTap(index)}
            aria-label={`${button.label} distractor button`}
          >
            {/* Distractor button */}
          </button>
        )
      ))}
    </div>
  </div>
</div>
```

## Component Lifecycle

### On Mount
1. Generate game configuration
2. Select random target color
3. Select 2 distractor colors
4. Initialize tap count to 0
5. Render layout

### During Gameplay
1. Track each tap
2. Update progress immediately
3. Provide instant visual feedback
4. No delays between valid taps

### On Completion
1. Brief success animation
2. Small delay (200ms)
3. Call `onComplete()`
4. Component unmounts

## Edge Cases

### Rapid Tapping
- Handle multiple taps per second
- No tap limit or cooldown
- Ensure all taps register correctly
- Prevent event queue overflow

### Accidental Wrong Taps
- Clear feedback but no penalty
- Can immediately resume tapping target
- Wrong taps don't reset progress

### Touch vs Mouse
- Works with both touch and mouse
- No hover states (touch-first design)
- Consistent behavior across input types

### Button Mashing
- Only target button taps count
- Can tap as fast as physically possible
- System handles rapid state updates

## Testing Scenarios

1. **Complete 10 taps:** Verify completion
2. **Mixed taps:** Tap wrong buttons intermittently, verify only target counts
3. **Rapid taps:** Tap as fast as possible, verify all register
4. **All wrong taps:** Tap only wrong buttons, verify no progress
5. **Target position:** Test with target in different positions
6. **Progress accuracy:** Verify counter and bar match tap count

## Animation Examples

### Correct Tap Feedback
```typescript
// CSS
.tap-button.target.tapped {
  animation: correctTap 0.15s ease-out;
}

@keyframes correctTap {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
```

### Wrong Tap Feedback
```typescript
// CSS
.tap-button.wrong {
  animation: wrongTap 0.3s ease-in-out;
}

@keyframes wrongTap {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.tap-button.wrong::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(239, 68, 68, 0.3);
  animation: flashRed 0.3s ease-out;
}

@keyframes flashRed {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
```

### Progress Bar Fill
```typescript
// CSS
.progress-bar-fill {
  transition: width 0.1s ease-out;
  background: linear-gradient(90deg, #10B981, #059669);
}
```

### Completion Animation
```typescript
// CSS
.tap-button.target.complete {
  animation: celebrate 0.4s ease-in-out;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}
```

## Variations for POC

### Option 1: Standard (Recommended)
- 10 taps required
- 1 target button (large)
- 2 distractor buttons (smaller)
- Simple color-based identification

### Option 2: Fewer Taps
- 5 taps required
- Faster completion
- Good for testing

### Option 3: More Distractors
- 10 taps required
- 1 target button
- 3-4 distractor buttons
- Slightly harder

## Future Enhancements (Not in POC)
- Increase tap requirement with difficulty
- Moving target button
- Buttons that change position after each tap
- Time limit for completion
- Combo system (faster taps = bonus)
- Target button changes color mid-game
- Multiple target buttons (tap each 5 times)