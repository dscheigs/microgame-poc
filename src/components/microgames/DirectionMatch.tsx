import React, { useState, useEffect } from "react";
import { MicrogameProps } from "../../types/game.types";

type Direction = 'up' | 'down' | 'left' | 'right';

interface ArrowConfig {
  id: number;
  direction: Direction;
  rotation: number;
  isTarget: boolean;
}

interface DirectionMatchState {
  targetDirection: Direction;
  arrows: ArrowConfig[];
  feedback: number | null;
}

const DIRECTIONS: Record<Direction, { label: string; rotation: number }> = {
  up: { label: 'UP', rotation: 0 },
  right: { label: 'RIGHT', rotation: 90 },
  down: { label: 'DOWN', rotation: 180 },
  left: { label: 'LEFT', rotation: 270 },
};

const ALL_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

const DirectionMatch: React.FC<MicrogameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<DirectionMatchState>({
    targetDirection: 'up',
    arrows: [],
    feedback: null,
  });

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
      feedback: null,
    };
  };

  const handleArrowTap = (index: number): void => {
    if (gameState.feedback !== null) return; // Prevent multiple taps during feedback
    
    const arrow = gameState.arrows[index];
    
    if (arrow.isTarget) {
      // Correct!
      setGameState(prev => ({ ...prev, feedback: index }));
      
      setTimeout(() => {
        onComplete();
      }, 500);
    } else {
      // Wrong!
      setGameState(prev => ({ ...prev, feedback: index }));
      
      setTimeout(() => {
        setGameState(prev => ({ ...prev, feedback: null }));
      }, 500);
    }
  };

  const getArrowClassName = (index: number): string => {
    if (gameState.feedback === index) {
      const arrow = gameState.arrows[index];
      return arrow.isTarget ? 'direction-arrow correct' : 'direction-arrow wrong';
    }
    return 'direction-arrow';
  };

  // Initialize game on mount
  useEffect(() => {
    setGameState(generateGame());
  }, []);

  return (
    <div 
      role="main" 
      aria-label="Direction matching game"
      style={{ 
        padding: '2rem',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Instructions */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Tap the arrow pointing
        </p>
        <p style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold',
          color: '#2196F3',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          margin: 0
        }}>
          {DIRECTIONS[gameState.targetDirection].label}
        </p>
      </div>

      {/* Arrow Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '25px',
        maxWidth: '320px',
        margin: '0 auto'
      }}>
        {gameState.arrows.map((arrow, index) => (
          <button
            key={arrow.id}
            className={getArrowClassName(index)}
            style={{
              width: '130px',
              height: '130px',
              backgroundColor: '#ffffff',
              border: '3px solid #333',
              borderRadius: '12px',
              cursor: gameState.feedback === null ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#333',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
            onClick={() => handleArrowTap(index)}
            disabled={gameState.feedback !== null}
            aria-label={`Arrow pointing ${arrow.direction}`}
          >
            <span 
              style={{
                transform: `rotate(${arrow.rotation}deg)`,
                transition: 'transform 0.2s ease'
              }}
            >
              ↑
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .direction-arrow.correct {
          animation: correctScale 0.5s ease-in-out;
          background-color: #4CAF50 !important;
          color: white;
        }

        @keyframes correctScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .direction-arrow.wrong {
          animation: wrongShake 0.5s ease-in-out;
          background-color: #F44336 !important;
          color: white;
        }

        @keyframes wrongShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }

        .direction-arrow:hover:not(:disabled) {
          background-color: #f0f0f0 !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default DirectionMatch;