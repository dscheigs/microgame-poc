export type GameState = 'idle' | 'playing' | 'completed';

export interface LevelResult {
  completed: boolean;
  skipped: boolean;
  timeSpent: number;
}

export interface MicrogameProps {
  onComplete: () => void;
  level: number;
}

export interface ProgressTrackerProps {
  currentLevel: number;
  levelResults: LevelResult[];
}

export interface ResultsScreenProps {
  totalTime: number;
  levelResults: LevelResult[];
  onRestart: () => void;
}

export interface TimerProps {
  startTime: number;
  additionalTime: number; // penalties
}

export interface SkipButtonProps {
  onSkip: () => void;
  visible: boolean;
}

export interface GameContainerState {
  gameState: GameState;
  currentLevel: number; // 1-5
  startTime: number | null; // timestamp
  totalTime: number; // milliseconds
  levelResults: LevelResult[]; // array of 5 results
  showSkipButton: boolean;
}