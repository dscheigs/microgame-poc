import React from "react";
import { MicrogameProps } from "../../types/game.types";

const ColorMatch: React.FC<MicrogameProps> = ({ onComplete, level }) => {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h3>Color Match</h3>
      <p>Match the colors! (Placeholder microgame)</p>
      {level}
      <button
        onClick={onComplete}
        style={{
          padding: "1rem 2rem",
          fontSize: "1rem",
          minWidth: "44px",
          minHeight: "44px",
        }}
      >
        Complete
      </button>
    </div>
  );
};

export default ColorMatch;
