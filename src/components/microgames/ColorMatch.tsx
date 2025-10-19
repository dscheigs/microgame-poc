import React, { useState, useEffect } from "react";
import { MicrogameProps } from "../../types/game.types";

interface ColorOption {
  color: string;
  isCorrect: boolean;
}

interface ColorMatchState {
  targetColor: string;
  options: ColorOption[];
  selectedIndex: number | null;
}

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

const ColorMatch: React.FC<MicrogameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<ColorMatchState>({
    targetColor: '',
    options: [],
    selectedIndex: null,
  });
  const [feedback, setFeedback] = useState<'none' | 'wrong' | 'correct'>('none');

  const generateGame = (): ColorMatchState => {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    const targetColor = shuffled[0];
    const incorrectColors = shuffled.slice(1, 4);
    
    const options = [
      { color: targetColor, isCorrect: true },
      { color: incorrectColors[0], isCorrect: false },
      { color: incorrectColors[1], isCorrect: false },
      { color: incorrectColors[2], isCorrect: false },
    ].sort(() => Math.random() - 0.5);
    
    return {
      targetColor,
      options,
      selectedIndex: null,
    };
  };

  useEffect(() => {
    setGameState(generateGame());
  }, []);

  const handleOptionTap = (index: number): void => {
    if (feedback !== 'none') return; // Prevent multiple taps during feedback
    
    const option = gameState.options[index];
    setGameState(prev => ({ ...prev, selectedIndex: index }));
    
    if (option.isCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        onComplete();
      }, 300);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('none');
        setGameState(prev => ({ ...prev, selectedIndex: null }));
      }, 500);
    }
  };

  const getOptionClassName = (index: number): string => {
    if (gameState.selectedIndex === index) {
      return feedback === 'wrong' ? 'color-option wrong' : 'color-option correct';
    }
    return 'color-option';
  };

  return (
    <div 
      role="main" 
      aria-label="Color matching game"
      style={{ 
        padding: '2rem',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div className="target-section" style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Match this color:
        </p>
        <div 
          className="target-color"
          style={{ 
            backgroundColor: gameState.targetColor,
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            margin: '0 auto',
            border: '4px solid #333',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          aria-label={`Target color: ${gameState.targetColor}`}
        />
      </div>
      
      <div 
        className="options-grid" 
        role="group" 
        aria-label="Color options"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          maxWidth: '400px',
          margin: '0 auto'
        }}
      >
        {gameState.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClassName(index)}
            style={{ 
              backgroundColor: option.color,
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: '3px solid #333',
              cursor: feedback === 'none' ? 'pointer' : 'default',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.1s ease',
              transform: gameState.selectedIndex === index && feedback === 'correct' ? 'scale(1.1)' : 'scale(1)'
            }}
            onClick={() => handleOptionTap(index)}
            aria-label={`Option ${index + 1}: ${option.color}`}
            disabled={feedback !== 'none'}
          />
        ))}
      </div>

      <style>{`
        .color-option.wrong {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .color-option.correct {
          animation: success 0.3s ease-in-out;
        }

        @keyframes success {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ColorMatch;
