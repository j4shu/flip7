import { getDeckSize } from "../game/deck.js";

export function Controls({
  isBotTurn,
  isActive,
  moves,
  deckInfo,
  discardCount,
}) {
  const deckSize = getDeckSize(deckInfo);
  const canDraw = deckSize > 0 || discardCount > 0;

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
      <div className="controls__deck-count">Cards remaining: {deckSize}</div>
    </div>
  );
}
