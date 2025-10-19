# Sequence Memory Microgame Specification

## Overview
Sequence Memory is a Simon-style memory game where the player watches a sequence of buttons light up, then must repeat the sequence back by tapping the buttons in the correct order.

## Objective
Watch the sequence of button flashes, then tap the buttons in the same order to complete the pattern.

## Game Mechanics

### Setup
- Display 4 colored buttons in a grid
- Generate a random sequence of 4 button presses
- Play the sequence for the player (visual animation)
- Player then repeats the sequence

### Win Condition
Player successfully taps all 4 buttons in the correct order.

### Lose Condition
Player taps an incorrect button at any point in the sequence (they can retry).

## Props Interface

```typescript
interface SequenceMemoryProps {
  onComplete: () => void;
  level: number;
}
```

## Internal State

```typescript
interface SequenceMemoryState {
  sequence: number[];           // [0-3] array of 4 button indices
  playerSequence: number[];     // Player's current input
  isPlaying: boolean;           // Is the sequence currently being shown?
  currentFlash: number | null;  // Which button is currently lit (-1 = none)
  phase: 'showing' | 'input';   // Current game phase
}
```

## Button Configuration

```typescript
const BUTTONS = [
  { id: 0, color: '#EF4444', position: 'top-left' },     // Red
  { id: 1, color: '#3B82F6', position: 'top-right' },    // Blue
  { id: 2, color: '#F59E0B', position: 'bottom-left' },  // Orange
  { id: 3, color: '#10B981', position: 'bottom-right' }, // Green
];
```

## Sequence Generation

```typescript
const generateSequence = (length: number = 4): number[] => {
  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * 4));
  }
  return sequence;
};
```

## UI Layout

```
┌─────────────────────────────────┐
│                                 │
│      "Watch and repeat"         │
│         or "Your turn"          │
│                                 │
│     ┌─────────┬─────────┐      │
│     │         │         │      │
│     │    1    │    2    │      │
│     │  [Red]  │  [Blue] │      │
│     │         │         │      │
│     ├─────────┼─────────┤      │
│     │         │         │      │
│     │    3    │    4    │      │
│     │ [Orange]│ [Green] │      │
│     │         │         │      │
│     └─────────┴─────────┘      │
│                                 │
│    Progress: ●●○○ (2 of 4)     │
│                                 │
└─────────────────────────────────┘
```

### Element Specifications

**Instruction Text**
- Dynamic text showing current phase
- "Watch and repeat" during sequence playback
- "Your turn!" during input phase
- Top of screen, centered

**Button Grid**
- 2x2 grid of colored squares/rectangles
- Each button: 120-150px square
- 15-20px gap between buttons
- Centered on screen

**Progress Indicator**
- Small dots showing player's progress through input
- Example: ●●○○ means player has entered 2 of 4 correct
- Below button grid
- Updates as player taps

## Game Flow

### Phase 1: Show Sequence
1. Display "Watch and repeat" message
2. Disable all button interactions
3. Play sequence with timing:
   - Light up button (400ms)
   - Dark period (200ms)
   - Repeat for all 4 buttons
4. After sequence completes, wait 300ms
5. Transition to input phase

### Phase 2: Player Input
1. Display "Your turn!" message
2. Enable all button interactions
3. Track player's taps in order
4. After each tap:
   - Check if it matches the sequence at that index
   - If correct: continue, update progress indicator
   - If incorrect: show error, reset playerSequence
5. If all 4 correct: call `onComplete()`

## Sequence Playback

```typescript
const playSequence = async (): Promise<void> => {
  setState({ phase: 'showing', isPlaying: true });
  
  for (let i = 0; i < sequence.length; i++) {
    const buttonIndex = sequence[i];
    
    // Light up button
    setState({ currentFlash: buttonIndex });
    await delay(400);
    
    // Turn off
    setState({ currentFlash: null });
    await delay(200);
  }
  
  setState({ 
    phase: 'input', 
    isPlaying: false,
    playerSequence: [] 
  });
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
```

## User Interaction

### Button Tap Handler
```typescript
const handleButtonTap = (buttonIndex: number): void => {
  // Only accept input during input phase
  if (phase !== 'input') return;
  
  const currentStep = playerSequence.length;
  const expectedButton = sequence[currentStep];
  
  if (buttonIndex === expectedButton) {
    // Correct!
    const newPlayerSequence = [...playerSequence, buttonIndex];
    setState({ playerSequence: newPlayerSequence });
    
    // Brief visual feedback
    playButtonFeedback(buttonIndex, 'correct');
    
    // Check if sequence complete
    if (newPlayerSequence.length === sequence.length) {
      onComplete();
    }
  } else {
    // Wrong!
    playButtonFeedback(buttonIndex, 'wrong');
    
    // Reset player sequence after brief delay
    setTimeout(() => {
      setState({ playerSequence: [] });
    }, 500);
  }
};
```

