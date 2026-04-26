import { PLAYER_NAMES } from '../game/constants.js';
import { resetBotPersonality } from '../game/bot.js';

export function GameOver({ gameover, reset }) {
  if (!gameover) return null;

  const handlePlayAgain = () => {
    resetBotPersonality();
    reset();
  };

  return (
    <div className="gameover-overlay">
      <div className="gameover">
        <h2 className="gameover__title">Game Over</h2>
        <p className="gameover__winner">
          {PLAYER_NAMES[gameover.winner]} win{gameover.winner === '0' ? '' : 's'}!
        </p>
        <div className="gameover__scores">
          <h3>Final Scores</h3>
          {Object.entries(gameover.scores).map(([id, score]) => (
            <div key={id} className="gameover__score-row">
              <span>{PLAYER_NAMES[id]}</span>
              <span>{score}</span>
            </div>
          ))}
        </div>
        {reset && (
          <button className="gameover__btn" onClick={handlePlayAgain}>
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
