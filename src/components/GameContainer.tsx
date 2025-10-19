import React, { useState, useEffect } from "react";
import { GameContainerState } from "../types/game.types";
import Timer from "./Timer";
import ProgressTracker from "./ProgressTracker";
import SkipButton from "./SkipButton";
import ResultsScreen from "./ResultsScreen";
import ColorMatch from "./microgames/ColorMatch";
import SequenceMemory from "./microgames/SequenceMemory";

const GameContainer: React.FC = () => {
  const [state, setState] = useState<GameContainerState>({
    gameState: "idle",
    currentLevel: 1,
    startTime: null,
    totalTime: 0,
    levelResults: Array(5).fill({
      completed: false,
      skipped: false,
      timeSpent: 0,
    }),
    showSkipButton: false,
  });

  const [skipButtonTimer, setSkipButtonTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const startGame = (): void => {
    const now = Date.now();
    setState({
      gameState: "playing",
      currentLevel: 1,
      startTime: now,
      totalTime: 0,
      levelResults: Array(5).fill({
        completed: false,
        skipped: false,
        timeSpent: 0,
      }),
      showSkipButton: false,
    });

    // Start skip button timer
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, showSkipButton: true }));
    }, 5000);
    setSkipButtonTimer(timer);
  };

  const handleLevelComplete = (): void => {
    const now = Date.now();
    const timeSpent = state.startTime ? now - state.startTime : 0;

    const newLevelResults = [...state.levelResults];
    newLevelResults[state.currentLevel - 1] = {
      completed: true,
      skipped: false,
      timeSpent,
    };

    if (state.currentLevel >= 5) {
      endGame();
    } else {
      setState((prev) => ({
        ...prev,
        currentLevel: prev.currentLevel + 1,
        levelResults: newLevelResults,
        showSkipButton: false,
      }));

      // Reset skip button timer for next level
      if (skipButtonTimer) clearTimeout(skipButtonTimer);
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, showSkipButton: true }));
      }, 5000);
      setSkipButtonTimer(timer);
    }
  };

  const handleSkip = (): void => {
    const now = Date.now();
    const timeSpent = state.startTime ? now - state.startTime : 0;

    const newLevelResults = [...state.levelResults];
    newLevelResults[state.currentLevel - 1] = {
      completed: false,
      skipped: true,
      timeSpent,
    };

    setState((prev) => ({
      ...prev,
      totalTime: prev.totalTime + 30000, // Add 30 second penalty
      levelResults: newLevelResults,
    }));

    handleLevelComplete();
  };

  const endGame = (): void => {
    if (skipButtonTimer) clearTimeout(skipButtonTimer);

    const now = Date.now();
    const finalTime = state.startTime
      ? now - state.startTime + state.totalTime
      : state.totalTime;

    setState((prev) => ({
      ...prev,
      gameState: "completed",
      totalTime: finalTime,
      showSkipButton: false,
    }));
  };

  const resetGame = (): void => {
    if (skipButtonTimer) clearTimeout(skipButtonTimer);

    setState({
      gameState: "idle",
      currentLevel: 1,
      startTime: null,
      totalTime: 0,
      levelResults: Array(5).fill({
        completed: false,
        skipped: false,
        timeSpent: 0,
      }),
      showSkipButton: false,
    });
  };

  useEffect(() => {
    return () => {
      if (skipButtonTimer) clearTimeout(skipButtonTimer);
    };
  }, [skipButtonTimer]);

  const renderCurrentMicrogame = () => {
    const games = [ColorMatch, SequenceMemory, ColorMatch, SequenceMemory, ColorMatch];
    const CurrentGame = games[state.currentLevel - 1];
    
    return (
      <CurrentGame
        key={state.currentLevel}
        onComplete={handleLevelComplete}
        level={state.currentLevel}
      />
    );
  };

  if (state.gameState === "idle") {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>Microgames Challenge</h1>
        <p>Complete 5 quick puzzles as fast as possible!</p>
        <button
          onClick={startGame}
          style={{
            fontSize: "1.2rem",
            padding: "1rem 2rem",
            minWidth: "44px",
            minHeight: "44px",
          }}
        >
          Start Game
        </button>
      </div>
    );
  }

  if (state.gameState === "completed") {
    return (
      <ResultsScreen
        totalTime={state.totalTime}
        levelResults={state.levelResults}
        onRestart={resetGame}
      />
    );
  }

  return (
    <div style={{ 
      padding: "1rem", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column" 
    }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <Timer
          startTime={state.startTime || 0}
          additionalTime={state.totalTime}
        />
        <ProgressTracker
          currentLevel={state.currentLevel}
          levelResults={state.levelResults}
        />
      </div>

      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {renderCurrentMicrogame()}
      </div>

      <SkipButton onSkip={handleSkip} visible={state.showSkipButton} />
    </div>
  );
};

export default GameContainer;
