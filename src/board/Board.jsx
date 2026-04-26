import { useState, useEffect, useRef } from "react";
import { PlayerPanel } from "./PlayerPanel.jsx";
import { Controls } from "./Controls.jsx";
import { Scoreboard } from "./Scoreboard.jsx";
import { GameOver } from "./GameOver.jsx";
import { decideBotMove, calculateBustProbability } from "../game/bot.js";
import { BOT_ID, PLAYER_NAMES, STATUS_LABELS } from "../game/constants.js";
import "./Board.css";

function RoundSummary({ roundResults, onDismiss }) {
  return (
    <div className="round-summary-overlay" onClick={onDismiss}>
      <div className="round-summary" onClick={(e) => e.stopPropagation()}>
        <h2>Round {roundResults.round} Complete</h2>
        <div className="round-summary__players">
          {Object.entries(roundResults.players).map(([id, info]) => {
            const score = roundResults.scores[id];
            return (
              <div key={id} className="round-summary__row">
                <span className="round-summary__name">{PLAYER_NAMES[id]}</span>
                <span
                  className={`round-summary__status round-summary__status--${info.status}`}
                >
                  {STATUS_LABELS[info.status]}
                </span>
                <span className="round-summary__score">+{score}</span>
              </div>
            );
          })}
        </div>
        <button className="round-summary__btn" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}

export function Board({ G, ctx, moves, reset }) {
  const isGameOver = ctx.gameover != null;
  const isBotTurn = ctx.currentPlayer === BOT_ID && !isGameOver;
  const currentPlayerObj = G.players[ctx.currentPlayer];
  const isCurrentActive =
    currentPlayerObj && currentPlayerObj.status === "active";

  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [lastRoundResults, setLastRoundResults] = useState(null);
  const botTimerRef = useRef(null);

  // Show round summary when a round ends (but not on the final round)
  useEffect(() => {
    if (isGameOver) return;
    if (
      G.roundResults &&
      (!lastRoundResults || G.roundResults.round !== lastRoundResults.round)
    ) {
      setLastRoundResults(G.roundResults);
      setShowRoundSummary(true);
    }
  }, [G.roundResults, isGameOver]);

  // Auto-play bot turns
  useEffect(() => {
    if (!isBotTurn || !isCurrentActive || showRoundSummary) return;

    botTimerRef.current = setTimeout(() => {
      const decision = decideBotMove(G, BOT_ID);
      if (decision === "hit") {
        moves.hit();
      } else {
        moves.stay();
      }
    }, 400);

    return () => clearTimeout(botTimerRef.current);
  }, [isBotTurn, isCurrentActive, showRoundSummary, G]);

  return (
    <div className="board">
      <h1 className="board__title">Flip 7</h1>

      <Scoreboard totalScores={G.totalScores} round={G.round} />

      <div className="board__players">
        {Object.keys(G.players).map((id) => (
          <PlayerPanel
            key={id}
            playerID={id}
            player={G.players[id]}
            isCurrent={ctx.currentPlayer === id && !isGameOver}
            lastAction={G.lastAction}
            totalScore={G.totalScores[id]}
            bustChance={calculateBustProbability(G, id)}
          />
        ))}
      </div>

      {!isGameOver && (
        <Controls
          isBotTurn={isBotTurn}
          isActive={isCurrentActive}
          moves={moves}
          deckInfo={G.deck}
          discardCount={typeof G.discard === 'number' ? G.discard : G.discard.length}
        />
      )}

      {showRoundSummary && lastRoundResults && !isGameOver && (
        <RoundSummary
          roundResults={lastRoundResults}
          onDismiss={() => setShowRoundSummary(false)}
        />
      )}

      <GameOver gameover={ctx.gameover} reset={reset} />
    </div>
  );
}
