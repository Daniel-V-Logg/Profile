import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayingCard from '@/components/games/PlayingCard';
import {
  Card,
  Hand,
  createDeck,
  calculateHandValue,
  isBlackjack,
  isBusted,
  canSplit,
  canDouble,
  determineResult,
  GameResult,
} from '@/lib/blackjack';

type GamePhase = 'betting' | 'playing' | 'dealer' | 'result';

const CHIP_VALUES = [5, 25, 100, 500];

const Blackjack = () => {
  const [balance, setBalance] = useState(1000);
  const [deck, setDeck] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<Hand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [selectedChip, setSelectedChip] = useState(25);
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting');
  const [results, setResults] = useState<GameResult[]>([]);
  const [message, setMessage] = useState('Place your bet');

  // Initialize deck
  useEffect(() => {
    setDeck(createDeck());
  }, []);

  const drawCard = useCallback((faceDown = false): Card | null => {
    if (deck.length === 0) return null;
    const card = { ...deck[0], faceDown };
    setDeck(prev => prev.slice(1));
    return card;
  }, [deck]);

  const placeBet = (amount: number) => {
    if (gamePhase !== 'betting') return;
    const newBet = Math.min(currentBet + amount, balance);
    setCurrentBet(newBet);
  };

  const clearBet = () => {
    setCurrentBet(0);
  };

  const deal = async () => {
    if (currentBet === 0 || gamePhase !== 'betting') return;
    
    // Reshuffle if deck is low
    let currentDeck = deck;
    if (currentDeck.length < 52) {
      currentDeck = createDeck();
      setDeck(currentDeck);
    }

    setBalance(prev => prev - currentBet);
    
    // Deal cards
    const playerCard1 = { ...currentDeck[0] };
    const dealerCard1 = { ...currentDeck[1] };
    const playerCard2 = { ...currentDeck[2] };
    const dealerCard2 = { ...currentDeck[3], faceDown: true };
    
    setDeck(currentDeck.slice(4));
    
    const playerCards = [playerCard1, playerCard2];
    const dealerCards = [dealerCard1, dealerCard2];
    
    setDealerHand(dealerCards);
    setPlayerHands([{
      cards: playerCards,
      bet: currentBet,
      isDoubled: false,
      isStanding: false,
      isBusted: false,
      isBlackjack: isBlackjack(playerCards),
    }]);
    setActiveHandIndex(0);
    setGamePhase('playing');
    setMessage('');
    setResults([]);

    // Check for blackjack
    if (isBlackjack(playerCards)) {
      setTimeout(() => {
        revealDealerAndResolve([{
          cards: playerCards,
          bet: currentBet,
          isDoubled: false,
          isStanding: true,
          isBusted: false,
          isBlackjack: true,
        }]);
      }, 1000);
    }
  };

  const hit = () => {
    if (gamePhase !== 'playing') return;
    
    const card = drawCard();
    if (!card) return;

    setPlayerHands(prev => {
      const newHands = [...prev];
      const hand = { ...newHands[activeHandIndex] };
      hand.cards = [...hand.cards, card];
      
      if (isBusted(hand.cards)) {
        hand.isBusted = true;
        hand.isStanding = true;
      }
      
      newHands[activeHandIndex] = hand;
      return newHands;
    });
  };

  // Handle busted or standing hands
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    
    const currentHand = playerHands[activeHandIndex];
    if (!currentHand) return;

    if (currentHand.isBusted || currentHand.isStanding) {
      // Move to next hand or dealer phase
      if (activeHandIndex < playerHands.length - 1) {
        setActiveHandIndex(prev => prev + 1);
      } else {
        // All hands done, dealer's turn
        const allBusted = playerHands.every(h => h.isBusted);
        if (allBusted) {
          resolveGame(playerHands);
        } else {
          revealDealerAndResolve(playerHands);
        }
      }
    }
  }, [playerHands, activeHandIndex, gamePhase]);

  const stand = () => {
    if (gamePhase !== 'playing') return;
    
    setPlayerHands(prev => {
      const newHands = [...prev];
      newHands[activeHandIndex] = { ...newHands[activeHandIndex], isStanding: true };
      return newHands;
    });
  };

  const double = () => {
    if (gamePhase !== 'playing') return;
    const hand = playerHands[activeHandIndex];
    if (!canDouble(hand) || balance < hand.bet) return;

    setBalance(prev => prev - hand.bet);
    
    const card = drawCard();
    if (!card) return;

    setPlayerHands(prev => {
      const newHands = [...prev];
      const updatedHand = { ...newHands[activeHandIndex] };
      updatedHand.cards = [...updatedHand.cards, card];
      updatedHand.bet *= 2;
      updatedHand.isDoubled = true;
      updatedHand.isStanding = true;
      updatedHand.isBusted = isBusted(updatedHand.cards);
      newHands[activeHandIndex] = updatedHand;
      return newHands;
    });
  };

  const split = () => {
    if (gamePhase !== 'playing') return;
    const hand = playerHands[activeHandIndex];
    if (!canSplit(hand) || balance < hand.bet) return;

    setBalance(prev => prev - hand.bet);

    const card1 = drawCard();
    const card2 = drawCard();
    if (!card1 || !card2) return;

    setPlayerHands(prev => {
      const newHands = [...prev];
      const originalHand = newHands[activeHandIndex];
      
      const hand1: Hand = {
        cards: [originalHand.cards[0], card1],
        bet: originalHand.bet,
        isDoubled: false,
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
      };
      
      const hand2: Hand = {
        cards: [originalHand.cards[1], card2],
        bet: originalHand.bet,
        isDoubled: false,
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
      };

      newHands.splice(activeHandIndex, 1, hand1, hand2);
      return newHands;
    });
  };

  const revealDealerAndResolve = async (hands: Hand[]) => {
    setGamePhase('dealer');
    
    // Reveal dealer's hole card
    setDealerHand(prev => prev.map(card => ({ ...card, faceDown: false })));
    
    // Dealer draws (hits on 16 or less, stands on 17+)
    let currentDealerHand = dealerHand.map(card => ({ ...card, faceDown: false }));
    let currentDeck = [...deck];
    
    const dealerDraw = async () => {
      while (calculateHandValue(currentDealerHand) < 17) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newCard = { ...currentDeck[0], faceDown: false };
        currentDeck = currentDeck.slice(1);
        currentDealerHand = [...currentDealerHand, newCard];
        setDealerHand([...currentDealerHand]);
        setDeck(currentDeck);
      }
      
      resolveGame(hands, currentDealerHand);
    };

    setTimeout(dealerDraw, 500);
  };

  const resolveGame = (hands: Hand[], finalDealerHand?: Card[]) => {
    const dealerCards = finalDealerHand || dealerHand.map(c => ({ ...c, faceDown: false }));
    const dealerValue = calculateHandValue(dealerCards);
    const dealerHasBlackjack = isBlackjack(dealerCards);
    
    const gameResults: GameResult[] = [];
    let totalWinnings = 0;

    hands.forEach(hand => {
      const playerValue = calculateHandValue(hand.cards);
      const result = determineResult(playerValue, dealerValue, hand.isBlackjack, dealerHasBlackjack);
      gameResults.push(result);

      if (result === 'blackjack') {
        totalWinnings += hand.bet * 2.5; // 3:2 payout
      } else if (result === 'win') {
        totalWinnings += hand.bet * 2;
      } else if (result === 'push') {
        totalWinnings += hand.bet;
      }
    });

    setResults(gameResults);
    setBalance(prev => prev + totalWinnings);
    setGamePhase('result');
    
    const hasWin = gameResults.some(r => r === 'win' || r === 'blackjack');
    const allLose = gameResults.every(r => r === 'lose');
    
    if (gameResults.includes('blackjack')) {
      setMessage('Blackjack! 🎉');
    } else if (hasWin) {
      setMessage('You Win! 🎉');
    } else if (allLose) {
      setMessage('Dealer Wins');
    } else {
      setMessage('Push');
    }
  };

  const newRound = () => {
    setDealerHand([]);
    setPlayerHands([]);
    setCurrentBet(0);
    setActiveHandIndex(0);
    setGamePhase('betting');
    setMessage('Place your bet');
    setResults([]);
  };

  const activeHand = playerHands[activeHandIndex];
  const playerValue = activeHand ? calculateHandValue(activeHand.cards) : 0;
  const dealerValue = calculateHandValue(dealerHand);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/games" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </Link>
          <div className="text-xl font-bold text-primary">
            Balance: ${balance.toLocaleString()}
          </div>
        </div>

        {/* Game Title */}
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Blackjack
        </h1>

        {/* Game Table */}
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border p-8 shadow-2xl">
          {/* Dealer Area */}
          <div className="text-center mb-8">
            <h2 className="text-lg text-muted-foreground mb-2">
              Dealer {gamePhase !== 'betting' && `(${dealerValue})`}
            </h2>
            <div className="flex justify-center gap-2 min-h-32">
              {dealerHand.map((card, index) => (
                <PlayingCard
                  key={index}
                  suit={card.suit}
                  rank={card.rank}
                  faceDown={card.faceDown ?? false}
                  delay={index * 150}
                />
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="text-center text-2xl font-bold text-primary mb-6 animate-pulse">
              {message}
            </div>
          )}

          {/* Player Hands */}
          <div className="mb-8">
            <h2 className="text-lg text-muted-foreground text-center mb-2">
              Your Hand {playerHands.length > 0 && `(${playerValue})`}
            </h2>
            <div className="flex justify-center gap-8 flex-wrap">
              {playerHands.map((hand, handIndex) => (
                <div
                  key={handIndex}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                    handIndex === activeHandIndex && gamePhase === 'playing'
                      ? 'ring-2 ring-primary bg-primary/10'
                      : ''
                  }`}
                >
                  <div className="flex gap-2 mb-2">
                    {hand.cards.map((card, cardIndex) => (
                      <PlayingCard
                        key={cardIndex}
                        suit={card.suit}
                        rank={card.rank}
                        delay={cardIndex * 150}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Bet: ${hand.bet} | Value: {calculateHandValue(hand.cards)}
                    {hand.isBusted && <span className="text-destructive ml-2">BUST</span>}
                    {hand.isBlackjack && <span className="text-primary ml-2">BLACKJACK!</span>}
                  </div>
                  {results[handIndex] && (
                    <div className={`text-sm font-bold mt-1 ${
                      results[handIndex] === 'win' || results[handIndex] === 'blackjack' 
                        ? 'text-green-500' 
                        : results[handIndex] === 'lose' 
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                    }`}>
                      {results[handIndex].toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          {gamePhase === 'betting' && (
            <div className="space-y-6">
              {/* Chip Selection */}
              <div className="flex justify-center gap-4">
                {CHIP_VALUES.map(value => (
                  <button
                    key={value}
                    onClick={() => setSelectedChip(value)}
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-sm transition-all
                      ${selectedChip === value 
                        ? 'border-primary bg-primary text-primary-foreground scale-110' 
                        : 'border-border bg-card hover:border-primary/50'
                      }`}
                  >
                    ${value}
                  </button>
                ))}
              </div>

              {/* Bet Display */}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-4">
                  Bet: ${currentBet}
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => placeBet(selectedChip)}
                    disabled={balance < selectedChip}
                    variant="outline"
                  >
                    Add ${selectedChip}
                  </Button>
                  <Button onClick={clearBet} variant="ghost">
                    Clear
                  </Button>
                </div>
              </div>

              {/* Deal Button */}
              <div className="flex justify-center">
                <Button
                  onClick={deal}
                  disabled={currentBet === 0}
                  size="lg"
                  className="px-12 py-6 text-xl"
                >
                  Deal
                </Button>
              </div>
            </div>
          )}

          {gamePhase === 'playing' && activeHand && !activeHand.isBlackjack && (
            <div className="flex justify-center gap-4">
              <Button onClick={hit} size="lg">
                Hit
              </Button>
              <Button onClick={stand} size="lg" variant="secondary">
                Stand
              </Button>
              <Button
                onClick={double}
                disabled={!canDouble(activeHand) || balance < activeHand.bet}
                size="lg"
                variant="outline"
              >
                Double
              </Button>
              <Button
                onClick={split}
                disabled={!canSplit(activeHand) || balance < activeHand.bet}
                size="lg"
                variant="outline"
              >
                Split
              </Button>
            </div>
          )}

          {gamePhase === 'result' && (
            <div className="flex justify-center">
              <Button onClick={newRound} size="lg" className="px-12">
                New Round
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
