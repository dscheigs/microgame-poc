import React, { useState, useEffect } from "react";
import { MicrogameProps } from "../../types/game.types";

interface ShapeProps {
  color: string;
  size?: number;
  rotation?: number;
}

interface GridItem {
  id: number;
  shape: string;
  color: string;
  size: number;
  rotation: number;
  isOdd: boolean;
}

interface OddOneOutState {
  items: GridItem[];
  oddItemIndex: number;
  feedback: number | null;
}

const SHAPE_SETS = [
  {
    normal: { shape: 'circle', color: '#3B82F6', size: 60, rotation: 0 },
    odd: { shape: 'circle', color: '#EF4444', size: 60, rotation: 0 }  // Different color
  },
  {
    normal: { shape: 'square', color: '#10B981', size: 60, rotation: 0 },
    odd: { shape: 'circle', color: '#10B981', size: 60, rotation: 0 }  // Different shape
  },
  {
    normal: { shape: 'triangle', color: '#F59E0B', size: 60, rotation: 0 },
    odd: { shape: 'triangle', color: '#F59E0B', size: 60, rotation: 180 }  // Rotated
  },
  {
    normal: { shape: 'star', color: '#8B5CF6', size: 60, rotation: 0 },
    odd: { shape: 'star', color: '#8B5CF6', size: 80, rotation: 0 }  // Different size
  },
];

// Shape Components
const Circle: React.FC<ShapeProps> = ({ color, size = 60 }) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: '50%',
      margin: '0 auto'
    }}
  />
);

const Square: React.FC<ShapeProps> = ({ color, size = 60 }) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      margin: '0 auto'
    }}
  />
);

const Triangle: React.FC<ShapeProps> = ({ color, size = 60, rotation = 0 }) => (
  <div
    style={{
      width: 0,
      height: 0,
      borderLeft: `${size/2}px solid transparent`,
      borderRight: `${size/2}px solid transparent`,
      borderBottom: `${size}px solid ${color}`,
      margin: '0 auto',
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'center'
    }}
  />
);

const Star: React.FC<ShapeProps> = ({ color, size = 60 }) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-block',
      margin: '0 auto',
      width: size,
      height: size
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: `${size/4}px solid transparent`,
        borderRight: `${size/4}px solid transparent`,
        borderBottom: `${size/2}px solid ${color}`
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%) rotate(180deg)',
        width: 0,
        height: 0,
        borderLeft: `${size/4}px solid transparent`,
        borderRight: `${size/4}px solid transparent`,
        borderBottom: `${size/2}px solid ${color}`
      }}
    />
  </div>
);

const OddOneOut: React.FC<MicrogameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<OddOneOutState>({
    items: [],
    oddItemIndex: 0,
    feedback: null,
  });

  const generateGame = (): OddOneOutState => {
    // Select random variation set
    const set = SHAPE_SETS[Math.floor(Math.random() * SHAPE_SETS.length)];
    
    // Select random position for odd item (0-7)
    const oddItemIndex = Math.floor(Math.random() * 8);
    
    // Create 8 items
    const items: GridItem[] = Array.from({ length: 8 }, (_, index) => {
      const config = index === oddItemIndex ? set.odd : set.normal;
      return {
        id: index,
        shape: config.shape,
        color: config.color,
        size: config.size,
        rotation: config.rotation,
        isOdd: index === oddItemIndex,
      };
    });
    
    return {
      items,
      oddItemIndex,
      feedback: null,
    };
  };

  const handleItemTap = (index: number): void => {
    if (gameState.feedback !== null) return; // Prevent multiple taps during feedback
    
    const item = gameState.items[index];
    
    setGameState(prev => ({ ...prev, feedback: index }));
    
    if (item.isOdd) {
      // Correct!
      setTimeout(() => {
        onComplete();
      }, 500);
    } else {
      // Wrong! Clear feedback after animation
      setTimeout(() => {
        setGameState(prev => ({ ...prev, feedback: null }));
      }, 500);
    }
  };

  const renderShape = (item: GridItem): React.ReactNode => {
    const props = {
      color: item.color,
      size: item.size,
      rotation: item.rotation
    };

    switch (item.shape) {
      case 'circle':
        return <Circle {...props} />;
      case 'square':
        return <Square {...props} />;
      case 'triangle':
        return <Triangle {...props} />;
      case 'star':
        return <Star {...props} />;
      default:
        return <Circle {...props} />;
    }
  };

  const getItemClassName = (index: number): string => {
    if (gameState.feedback === index) {
      const item = gameState.items[index];
      return item.isOdd ? 'grid-item correct' : 'grid-item wrong';
    }
    return 'grid-item';
  };

  // Initialize game on mount
  useEffect(() => {
    setGameState(generateGame());
  }, []);

  return (
    <div 
      role="main" 
      aria-label="Odd one out game"
      style={{ 
        padding: '2rem',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Instructions */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold',
          color: '#333',
          margin: 0
        }}>
          Find the odd one out
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {gameState.items.map((item, index) => (
          <button
            key={item.id}
            className={getItemClassName(index)}
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#ffffff',
              border: '2px solid #ddd',
              borderRadius: '8px',
              cursor: gameState.feedback === null ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => handleItemTap(index)}
            disabled={gameState.feedback !== null}
            aria-label={`Item ${index + 1}: ${item.shape} ${item.isOdd ? '(odd one)' : ''}`}
          >
            {renderShape(item)}
          </button>
        ))}
      </div>

      <style>{`
        .grid-item.correct {
          animation: correctPulse 0.5s ease-in-out;
          background-color: #4CAF50 !important;
          border-color: #4CAF50 !important;
        }

        @keyframes correctPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .grid-item.wrong {
          animation: wrongShake 0.5s ease-in-out;
          background-color: #F44336 !important;
          border-color: #F44336 !important;
        }

        @keyframes wrongShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        .grid-item:hover:not(:disabled) {
          background-color: #f8f8f8 !important;
          transform: scale(1.05);
          border-color: #bbb !important;
        }
      `}</style>
    </div>
  );
};

export default OddOneOut;