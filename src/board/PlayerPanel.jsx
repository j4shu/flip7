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

  const lineupSum = player.lineup.reduce((s, c) => s + c, 0);

  // Find the last number card drawn this turn (for highlight)
  const lastNumberDraw = [...draws]
    .reverse()
    .find((d) => d.type === "number" && !d.busted && !d.saved);
  const lastNewCard = lastNumberDraw ? lastNumberDraw.card : null;

  // Find bust card if any
  const bustDraw = draws.find((d) => d.busted);

  // Find saved cards (second chance consumed)
  const savedDraws = draws.filter((d) => d.saved);

  // Action cards drawn this turn
  const actionDraws = draws.filter((d) => d.type === "action");

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
        {player.lineup.map((card, i) => (
          <Card
            key={i}
            value={card}
            isNew={card === lastNewCard && i === player.lineup.length - 1}
          />
        ))}
        {actionDraws.map((d, i) => (
          <Card key={`action-${i}`} value={d.card} isNew />
        ))}
        {savedDraws.map((d, i) => (
          <Card key={`saved-${i}`} value={d.card} isNew isSaved />
        ))}
        {bustDraw && <Card value={bustDraw.card} isNew isBust />}
      </div>

      {player.hasSecondChance && (
        <div className="player-panel__second-chance">❤️‍🩹</div>
      )}

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
        <span>Round: {lineupSum}</span>
        <span>Total: {totalScore}</span>
      </div>
    </div>
  );
}
