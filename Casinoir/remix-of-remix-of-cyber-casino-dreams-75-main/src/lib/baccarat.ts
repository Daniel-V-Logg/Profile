export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export type BetType = 'player' | 'banker' | 'tie';

export interface GameResult {
  playerScore: number;
  bankerScore: number;
  winner: BetType;
  playerCards: Card[];
  bankerCards: Card[];
}

const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function getCardValue(rank: Rank): number {
  if (rank === 'A') return 1;
  if (['10', 'J', 'Q', 'K'].includes(rank)) return 0;
  return parseInt(rank);
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, value: getCardValue(rank) });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateScore(cards: Card[]): number {
  const total = cards.reduce((sum, card) => sum + card.value, 0);
  return total % 10;
}

function shouldPlayerDrawThird(playerScore: number): boolean {
  return playerScore <= 5;
}

function shouldBankerDrawThird(bankerScore: number, playerThirdCard: Card | null): boolean {
  if (playerThirdCard === null) {
    return bankerScore <= 5;
  }

  const playerThirdValue = playerThirdCard.value;

  if (bankerScore <= 2) return true;
  if (bankerScore === 3) return playerThirdValue !== 8;
  if (bankerScore === 4) return playerThirdValue >= 2 && playerThirdValue <= 7;
  if (bankerScore === 5) return playerThirdValue >= 4 && playerThirdValue <= 7;
  if (bankerScore === 6) return playerThirdValue === 6 || playerThirdValue === 7;
  return false;
}

export function playBaccarat(): GameResult {
  let deck = shuffleDeck(createDeck());
  
  // Deal initial cards
  const playerCards: Card[] = [deck.pop()!, deck.pop()!];
  const bankerCards: Card[] = [deck.pop()!, deck.pop()!];

  let playerScore = calculateScore(playerCards);
  let bankerScore = calculateScore(bankerCards);

  // Natural win check (8 or 9)
  const isNatural = playerScore >= 8 || bankerScore >= 8;

  if (!isNatural) {
    // Player draws third card if needed
    let playerThirdCard: Card | null = null;
    if (shouldPlayerDrawThird(playerScore)) {
      playerThirdCard = deck.pop()!;
      playerCards.push(playerThirdCard);
      playerScore = calculateScore(playerCards);
    }

    // Banker draws third card based on rules
    if (shouldBankerDrawThird(bankerScore, playerThirdCard)) {
      bankerCards.push(deck.pop()!);
      bankerScore = calculateScore(bankerCards);
    }
  }

  // Determine winner
  let winner: BetType;
  if (playerScore > bankerScore) {
    winner = 'player';
  } else if (bankerScore > playerScore) {
    winner = 'banker';
  } else {
    winner = 'tie';
  }

  return {
    playerScore,
    bankerScore,
    winner,
    playerCards,
    bankerCards,
  };
}

export function calculatePayout(betType: BetType, betAmount: number, winner: BetType): number {
  if (betType !== winner) return 0;
  
  switch (betType) {
    case 'player':
      return betAmount * 2; // 1:1 payout
    case 'banker':
      return betAmount * 1.95; // 1:1 minus 5% commission
    case 'tie':
      return betAmount * 9; // 8:1 payout
    default:
      return 0;
  }
}
