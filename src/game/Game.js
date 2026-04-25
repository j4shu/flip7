import { INVALID_MOVE } from 'boardgame.io/core';
import { createDeck } from './deck.js';
import { WINNING_SCORE, FLIP7_COUNT, FLIP7_BONUS } from './constants.js';

function sumLineup(lineup) {
  return lineup.reduce((sum, card) => sum + card, 0);
}

function allPlayersInactive(G) {
  return Object.values(G.players).every(p => p.status !== 'active');
}

function anyFlip7(G) {
  return Object.entries(G.players).find(([, p]) => p.status === 'flip7');
}

function resolveRound(G, events, random) {
  // Calculate round scores
  const roundScores = {};
  for (const [id, player] of Object.entries(G.players)) {
    let roundScore = 0;
    if (player.status === 'flip7') {
      roundScore = sumLineup(player.lineup) + FLIP7_BONUS;
    } else if (player.status === 'stayed' || player.status === 'active') {
      roundScore = sumLineup(player.lineup);
    }
    roundScores[id] = roundScore;
    G.totalScores[id] += roundScore;
  }

  // Store round results for UI display
  G.roundResults = {
    round: G.round,
    scores: roundScores,
    players: Object.fromEntries(
      Object.entries(G.players).map(([id, p]) => [id, { status: p.status, lineup: [...p.lineup] }])
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

  // Reset for next round
  G.round += 1;
  G.deck = random.Shuffle(createDeck());
  G.lastAction = null;
  for (const id of Object.keys(G.players)) {
    G.players[id] = { lineup: [], status: 'active' };
  }
}

export const Flip7 = {
  name: 'flip7',

  setup: ({ ctx, random }) => {
    const players = {};
    const totalScores = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[String(i)] = { lineup: [], status: 'active' };
      totalScores[String(i)] = 0;
    }
    return {
      deck: random.Shuffle(createDeck()),
      players,
      totalScores,
      round: 1,
      lastAction: null,
      roundResults: null,
    };
  },

  moves: {
    hit: ({ G, ctx, events, random }) => {
      const player = G.players[ctx.currentPlayer];

      // Validate
      if (player.status !== 'active') return INVALID_MOVE;
      if (G.deck.length === 0) return INVALID_MOVE;

      const card = G.deck.pop();
      const hasDuplicate = player.lineup.includes(card);

      if (hasDuplicate) {
        player.status = 'busted';
        G.lastAction = { playerID: ctx.currentPlayer, card, busted: true };
      } else {
        player.lineup.push(card);
        G.lastAction = { playerID: ctx.currentPlayer, card, busted: false };

        if (player.lineup.length >= FLIP7_COUNT) {
          player.status = 'flip7';
        }
      }

      // Check if round should end
      if (anyFlip7(G) || allPlayersInactive(G)) {
        resolveRound(G, events, random);
      }
    },

    stay: ({ G, ctx, events, random }) => {
      const player = G.players[ctx.currentPlayer];

      if (player.status !== 'active') return INVALID_MOVE;

      player.status = 'stayed';
      G.lastAction = { playerID: ctx.currentPlayer, card: null, busted: false, stayed: true };

      if (allPlayersInactive(G)) {
        resolveRound(G, events, random);
      }
    },
  },

  turn: {
    maxMoves: 1,
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
        // All players inactive — round was already resolved in the move.
        // Return next position so the turn can end cleanly.
        return (ctx.playOrderPos + 1) % numPlayers;
      },
    },
  },

  playerView: ({ G, playerID }) => {
    // Hide the deck contents — only show the count
    return {
      ...G,
      deck: G.deck.length,
    };
  },
};
