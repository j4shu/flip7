import { CARDS_PER_VALUE } from './constants.js';
import { getDeckSize, getDiscardSize } from './deck.js';

/**
 * Calculate the probability of busting on the next draw for a given player.
 * Accounts for action cards in the deck (they are safe draws).
 * If the player has a second chance, the effective bust probability is
 * the chance of busting TWICE in a row (very low), so we return 0.
 *
 * Returns 0 for an empty lineup, 1 if the deck is empty.
 */
export function calculateBustProbability(G, playerID) {
  const player = G.players[playerID];
  const lineup = player.lineup;
  const deckSize = getDeckSize(G.deck);
  const discardSize = getDiscardSize(G.discard);

  if (lineup.length === 0) return 0;
  if (deckSize === 0 && discardSize === 0) return 1;
  if (player.hasSecondChance) return 0;

  let dangerousCards = 0;
  for (const value of lineup) {
    let remaining = CARDS_PER_VALUE - 1; // we already have one copy
    for (const [id, other] of Object.entries(G.players)) {
      if (id === playerID) continue;
      for (const card of other.lineup) {
        if (card === value) remaining--;
      }
    }
    dangerousCards += Math.max(0, remaining);
  }

  // Remaining copies are spread across both the deck and discard pile.
  // Divide by the total unseen pool for an accurate estimate.
  const unseenPool = deckSize + discardSize;
  if (unseenPool === 0) return 1;
  return dangerousCards / unseenPool;
}

/**
 * Randomize the bot's personality at the start of each game.
 * baseThreshold: 0.40–0.60 (how much risk the bot tolerates overall)
 * perCardPenalty: 0.03–0.07 (how quickly it becomes conservative)
 */
let botPersonality = rollPersonality();

function rollPersonality() {
  const base = 0.40 + Math.random() * 0.20;       // 0.40 – 0.60
  const penalty = 0.03 + Math.random() * 0.04;     // 0.03 – 0.07
  return { baseThreshold: base, perCardPenalty: penalty };
}

export function resetBotPersonality() {
  botPersonality = rollPersonality();
}

/**
 * Decides whether the bot should 'hit' or 'stay'.
 *
 * Strategy: calculate the probability of busting (drawing a duplicate)
 * based on visible information, then compare against a risk threshold
 * that tightens as the lineup grows. The threshold parameters are
 * randomized per game so the bot plays differently each time.
 */
export function decideBotMove(G, botID) {
  const bot = G.players[botID];
  const lineup = bot.lineup;
  const deckSize = getDeckSize(G.deck);

  if (lineup.length === 0) return 'hit';
  if (deckSize === 0) return 'stay';

  const bustProb = calculateBustProbability(G, botID);
  const { baseThreshold, perCardPenalty } = botPersonality;
  const threshold = baseThreshold - lineup.length * perCardPenalty;

  if (bustProb >= threshold) return 'stay';

  return 'hit';
}
