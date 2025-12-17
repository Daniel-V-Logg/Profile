export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
}

export interface Hand {
  cards: Card[];
  bet: number;
  isDoubled: boolean;
  isStanding: boolean;
  isBusted: boolean;
  isBlackjack: boolean;
}

export const createDeck = (): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  
  // Use 6 decks like real casinos
  for (let d = 0; d < 6; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  }
  
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getCardValue = (card: Card): number[] => {
  if (card.rank === 'A') return [1, 11];
  if (['K', 'Q', 'J'].includes(card.rank)) return [10];
  return [parseInt(card.rank)];
};

export const calculateHandValue = (cards: Card[]): number => {
  let total = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.faceDown) continue;
    const values = getCardValue(card);
    if (card.rank === 'A') {
      aces++;
      total += 11;
    } else {
      total += values[0];
    }
  }
  
  // Convert aces from 11 to 1 if busting
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
};

export const isBlackjack = (cards: Card[]): boolean => {
  return cards.length === 2 && calculateHandValue(cards) === 21;
};

export const isBusted = (cards: Card[]): boolean => {
  return calculateHandValue(cards) > 21;
};

export const canSplit = (hand: Hand): boolean => {
  if (hand.cards.length !== 2) return false;
  const val1 = getCardValue(hand.cards[0])[0];
  const val2 = getCardValue(hand.cards[1])[0];
  return val1 === val2 || (hand.cards[0].rank === 'A' && hand.cards[1].rank === 'A');
};

export const canDouble = (hand: Hand): boolean => {
  return hand.cards.length === 2 && !hand.isDoubled;
};

export type GameResult = 'win' | 'lose' | 'push' | 'blackjack';

export const determineResult = (playerValue: number, dealerValue: number, playerBlackjack: boolean, dealerBlackjack: boolean): GameResult => {
  if (playerBlackjack && dealerBlackjack) return 'push';
  if (playerBlackjack) return 'blackjack';
  if (dealerBlackjack) return 'lose';
  if (playerValue > 21) return 'lose';
  if (dealerValue > 21) return 'win';
  if (playerValue > dealerValue) return 'win';
  if (playerValue < dealerValue) return 'lose';
  return 'push';
};
