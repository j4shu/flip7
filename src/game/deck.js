import {
  CARDS_PER_VALUE, MIN_CARD, MAX_CARD,
  ACTION_CARDS, ACTION_CARDS_PER_TYPE,
} from './constants.js';

export function createDeck() {
  const deck = [];
  // Number cards: 3 copies of each value 1-12
  for (let value = MIN_CARD; value <= MAX_CARD; value++) {
    for (let i = 0; i < CARDS_PER_VALUE; i++) {
      deck.push(value);
    }
  }
  // Action cards: 3 copies of each type
  for (const action of ACTION_CARDS) {
    for (let i = 0; i < ACTION_CARDS_PER_TYPE; i++) {
      deck.push(action);
    }
  }
  return deck; // 36 number + 9 action = 45 cards
}

export function isActionCard(card) {
  return typeof card === 'string';
}
