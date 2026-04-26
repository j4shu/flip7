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
  // Card to highlight with the "new" animation
  const lastNewCard =
    lastAction && lastAction.playerID === playerID ? lastAction.card : null;

  let panelClass = "player-panel";
  if (isCurrent) panelClass += " player-panel--current";
  if (player.status === "busted") panelClass += " player-panel--busted";
  if (player.status === "flip7") panelClass += " player-panel--flip7";

  const isBusted = player.status === "busted";
  const displayHand = isBusted ? player.hand.slice(0, -1) : player.hand;
  const bustCard = isBusted ? player.hand[player.hand.length - 1] : null;
  const handSum = displayHand.reduce((s, c) => s + c, 0);

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
        {displayHand.map((card, i) => (
          <Card
            key={i}
            value={card}
            isNew={card === lastNewCard && i === displayHand.length - 1}
          />
        ))}
        {bustCard != null && <Card value={bustCard} isBust />}
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
