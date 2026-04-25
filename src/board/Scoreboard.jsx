import React from 'react';
import { PLAYER_NAMES } from '../game/constants.js';

export function Scoreboard({ totalScores, round }) {
  return (
    <div className="scoreboard">
      <div className="scoreboard__round">Round {round}</div>
      <div className="scoreboard__scores">
        {Object.entries(totalScores).map(([id, score]) => (
          <div key={id} className="scoreboard__player">
            <span className="scoreboard__name">{PLAYER_NAMES[id]}</span>
            <span className="scoreboard__score">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
