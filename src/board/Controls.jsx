import React from "react";

function getRiskLevel(pct) {
  if (pct === 0) return "none";
  if (pct < 33) return "low";
  if (pct < 66) return "medium";
  return "high";
}

function getDeckCounts(deckInfo) {
  if (typeof deckInfo === "number")
    return { total: deckInfo, numberCards: deckInfo, actionCards: 0 };
  if (Array.isArray(deckInfo))
    return { total: deckInfo.length, numberCards: 0, actionCards: 0 };
  return deckInfo;
}

export function Controls({ isBotTurn, isActive, moves, deckInfo, bustChance }) {
  const pct = Math.round(bustChance * 100);
  const riskLevel = getRiskLevel(pct);
  const { total, numberCards, actionCards } = getDeckCounts(deckInfo);

  return (
    <div className="controls">
      <div className="controls__label">
        {isBotTurn ? "Bot is thinking..." : "Your Turn"}
      </div>

      {!isBotTurn && isActive && (
        <div className={`controls__risk controls__risk--${riskLevel}`}>
          <span className="controls__risk-label">Bust Chance</span>
          <span className="controls__risk-value">{pct}%</span>
          <div className="controls__risk-bar">
            <div className="controls__risk-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="controls__buttons">
        <button
          className="controls__btn controls__btn--hit"
          onClick={() => moves.hit()}
          disabled={!isActive || isBotTurn || total === 0}
        >
          Hit
        </button>
        <button
          className="controls__btn controls__btn--stay"
          onClick={() => moves.stay()}
          disabled={!isActive || isBotTurn}
        >
          Stay
        </button>
      </div>
      <div className="controls__deck-count">
        Cards Remaining: {numberCards} number, {actionCards} action
      </div>
    </div>
  );
}
