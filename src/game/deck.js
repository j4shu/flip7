import { CARDS_PER_VALUE, MIN_CARD, MAX_CARD } from './constants.js';

export function createDeck() {
  const deck = [];
  for (let value = MIN_CARD; value <= MAX_CARD; value++) {
    for (let i = 0; i < CARDS_PER_VALUE; i++) {
      deck.push(value);
    }
  }
  return deck; // 36 cards
}

/**
 * Extract the deck/discard size from G, regardless of whether
 * playerView has transformed them (array → number).
 */
export function getDeckSize(deck) {
  if (typeof deck === 'number') return deck;
  if (Array.isArray(deck)) return deck.length;
  return 0;
}

export function getDiscardSize(discard) {
  if (typeof discard === 'number') return discard;
  if (Array.isArray(discard)) return discard.length;
  return 0;
}
