import { CARDS_PER_VALUE, MIN_CARD, MAX_CARD } from './constants.js';

export function createDeck() {
  const deck = [];
  for (let value = MIN_CARD; value <= MAX_CARD; value++) {
    for (let i = 0; i < CARDS_PER_VALUE; i++) {
      deck.push(value);
    }
  }
  return deck;
}
