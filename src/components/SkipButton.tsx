import React from 'react';
import { SkipButtonProps } from '../types/game.types';

const SkipButton: React.FC<SkipButtonProps> = ({ onSkip, visible }) => {
  if (!visible) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '2rem', 
      right: '2rem',
      zIndex: 1000
    }}>
      <button
        onClick={onSkip}
        style={{
          backgroundColor: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '1rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#FF5252';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#FF6B6B';
        }}
      >
        Skip (+30s)
      </button>
    </div>
  );
};

export default SkipButton;