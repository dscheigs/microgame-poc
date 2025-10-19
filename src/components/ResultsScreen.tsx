import React from "react";
import { ResultsScreenProps } from "../types/game.types";

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  totalTime,
  levelResults,
  onRestart,
}) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const completedLevels = levelResults.filter(
    (result) => result.completed
  ).length;
  const skippedLevels = levelResults.filter((result) => result.skipped).length;
  const totalPenalties = skippedLevels * 30000; // 30 seconds each

  return (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1>Game Complete!</h1>

      <div
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          color: "#2196F3",
          marginBottom: "2rem",
          fontFamily: "monospace",
        }}
      >
        {formatTime(totalTime)}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
          fontSize: "1.2rem",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", color: "#4CAF50" }}>
            {completedLevels}
          </div>
          <div>Completed</div>
        </div>
        <div>
          <div style={{ fontWeight: "bold", color: "#FF9800" }}>
            {skippedLevels}
          </div>
          <div>Skipped</div>
        </div>
        <div>
          <div style={{ fontWeight: "bold", color: "#F44336" }}>
            +{formatTime(totalPenalties)}
          </div>
          <div>Penalties</div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3>Level Breakdown:</h3>
        <div
          style={{
            display: "grid",
            gap: "0.5rem",
            textAlign: "left",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          {levelResults.map((result, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                borderLeft: `4px solid ${
                  result.completed
                    ? "#4CAF50"
                    : result.skipped
                    ? "#FF9800"
                    : "#E0E0E0"
                }`,
                color: "#333",
              }}
            >
              <span>Level {index + 1}</span>
              <span>
                {result.completed
                  ? "✓ Completed"
                  : result.skipped
                  ? "⏭ Skipped"
                  : "○ Not attempted"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onRestart}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          fontWeight: "bold",
          cursor: "pointer",
          minWidth: "44px",
          minHeight: "44px",
        }}
      >
        Play Again
      </button>
    </div>
  );
};

export default ResultsScreen;
