export const WINNING_SCORE = 200;
export const FLIP7_COUNT = 7;
export const FLIP7_BONUS = 15;
export const CARDS_PER_VALUE = 3;
export const MIN_CARD = 1;
export const MAX_CARD = 12;
export const HUMAN_ID = '0';
export const BOT_ID = '1';

export const PLAYER_NAMES = {
  [HUMAN_ID]: 'You',
  [BOT_ID]: 'Bot',
};

// Action card types (stored as strings in the deck to distinguish from number cards)
export const FREEZE = 'freeze';
export const FLIP3 = 'flip3';
export const SECOND_CHANCE = 'second_chance';

export const ACTION_CARDS = [FREEZE, FLIP3, SECOND_CHANCE];
export const ACTION_CARDS_PER_TYPE = 3;

export const ACTION_CARD_LABELS = {
  [FREEZE]: '🥶',
  [FLIP3]: 'Flip 3',
  [SECOND_CHANCE]: '❤️‍🩹',
};
