import React from 'react';
import { ProgressTrackerProps } from '../types/game.types';

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentLevel, levelResults }) => {
  const getLevelStatus = (levelIndex: number): string => {
    if (levelIndex + 1 < currentLevel) {
      const result = levelResults[levelIndex];
      return result.completed ? 'completed' : result.skipped ? 'skipped' : 'pending';
    } else if (levelIndex + 1 === currentLevel) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'skipped': return '#FF9800';
      case 'current': return '#2196F3';
      case 'pending': return '#E0E0E0';
      default: return '#E0E0E0';
    }
  };

  const getStatusSymbol = (status: string): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'skipped': return '⏭';
      case 'current': return '●';
      case 'pending': return '○';
      default: return '○';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '1rem', marginRight: '0.5rem' }}>
        {currentLevel}/5
      </span>
      {Array.from({ length: 5 }, (_, index) => {
        const status = getLevelStatus(index);
        return (
          <div
            key={index}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(status),
              color: status === 'pending' ? '#666' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: status === 'current' ? '3px solid #1976D2' : 'none',
            }}
          >
            {getStatusSymbol(status)}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressTracker;