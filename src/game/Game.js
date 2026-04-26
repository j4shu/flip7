import { INVALID_MOVE } from 'boardgame.io/core';
import { createDeck } from './deck.js';
import { WINNING_SCORE, FLIP7_COUNT, FLIP7_BONUS } from './constants.js';

function sumHand(hand) {
  return hand.reduce((sum, card) => sum + card, 0);
}

function allPlayersInactive(G) {
  return Object.values(G.players).every(p => p.status !== 'active');
}

function anyFlip7(G) {
  return Object.entries(G.players).find(([, p]) => p.status === 'flip7');
}

/**
 * If the draw deck is empty, shuffle the discard pile into it.
 */
function reshuffleIfNeeded(G, random) {
  if (G.deck.length === 0 && G.discard.length > 0) {
    G.deck = random.Shuffle([...G.discard]);
    G.discard = [];
  }
}

function resolveRound(G, events, random) {
  // Calculate round scores
  const roundScores = {};
  for (const [id, player] of Object.entries(G.players)) {
    let roundScore = 0;
    if (player.status === 'flip7') {
      roundScore = sumHand(player.hand) + FLIP7_BONUS;
    } else if (player.status === 'stayed' || player.status === 'active') {
      roundScore = sumHand(player.hand);
    }
    roundScores[id] = roundScore;
    G.totalScores[id] += roundScore;
  }

  // Store round results for UI display
  G.roundResults = {
    round: G.round,
    scores: roundScores,
    players: Object.fromEntries(
      Object.entries(G.players).map(([id, p]) => [id, { status: p.status, hand: [...p.hand] }])
    ),
  };

  // Check for game end
  let maxScore = -1;
  let winner = null;
  for (const [id, score] of Object.entries(G.totalScores)) {
    if (score >= WINNING_SCORE && score > maxScore) {
      maxScore = score;
      winner = id;
    }
  }

  if (winner !== null) {
    events.endGame({ winner, scores: { ...G.totalScores } });
    return;
  }

  // Discard all hand cards, then reset players for next round
  for (const player of Object.values(G.players)) {
    G.discard.push(...player.hand);
  }
  G.round += 1;
  G.roundStartPlayer = G.roundStartPlayer === '0' ? '1' : '0';
  G.lastAction = null;
  for (const id of Object.keys(G.players)) {
    G.players[id] = { hand: [], status: 'active' };
  }

  reshuffleIfNeeded(G, random);
}

export const Flip7 = {
  name: 'flip7',

  setup: ({ ctx, random }) => {
    const players = {};
    const totalScores = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[String(i)] = { hand: [], status: 'active' };
      totalScores[String(i)] = 0;
    }
    return {
      deck: random.Shuffle(createDeck()),
      discard: [],
      players,
      totalScores,
      round: 1,
      roundStartPlayer: '0',
      lastAction: null,
      roundResults: null,
    };
  },

  moves: {
    hit: ({ G, ctx, events, random }) => {
      const player = G.players[ctx.currentPlayer];

      if (player.status !== 'active') return INVALID_MOVE;
      if (G.deck.length === 0 && G.discard.length === 0) return INVALID_MOVE;

      reshuffleIfNeeded(G, random);
      const card = G.deck.pop();
      const hasDuplicate = player.hand.includes(card);

      if (hasDuplicate) {
        G.discard.push(card);
        player.status = 'busted';
        G.lastAction = {
          playerID: ctx.currentPlayer,
          draws: [{ card, type: 'number', busted: true }],
          busted: true,
        };
      } else {
        player.hand.push(card);
        G.lastAction = {
          playerID: ctx.currentPlayer,
          draws: [{ card, type: 'number' }],
          busted: false,
        };

        if (player.hand.length >= FLIP7_COUNT) {
          player.status = 'flip7';
        }
      }

      // Check if round should end
      if (anyFlip7(G) || allPlayersInactive(G)) {
        resolveRound(G, events, random);
        events.endTurn({ next: G.roundStartPlayer });
      } else {
        events.endTurn();
      }
    },

    stay: ({ G, ctx, events, random }) => {
      const player = G.players[ctx.currentPlayer];

      if (player.status !== 'active') return INVALID_MOVE;

      player.status = 'stayed';
      G.lastAction = { playerID: ctx.currentPlayer, draws: [], busted: false, stayed: true };

      if (allPlayersInactive(G)) {
        resolveRound(G, events, random);
        events.endTurn({ next: G.roundStartPlayer });
      } else {
        events.endTurn();
      }
    },
  },

  turn: {
    order: {
      first: () => 0,
      next: ({ G, ctx }) => {
        const numPlayers = ctx.numPlayers;
        let pos = ctx.playOrderPos;
        for (let i = 0; i < numPlayers; i++) {
          pos = (pos + 1) % numPlayers;
          const id = ctx.playOrder[pos];
          if (G.players[id].status === 'active') {
            return pos;
          }
        }
        return (ctx.playOrderPos + 1) % numPlayers;
      },
    },
  },

  playerView: ({ G }) => {
    return {
      ...G,
      deck: G.deck.length,
      discard: G.discard.length,
    };
  },
};
