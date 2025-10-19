import React, { useState, useEffect } from "react";
import { MicrogameProps } from "../../types/game.types";

interface ButtonConfig {
  id: number;
  color: string;
  label: string;
  isTarget: boolean;
}

interface SpeedTapState {
  buttons: ButtonConfig[];
  targetIndex: number;
  tapCount: number;
  requiredTaps: number;
  wrongTapFeedback: number | null;
  correctTapFeedback: boolean;
}

const BUTTON_COLORS = [
  { color: '#EF4444', label: 'Red' },
  { color: '#3B82F6', label: 'Blue' },
  { color: '#10B981', label: 'Green' },
  { color: '#F59E0B', label: 'Orange' },
];

const SpeedTap: React.FC<MicrogameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<SpeedTapState>({
    buttons: [],
    targetIndex: 0,
    tapCount: 0,
    requiredTaps: 10,
    wrongTapFeedback: null,
    correctTapFeedback: false,
  });

  const generateGame = (): SpeedTapState => {
    // Use all 4 colors
    const buttons = BUTTON_COLORS.map((config, index) => ({
      id: index,
      color: config.color,
      label: config.label,
      isTarget: false, // Will be set dynamically
    }));
    
    // Random initial target
    const targetIndex = Math.floor(Math.random() * 4);
    buttons[targetIndex].isTarget = true;
    
    return {
      buttons,
      targetIndex,
      tapCount: 0,
      requiredTaps: 15,
      wrongTapFeedback: null,
      correctTapFeedback: false,
    };
  };

  const selectNewTarget = (currentTargetIndex: number): number => {
    // Pick a different color than the current one
    let newTarget;
    do {
      newTarget = Math.floor(Math.random() * 4);
    } while (newTarget === currentTargetIndex);
    return newTarget;
  };

  const handleButtonTap = (index: number): void => {
    const button = gameState.buttons[index];
    
    if (button.isTarget) {
      // Correct tap!
      const newCount = gameState.tapCount + 1;
      
      // Check if we should change target (every 3 taps)
      const shouldChangeTarget = newCount % 3 === 0 && newCount < gameState.requiredTaps;
      let newTargetIndex = gameState.targetIndex;
      
      if (shouldChangeTarget) {
        newTargetIndex = selectNewTarget(gameState.targetIndex);
      }
      
      setGameState(prev => {
        const newButtons = prev.buttons.map((btn, i) => ({
          ...btn,
          isTarget: i === newTargetIndex
        }));
        
        return {
          ...prev,
          buttons: newButtons,
          targetIndex: newTargetIndex,
          tapCount: newCount,
          correctTapFeedback: true
        };
      });
      
      // Clear correct feedback
      setTimeout(() => {
        setGameState(prev => ({ ...prev, correctTapFeedback: false }));
      }, 150);
      
      // Check completion
      if (newCount >= gameState.requiredTaps) {
        setTimeout(() => {
          onComplete();
        }, 200);
      }
    } else {
      // Wrong button!
      setGameState(prev => ({ ...prev, wrongTapFeedback: index }));
      
      // Clear wrong feedback
      setTimeout(() => {
        setGameState(prev => ({ ...prev, wrongTapFeedback: null }));
      }, 300);
    }
  };

  const getButtonClassName = (index: number): string => {
    let className = 'speed-tap-button';
    
    if (gameState.buttons[index]?.isTarget) {
      className += ' target-button';
      if (gameState.correctTapFeedback) {
        className += ' correct-tap';
      }
    }
    
    if (gameState.wrongTapFeedback === index) {
      className += ' wrong-tap';
    }
    
    return className;
  };

  const getProgressPercentage = (): number => {
    return (gameState.tapCount / gameState.requiredTaps) * 100;
  };

  // Initialize game on mount
  useEffect(() => {
    setGameState(generateGame());
  }, []);

  const targetButton = gameState.buttons.find(btn => btn.isTarget);

  return (
    <div 
      role="main" 
      aria-label="Speed tap game"
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
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Tap the{' '}
          <span style={{ 
            color: targetButton?.color,
            fontSize: '1.8rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            {targetButton?.label.toUpperCase()}
          </span>
          {' '}button
        </p>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          {gameState.requiredTaps - gameState.tapCount} more times!
        </p>
      </div>

      {/* Progress Display */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          fontFamily: 'monospace'
        }}>
          {gameState.tapCount}/{gameState.requiredTaps}
        </div>
        
        {/* Progress Bar */}
        <div style={{
          width: '300px',
          height: '20px',
          backgroundColor: '#E0E0E0',
          borderRadius: '10px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${getProgressPercentage()}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.2s ease',
            borderRadius: '10px'
          }} />
        </div>
      </div>

      {/* All Buttons in 2x2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        maxWidth: '350px',
        margin: '0 auto'
      }}>
        {gameState.buttons.map((button) => (
          <button
            key={button.id}
            className={getButtonClassName(button.id)}
            style={{
              backgroundColor: button.color,
              width: '140px',
              height: '140px',
              border: '3px solid #333',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleButtonTap(button.id)}
            aria-label={`${button.label} ${button.isTarget ? 'target' : ''} button`}
          >
            {button.label}
          </button>
        ))}
      </div>

      <style>{`
        .speed-tap-button.correct-tap {
          animation: correctPulse 0.15s ease-in-out;
        }

        @keyframes correctPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .speed-tap-button.wrong-tap {
          animation: wrongShake 0.3s ease-in-out;
        }

        @keyframes wrongShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

      `}</style>
    </div>
  );
};

export default SpeedTap;