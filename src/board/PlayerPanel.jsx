import { Card } from "./Card.jsx";
import { PLAYER_NAMES, STATUS_LABELS } from "../game/constants.js";

function getRiskLevel(pct) {
  if (pct === 0) return "none";
  if (pct <= 15) return "low";
  if (pct <= 35) return "medium";
  return "high";
}

export function PlayerPanel({
  playerID,
  player,
  isCurrent,
  lastAction,
  totalScore,
  bustChance,
}) {
  const isLastActionMine = lastAction && lastAction.playerID === playerID;
  const draws = isLastActionMine ? lastAction.draws : [];

  let panelClass = "player-panel";
  if (isCurrent) panelClass += " player-panel--current";
  if (player.status === "busted") panelClass += " player-panel--busted";
  if (player.status === "flip7") panelClass += " player-panel--flip7";

  const handSum = player.hand.reduce((s, c) => s + c, 0);

  // Highlight the most recently drawn card
  const lastDraw = draws[draws.length - 1];
  const lastNewCard = lastDraw ? lastDraw.card : null;

  return (
    <div className={panelClass}>
      <div className="player-panel__header">
        <span className="player-panel__name">{PLAYER_NAMES[playerID]}</span>
        <span
          className={`player-panel__status player-panel__status--${player.status}`}
        >
          {STATUS_LABELS[player.status]}
        </span>
      </div>

      <div className="player-panel__cards">
        {player.hand.map((card, i) => (
          <Card
            key={i}
            value={card}
            isNew={card === lastNewCard && i === player.hand.length - 1}
          />
        ))}
        {player.bustCard != null && <Card value={player.bustCard} isBust />}
      </div>

      {player.status === "active" &&
        (() => {
          const pct = (bustChance * 100).toFixed(2);
          const riskLevel = getRiskLevel(pct);
          return (
            <div
              className={`player-panel__risk player-panel__risk--${riskLevel}`}
            >
              <span className="player-panel__risk-label">Bust</span>
              <span className="player-panel__risk-value">{pct}%</span>
              <div className="player-panel__risk-bar">
                <div
                  className="player-panel__risk-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}

      <div className="player-panel__scores">
        <span>Round: {handSum}</span>
        <span>Total: {totalScore}</span>
      </div>
    </div>
  );
}
