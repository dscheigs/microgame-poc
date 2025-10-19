# Odd One Out Microgame Specification

## Overview
Odd One Out is a visual discrimination game where the player must identify and tap the one item that is different from all the others in a grid of similar items.

## Objective
Find and tap the item that is different from all the others.

## Game Mechanics

### Setup
- Display a grid of 8 items
- 7 items are identical
- 1 item is different (the "odd one out")
- Difference should be obvious but require visual scanning

### Win Condition
Player successfully taps the odd item.

### Difficulty Considerations (POC)
- Clear visual difference (color, shape, size, or orientation)
- 8 items total (manageable scan time)
- Single correct answer

## Props Interface

```typescript
interface OddOneOutProps {
  onComplete: () => void;
  level: number;
}
```

## Internal State

```typescript
interface OddOneOutState {
  items: GridItem[];
  oddItemIndex: number;
}

interface GridItem {
  id: number;
  type: ItemType;
  isOdd: boolean;
}

type ItemType = 'circle' | 'square' | 'triangle' | 'star';
```

## Item Variations

### Shape Variations
```typescript
const SHAPE_SETS = [
  {
    normal: { shape: 'circle', color: '#3B82F6' },
    odd: { shape: 'circle', color: '#EF4444' }  // Different color
  },
  {
    normal: { shape: 'square', color: '#10B981' },
    odd: { shape: 'circle', color: '#10B981' }  // Different shape
  },
  {
    normal: { shape: 'triangle', color: '#F59E0B', rotation: 0 },
    odd: { shape: 'triangle', color: '#F59E0B', rotation: 180 }  // Rotated
  },
  {
    normal: { shape: 'star', color: '#8B5CF6', size: 60 },
    odd: { shape: 'star', color: '#8B5CF6', size: 80 }  // Different size
  },
];
```

### Difference Types
1. **Color:** Same shape, different color
2. **Shape:** Different shape, same color
3. **Rotation:** Same shape/color, rotated orientation
4. **Size:** Same shape/color, larger/smaller

## Game Generation

```typescript
const generateGame = (): OddOneOutState => {
  // Select random variation set
  const set = SHAPE_SETS[Math.floor(Math.random() * SHAPE_SETS.length)];
  
  // Select random position for odd item (0-7)
  const oddItemIndex = Math.floor(Math.random() * 8);
  
  // Create 8 items
  const items: GridItem[] = Array.from({ length: 8 }, (_, index) => ({
    id: index,
    type: index === oddItemIndex ? set.odd : set.normal,
    isOdd: index === oddItemIndex,
  }));
  
  return {
    items,
    oddItemIndex,
  };
};
```

## UI Layout

```
┌─────────────────────────────────┐
│                                 │
│     "Find the odd one out"      │
│                                 │
│    ┌────┬────┬────┬────┐       │
│    │ ○  │ ○  │ ○  │ ○  │       │
│    ├────┼────┼────┼────┤       │
│    │ ○  │ ●  │ ○  │ ○  │       │
│    └────┴────┴────┴────┘       │
│                                 │
│    (● = different item)         │
│                                 │
└─────────────────────────────────┘
```

### Grid Layout
- 4 columns × 2 rows = 8 items
- Equal spacing between items
- Centered on screen
- Each item: 70-90px square area

### Alternative Layout (3-3-2)
```
   ┌────┬────┬────┐
   │    │    │    │
   ├────┼────┼────┤
   │    │    │    │
   ├────┼────┼────┤
   │    │    │    │
   └────┴────┴────┘
```
- 3 rows: 3-3-2 items
- More compact
- Better for portrait orientation

## User Interaction

### Tap Handling
```typescript
const handleItemTap = (index: number): void => {
  const item = items[index];
  
  if (item.isOdd) {
    // Correct! Brief success feedback
    playSuccessFeedback(index);
    setTimeout(() => {
      onComplete();
    }, 300);
  } else {
    // Wrong! Brief error feedback
    playErrorFeedback(index);
    // Let them try again immediately
  }
};
```

### Feedback
- **Correct:** 
  - Brief highlight/pulse on tapped item
  - Immediate progression (with short delay for feedback)
  
- **Incorrect:**
  - Shake animation on tapped item
  - Red flash or border
  - Can immediately try again
  - No penalty (global timer continues)

## Shape Rendering

### Circle
```typescript
const Circle: React.FC<ShapeProps> = ({ color, size = 60 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
    }}
  />
);
```

