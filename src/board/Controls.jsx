function getDeckCounts(deckInfo) {
  if (typeof deckInfo === "number")
    return { total: deckInfo, numberCards: deckInfo, actionCards: 0 };
  if (Array.isArray(deckInfo))
    return { total: deckInfo.length, numberCards: 0, actionCards: 0 };
  return deckInfo;
}

export function Controls({
  isBotTurn,
  isActive,
  moves,
  deckInfo,
  discardCount,
}) {
  const { total } = getDeckCounts(deckInfo);
  const canDraw = total > 0 || discardCount > 0;

  return (
    <div className="controls">
      <div className="controls__label">
        {isBotTurn ? "Bot is thinking..." : "Your Turn"}
      </div>

      <div className="controls__buttons">
        <button
          className="controls__btn controls__btn--hit"
          onClick={() => moves.hit()}
          disabled={!isActive || isBotTurn || !canDraw}
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
      <div className="controls__deck-count">Cards remaining: {total}</div>
    </div>
  );
}