### Visual Feedback

**Button Flash (During Sequence)**
- Button brightens significantly
- Smooth transition
- Clear which button is active

**Button Tap (During Input)**
- Brief highlight/scale effect
- Different feedback for correct vs wrong
- Haptic feedback on mobile (if available)

```typescript
const playButtonFeedback = (buttonIndex: number, type: 'correct' | 'wrong'): void => {
  if (type === 'correct') {
    // Brief green glow or scale
  } else {
    // Shake or red flash
  }
};
```

## Tablet Optimization

### Touch Targets
- Large buttons (120-150px minimum)
- Adequate spacing to prevent mis-taps
- Instant visual feedback on tap

### Performance
- Smooth animations during sequence playback
- No lag between taps during input
- Efficient state updates

### Orientation
- Works in both portrait and landscape
- Button grid scales appropriately
- Maintains square aspect ratio for buttons

## Accessibility

### Visual
- High contrast between button colors
- Clear visual distinction when lit vs unlit
- Large, easy to see buttons

### Semantic HTML
```typescript
<div role="main" aria-label="Sequence memory game">
  <p aria-live="polite" className="instruction-text">
    {phase === 'showing' ? 'Watch and repeat' : 'Your turn!'}
  </p>
  
  <div 
    className="button-grid" 
    role="group" 
    aria-label="Memory buttons"
    aria-disabled={phase === 'showing'}
  >
    {BUTTONS.map((button) => (
      <button
        key={button.id}
        className={`memory-button ${currentFlash === button.id ? 'active' : ''}`}
        style={{ backgroundColor: button.color }}
        onClick={() => handleButtonTap(button.id)}
        disabled={phase === 'showing'}
        aria-label={`${button.color} button`}
      />
    ))}
  </div>
  
  <div className="progress-indicator" aria-label={`Progress: ${playerSequence.length} of ${sequence.length}`}>
    {sequence.map((_, index) => (
      <span 
        key={index}
        className={index < playerSequence.length ? 'filled' : 'empty'}
      />
    ))}
  </div>
</div>
```

## Component Lifecycle

### On Mount
1. Generate random 4-button sequence
2. Initialize state
3. Automatically start sequence playback after 500ms
4. Show "Watch and repeat" message

### During Playback
1. Disable all button interactions
2. Animate sequence
3. Track current flash state

### During Input
1. Enable button interactions
2. Track player input
3. Validate each tap
4. Reset on error or complete on success

## Edge Cases

### Rapid Tapping
- Ignore taps during sequence playback
- Debounce button taps during input phase
- Prevent double-taps on same button

### Sequence Playback Interruption
- Ensure sequence always completes before accepting input
- Handle component unmount mid-sequence gracefully

### Wrong Input Recovery
- Clear visual indication of mistake
- Brief delay before allowing retry
- Reset progress indicator
- Maintain same sequence (don't regenerate)

## Testing Scenarios

1. **Full correct sequence:** Complete all 4 taps correctly
2. **Wrong first tap:** Verify reset and retry
3. **Wrong middle tap:** Tap 2 correct, then wrong, verify reset
4. **Sequence visibility:** Verify all 4 buttons in sequence are visible
5. **Timing:** Verify appropriate delays between flashes
6. **Input during playback:** Verify taps ignored during "showing" phase

## Animation Examples

### Button Flash (Sequence Playback)
```typescript
// CSS
.memory-button {
  transition: all 0.15s ease-in-out;
  filter: brightness(0.7);
}

.memory-button.active {
  filter: brightness(1.3);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}
```

### Correct Input Feedback
```typescript
// CSS
.memory-button.correct-tap {
  animation: correctPulse 0.3s ease-in-out;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### Wrong Input Feedback
```typescript
// CSS
.memory-button.wrong-tap {
  animation: wrongShake 0.4s ease-in-out;
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  75% { transform: translateX(-10px); }
}
```

## Audio (Future Enhancement)
- Unique tone for each button
- Play tone during sequence playback
- Play tone on player tap
- Different sound for correct/wrong

## Future Enhancements (Not in POC)
- Longer sequences for higher difficulty
- Speed up playback for difficulty
- Add 5th or 6th button
- Score based on speed of completion
- Sound effects for buttons
- Vibration feedback on mobile