### Square
```typescript
const Square: React.FC<ShapeProps> = ({ color, size = 60 }) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
    }}
  />
);
```

### Triangle
```typescript
const Triangle: React.FC<ShapeProps> = ({ color, size = 60, rotation = 0 }) => (
  <div
    style={{
      width: 0,
      height: 0,
      borderLeft: `${size / 2}px solid transparent`,
      borderRight: `${size / 2}px solid transparent`,
      borderBottom: `${size}px solid ${color}`,
      transform: `rotate(${rotation}deg)`,
    }}
  />
);
```

### Star (SVG)
```typescript
const Star: React.FC<ShapeProps> = ({ color, size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
    />
  </svg>
);
```

## Tablet Optimization

### Touch Targets
- Each grid cell: minimum 70px × 70px
- Adequate spacing between items (15-20px)
- Large enough shapes within cells
- No precision tapping required

### Layout Responsiveness
- Grid scales to fit screen
- Maintains aspect ratio
- Works in portrait and landscape
- Centers on available space

### Performance
- Simple SVG/CSS shapes (lightweight)
- Instant tap response
- Smooth animations

## Accessibility

### Visual
- High contrast between items and background
- Clear size differences when size is the variation
- Obvious color differences
- Distinct shape differences

### Semantic HTML
```typescript
<div role="main" aria-label="Odd one out game">
  <p className="instruction-text">Find the odd one out</p>
  
  <div 
    className="item-grid" 
    role="grid" 
    aria-label="Grid of items"
  >
    {items.map((item, index) => (
      <button
        key={item.id}
        className="grid-item"
        onClick={() => handleItemTap(index)}
        aria-label={`Item ${index + 1}${item.isOdd ? ' - different item' : ''}`}
      >
        <ItemShape {...item.type} />
      </button>
    ))}
  </div>
</div>
```

### Color Blindness Considerations
- Don't rely solely on color differences
- Use shape, size, or orientation variations
- If using color, ensure high contrast
- Test with color blindness simulators

## Component Lifecycle

### On Mount
1. Generate random game configuration
2. Select variation type
3. Place odd item randomly
4. Render grid

### On Correct Selection
1. Play success animation
2. Brief delay (300ms)
3. Call `onComplete()`
4. Component unmounts

### On Incorrect Selection
1. Play error animation
2. Keep game state unchanged
3. Allow immediate retry

## Edge Cases

### Visual Similarity
- Ensure odd item is clearly distinguishable
- Avoid variations that are too subtle
- Test with different screen sizes/resolutions

### Accidental Taps
- Provide clear feedback for each tap
- Allow unlimited retries
- No negative consequences for wrong taps

### Grid Position
- Ensure odd item can appear in any position
- Test all 8 positions
- Avoid patterns in placement

## Testing Scenarios

1. **Each variation type:** Test color, shape, rotation, size differences
2. **All positions:** Odd item in each of 8 positions
3. **Correct tap:** Verify completion
4. **Wrong tap:** Verify no completion, can retry
5. **Multiple wrong taps:** Verify game doesn't break
6. **Visual clarity:** Verify odd item is easily identifiable

## Animation Examples

### Correct Tap
```typescript
// CSS
.grid-item.correct {
  animation: correctGlow 0.4s ease-in-out;
}

@keyframes correctGlow {
  0%, 100% { 
    transform: scale(1);
    box-shadow: none;
  }
  50% { 
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
  }
}
```

### Wrong Tap
```typescript
// CSS
.grid-item.wrong {
  animation: wrongShake 0.3s ease-in-out;
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```

### Item Hover/Press Effect
```typescript
// CSS
.grid-item:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
```

## Variation Examples

### Easy Examples (POC)
1. **7 blue circles, 1 red circle**
2. **7 squares, 1 circle**
3. **7 triangles pointing up, 1 pointing down**
4. **7 small stars, 1 large star**

### Future Difficulty Variations
- More items (12-16 instead of 8)
- Subtle differences (similar colors, slight size changes)
- Multiple differences (2-3 odd items, find all)
- Pattern-based (odd one doesn't fit pattern)
- Combination differences (color AND size)

## Future Enhancements (Not in POC)
- Multiple difficulty levels
- More variation types
- Time bonus for quick identification
- Progressive reveal (starts blurry)
- Category-based (animals, letters, numbers)
- Multiple odd items to 