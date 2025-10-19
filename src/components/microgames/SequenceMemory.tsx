import React, { useState, useEffect } from "react";
import { MicrogameProps } from "../../types/game.types";

interface SequenceMemoryState {
  sequence: number[];
  playerSequence: number[];
  isPlaying: boolean;
  currentFlash: number | null;
  phase: 'showing' | 'input';
  buttonFeedback: { [key: number]: 'correct' | 'wrong' | null };
}

const BUTTONS = [
  { id: 0, color: '#EF4444', position: 'top-left' },     // Red
  { id: 1, color: '#3B82F6', position: 'top-right' },    // Blue
  { id: 2, color: '#F59E0B', position: 'bottom-left' },  // Orange
  { id: 3, color: '#10B981', position: 'bottom-right' }, // Green
];

const SequenceMemory: React.FC<MicrogameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<SequenceMemoryState>({
    sequence: [],
    playerSequence: [],
    isPlaying: false,
    currentFlash: null,
    phase: 'showing',
    buttonFeedback: {}
  });

  const generateSequence = (length: number = 4): number[] => {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 4));
    }
    return sequence;
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const playSequence = async (sequence: number[]): Promise<void> => {
    setGameState(prev => ({ 
      ...prev, 
      phase: 'showing', 
      isPlaying: true,
      playerSequence: [],
      buttonFeedback: {}
    }));
    
    await delay(500); // Initial delay
    
    for (let i = 0; i < sequence.length; i++) {
      const buttonIndex = sequence[i];
      
      // Light up button
      setGameState(prev => ({ ...prev, currentFlash: buttonIndex }));
      await delay(400);
      
      // Turn off
      setGameState(prev => ({ ...prev, currentFlash: null }));
      await delay(200);
    }
    
    await delay(300); // Pause before input phase
    
    setGameState(prev => ({ 
      ...prev,
      phase: 'input', 
      isPlaying: false,
      currentFlash: null,
      playerSequence: []
    }));
  };

  const handleButtonTap = (buttonIndex: number): void => {
    if (gameState.phase !== 'input' || gameState.isPlaying) return;
    
    const currentStep = gameState.playerSequence.length;
    const expectedButton = gameState.sequence[currentStep];
    
    if (buttonIndex === expectedButton) {
      // Correct!
      const newPlayerSequence = [...gameState.playerSequence, buttonIndex];
      
      setGameState(prev => ({
        ...prev,
        playerSequence: newPlayerSequence,
        buttonFeedback: { ...prev.buttonFeedback, [buttonIndex]: 'correct' }
      }));
      
      // Clear feedback after animation
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          buttonFeedback: { ...prev.buttonFeedback, [buttonIndex]: null }
        }));
      }, 300);
      
      // Check if sequence complete
      if (newPlayerSequence.length === gameState.sequence.length) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } else {
      // Wrong!
      setGameState(prev => ({
        ...prev,
        buttonFeedback: { ...prev.buttonFeedback, [buttonIndex]: 'wrong' }
      }));
      
      // Reset player sequence after brief delay
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          playerSequence: [],
          buttonFeedback: {}
        }));
      }, 500);
    }
  };

  const getButtonClassName = (buttonId: number): string => {
    let className = 'memory-button';
    
    if (gameState.currentFlash === buttonId) {
      className += ' active';
    }
    
    const feedback = gameState.buttonFeedback[buttonId];
    if (feedback === 'correct') {
      className += ' correct-tap';
    } else if (feedback === 'wrong') {
      className += ' wrong-tap';
    }
    
    return className;
  };

  // Initialize game on mount
  useEffect(() => {
    const sequence = generateSequence(4);
    setGameState(prev => ({ ...prev, sequence }));
    playSequence(sequence);
  }, []);

  return (
    <div 
      role="main" 
      aria-label="Sequence memory game"
      style={{ 
        padding: '2rem',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <p 
        aria-live="polite" 
        style={{ 
          fontSize: '1.5rem', 
          marginBottom: '2rem', 
          fontWeight: 'bold',
          minHeight: '2rem'
        }}
      >
        {gameState.phase === 'showing' ? 'Watch and repeat' : 'Your turn!'}
      </p>
      
      <div 
        className="button-grid" 
        role="group" 
        aria-label="Memory buttons"
        aria-disabled={gameState.phase === 'showing'}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          maxWidth: '350px',
          margin: '0 auto 2rem auto'
        }}
      >
        {BUTTONS.map((button) => (
          <button
            key={button.id}
            className={getButtonClassName(button.id)}
            style={{ 
              backgroundColor: button.color,
              width: '140px',
              height: '140px',
              border: '3px solid #333',
              borderRadius: '12px',
              cursor: gameState.phase === 'input' ? 'pointer' : 'default',
              transition: 'all 0.15s ease-in-out',
              filter: gameState.currentFlash === button.id ? 'brightness(1.3)' : 'brightness(0.7)',
              transform: gameState.currentFlash === button.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: gameState.currentFlash === button.id 
                ? '0 0 20px rgba(255, 255, 255, 0.5)' 
                : '0 4px 8px rgba(0,0,0,0.2)'
            }}
            onClick={() => handleButtonTap(button.id)}
            disabled={gameState.phase === 'showing'}
            aria-label={`${button.color} button`}
          />
        ))}
      </div>
      
      <div 
        className="progress-indicator" 
        aria-label={`Progress: ${gameState.playerSequence.length} of ${gameState.sequence.length}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '1rem'
        }}
      >
        {gameState.sequence.map((_, index) => (
          <span 
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: index < gameState.playerSequence.length ? '#4CAF50' : '#E0E0E0',
              transition: 'background-color 0.2s ease'
            }}
          />
        ))}
      </div>

      <style>{`
        .memory-button.correct-tap {
          animation: correctPulse 0.3s ease-in-out;
        }

        @keyframes correctPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .memory-button.wrong-tap {
          animation: wrongShake 0.4s ease-in-out;
        }

        @keyframes wrongShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
        }
      `}</style>
    </div>
  );
};

export default SequenceMemory;