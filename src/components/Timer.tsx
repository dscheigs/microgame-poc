import React, { useState, useEffect } from 'react';
import { TimerProps } from '../types/game.types';

const Timer: React.FC<TimerProps> = ({ startTime, additionalTime }) => {
  const [displayTime, setDisplayTime] = useState<number>(0);

  useEffect(() => {
    if (startTime === 0) {
      setDisplayTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setDisplayTime(elapsed + additionalTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, additionalTime]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      fontSize: '1.5rem', 
      fontWeight: 'bold',
      fontFamily: 'monospace',
      padding: '0.5rem',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      color: '#333'
    }}>
      {formatTime(displayTime)}
    </div>
  );
};

export default Timer;