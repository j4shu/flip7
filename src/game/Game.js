import { INVALID_MOVE } from 'boardgame.io/core';
import { createDeck, isActionCard } from './deck.js';
import {
  WINNING_SCORE, FLIP7_COUNT, FLIP7_BONUS,
  FREEZE, FLIP3, SECOND_CHANCE,
} from './constants.js';

function sumLineup(lineup) {
  return lineup.reduce((sum, card) => sum + card, 0);
}

function allPlayersInactive(G) {
  return Object.values(G.players).every(p => p.status !== 'active');
}

function anyFlip7(G) {
  return Object.entries(G.players).find(([, p]) => p.status === 'flip7');
}

/**
 * Draw a single card and apply its effect. Returns the draw result object.
 * Handles number cards, freeze, second chance, and flip3 (recursive).
 * Stops early if the player is no longer active (busted/stayed/flip7).
 */
function drawCard(G, player, playerID, draws) {
  if (G.deck.length === 0 || player.status !== 'active') return;

  const card = G.deck.pop();

  if (isActionCard(card)) {
    draws.push({ card, type: 'action' });

    if (card === FREEZE) {
      player.status = 'stayed';
    } else if (card === SECOND_CHANCE) {
      player.hasSecondChance = true;
    } else if (card === FLIP3) {
      for (let i = 0; i < 3; i++) {
        if (G.deck.length === 0 || player.status !== 'active') break;
        drawCard(G, player, playerID, draws);
      }
    }
  } else {
    // Number card
    const hasDuplicate = player.lineup.includes(card);

    if (hasDuplicate) {
      if (player.hasSecondChance) {
        player.hasSecondChance = false;
        draws.push({ card, type: 'number', saved: true });
      } else {
        player.status = 'busted';
        draws.push({ card, type: 'number', busted: true });
      }
    } else {
      player.lineup.push(card);
      draws.push({ card, type: 'number' });

      if (player.lineup.length >= FLIP7_COUNT) {
        player.status = 'flip7';
      }
    }
  }
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
    G.players[id] = { lineup: [], status: 'active', hasSecondChance: false };
  }
}

export const Flip7 = {
  name: 'flip7',

  setup: ({ ctx, random }) => {
    const players = {};
    const totalScores = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[String(i)] = { lineup: [], status: 'active', hasSecondChance: false };
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

      if (player.status !== 'active') return INVALID_MOVE;
      if (G.deck.length === 0) return INVALID_MOVE;

      const draws = [];
      drawCard(G, player, ctx.currentPlayer, draws);

      G.lastAction = {
        playerID: ctx.currentPlayer,
        draws,
        busted: player.status === 'busted',
      };

      // Check if round should end
      if (anyFlip7(G) || allPlayersInactive(G)) {
        resolveRound(G, events, random);
      }
    },

    stay: ({ G, ctx, events, random }) => {
      const player = G.players[ctx.currentPlayer];

      if (player.status !== 'active') return INVALID_MOVE;

      player.status = 'stayed';
      G.lastAction = { playerID: ctx.currentPlayer, draws: [], busted: false, stayed: true };

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
        return (ctx.playOrderPos + 1) % numPlayers;
      },
    },
  },

  playerView: ({ G }) => {
    let numberCards = 0;
    let actionCards = 0;
    for (const card of G.deck) {
      if (typeof card === 'number') numberCards++;
      else actionCards++;
    }
    return {
      ...G,
      deck: { total: G.deck.length, numberCards, actionCards },
    };
  },
};
