import React from 'react';
import { Card } from './Card.jsx';
import { PLAYER_NAMES } from '../game/constants.js';

const STATUS_LABELS = {
  active: 'Active',
  stayed: 'Stayed',
  busted: 'Busted',
  flip7: 'FLIP 7!',
};

export function PlayerPanel({ playerID, player, isCurrent, lastAction, totalScore }) {
  const isLastActionMine = lastAction && lastAction.playerID === playerID;
  const lastCard = isLastActionMine ? lastAction.card : null;
  const wasBust = isLastActionMine && lastAction.busted;

  let panelClass = 'player-panel';
  if (isCurrent) panelClass += ' player-panel--current';
  if (player.status === 'busted') panelClass += ' player-panel--busted';
  if (player.status === 'flip7') panelClass += ' player-panel--flip7';

  const lineupSum = player.lineup.reduce((s, c) => s + c, 0);

  return (
    <div className={panelClass}>
      <div className="player-panel__header">
        <span className="player-panel__name">{PLAYER_NAMES[playerID]}</span>
        <span className={`player-panel__status player-panel__status--${player.status}`}>
          {STATUS_LABELS[player.status]}
        </span>
      </div>
      <div className="player-panel__cards">
        {player.lineup.map((card, i) => (
          <Card
            key={i}
            value={card}
            isNew={card === lastCard && i === player.lineup.length - 1}
            isBust={false}
          />
        ))}
        {wasBust && lastCard !== null && (
          <Card value={lastCard} isNew={true} isBust={true} />
        )}
      </div>
      <div className="player-panel__scores">
        <span>Round: {lineupSum}</span>
        <span>Total: {totalScore}</span>
      </div>
    </div>
  );
}
