import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import PlayingCard from '@/components/games/PlayingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { playBaccarat, calculatePayout, BetType, GameResult, Card as GameCard } from '@/lib/baccarat';
import { Coins, Trophy, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CHIP_VALUES = [10, 25, 50, 100, 500];

const Baccarat = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(0);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [history, setHistory] = useState<BetType[]>([]);

  const handleChipClick = (value: number) => {
    if (isPlaying) return;
    if (balance >= value) {
      setBetAmount(prev => prev + value);
    } else {
      toast.error("Insufficient balance!");
    }
  };

  const handleBetSelect = (bet: BetType) => {
    if (isPlaying) return;
    setSelectedBet(bet);
  };

  const handleDeal = useCallback(() => {
    if (!selectedBet || betAmount === 0) {
      toast.error("Please place a bet first!");
      return;
    }

    if (betAmount > balance) {
      toast.error("Insufficient balance!");
      return;
    }

    setIsPlaying(true);
    setBalance(prev => prev - betAmount);
    setLastWin(null);

    // Small delay before showing result for suspense
    setTimeout(() => {
      const result = playBaccarat();
      setGameResult(result);
      
      // Calculate winnings after cards are shown
      setTimeout(() => {
        const payout = calculatePayout(selectedBet, betAmount, result.winner);
        
        if (payout > 0) {
          setBalance(prev => prev + payout);
          setLastWin(payout - betAmount);
          toast.success(`You won $${(payout - betAmount).toFixed(2)}!`);
        } else {
          setLastWin(-betAmount);
          toast.error("Better luck next time!");
        }
        
        setHistory(prev => [result.winner, ...prev].slice(0, 10));
        setIsPlaying(false);
      }, 2000);
    }, 500);
  }, [selectedBet, betAmount, balance]);

  const handleNewGame = () => {
    setGameResult(null);
    setBetAmount(0);
    setSelectedBet(null);
    setLastWin(null);
  };

  const handleClearBet = () => {
    if (isPlaying) return;
    setBetAmount(0);
    setSelectedBet(null);
  };

  const renderCards = (cards: GameCard[], label: string, score: number) => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <h3 className="font-cyber text-lg uppercase text-muted-foreground">{label}</h3>
        {gameResult && (
          <Badge variant="outline" className="font-cyber text-lg px-3 py-1 border-primary text-primary">
            {score}
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        {cards.map((card, index) => (
          <PlayingCard
            key={`${card.suit}-${card.rank}-${index}`}
            suit={card.suit}
            rank={card.rank}
            faceDown={true}
            delay={index * 300 + (label === 'Banker' ? 600 : 0)}
          />
        ))}
        {!gameResult && (
          <>
            <div className="w-20 h-28 md:w-24 md:h-32 rounded-lg border-2 border-dashed border-muted-foreground/30" />
            <div className="w-20 h-28 md:w-24 md:h-32 rounded-lg border-2 border-dashed border-muted-foreground/30" />
          </>
        )}
      </div>
    </div>
  );

  const getResultIcon = (winner: BetType) => {
    switch (winner) {
      case 'player': return <TrendingUp className="w-4 h-4 text-accent" />;
      case 'banker': return <TrendingDown className="w-4 h-4 text-primary" />;
      case 'tie': return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cyber text-4xl md:text-5xl mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Baccarat
            </span>
          </h1>
          <p className="text-muted-foreground">Place your bet on Player, Banker, or Tie</p>
        </div>

        {/* Balance & History */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <Card className="cyber-card">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Coins className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-cyber text-xl text-foreground">${balance.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">History:</span>
            <div className="flex gap-1">
              {history.length === 0 ? (
                <span className="text-xs text-muted-foreground">No games yet</span>
              ) : (
                history.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      result === 'player' && "bg-accent/20 text-accent",
                      result === 'banker' && "bg-primary/20 text-primary",
                      result === 'tie' && "bg-yellow-500/20 text-yellow-500"
                    )}
                  >
                    {result[0].toUpperCase()}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Game Table */}
        <Card className="cyber-card mb-8 overflow-hidden">
          <div className="bg-gradient-to-b from-green-900/30 to-green-800/30 p-6 md:p-10">
            {/* Cards Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {renderCards(
                gameResult?.playerCards || [],
                'Player',
                gameResult?.playerScore || 0
              )}
              {renderCards(
                gameResult?.bankerCards || [],
                'Banker',
                gameResult?.bankerScore || 0
              )}
            </div>

            {/* Result Display */}
            {gameResult && !isPlaying && (
              <div className="text-center mb-6 animate-fade-in">
                <div className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full font-cyber text-xl",
                  gameResult.winner === 'player' && "bg-accent/20 text-accent border border-accent",
                  gameResult.winner === 'banker' && "bg-primary/20 text-primary border border-primary",
                  gameResult.winner === 'tie' && "bg-yellow-500/20 text-yellow-500 border border-yellow-500"
                )}>
                  <Trophy className="w-5 h-5" />
                  {gameResult.winner.toUpperCase()} WINS!
                </div>
                {lastWin !== null && (
                  <p className={cn(
                    "mt-2 font-cyber text-lg",
                    lastWin > 0 ? "text-green-500" : "text-destructive"
                  )}>
                    {lastWin > 0 ? `+$${lastWin.toFixed(2)}` : `-$${Math.abs(lastWin).toFixed(2)}`}
                  </p>
                )}
              </div>
            )}

            {/* Betting Areas */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {(['player', 'tie', 'banker'] as BetType[]).map((bet) => (
                <button
                  key={bet}
                  onClick={() => handleBetSelect(bet)}
                  disabled={isPlaying}
                  className={cn(
                    "p-4 md:p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2",
                    selectedBet === bet
                      ? "border-primary bg-primary/20 scale-105 shadow-lg shadow-primary/30"
                      : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/10",
                    isPlaying && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="font-cyber text-sm md:text-lg uppercase">{bet}</span>
                  <span className="text-xs text-muted-foreground">
                    {bet === 'player' && '1:1'}
                    {bet === 'banker' && '0.95:1'}
                    {bet === 'tie' && '8:1'}
                  </span>
                  {getResultIcon(bet)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Chips & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {CHIP_VALUES.map((value) => (
              <button
                key={value}
                onClick={() => handleChipClick(value)}
                disabled={isPlaying || balance < value}
                className={cn(
                  "w-14 h-14 md:w-16 md:h-16 rounded-full font-cyber text-sm md:text-base",
                  "border-4 transition-all duration-200 hover:scale-110 hover:-translate-y-1",
                  "shadow-lg active:scale-95",
                  value === 10 && "bg-red-600 border-red-400 text-white",
                  value === 25 && "bg-green-600 border-green-400 text-white",
                  value === 50 && "bg-blue-600 border-blue-400 text-white",
                  value === 100 && "bg-black border-gray-400 text-white",
                  value === 500 && "bg-purple-600 border-purple-400 text-white",
                  (isPlaying || balance < value) && "opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0"
                )}
              >
                ${value}
              </button>
            ))}
          </div>

          {/* Current Bet */}
          <Card className="cyber-card min-w-[150px]">
            <CardContent className="py-3 px-4 text-center">
              <p className="text-xs text-muted-foreground">Current Bet</p>
              <p className="font-cyber text-2xl text-primary">${betAmount}</p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {gameResult ? (
              <Button
                onClick={handleNewGame}
                className="btn-cyber"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleClearBet}
                  variant="outline"
                  disabled={isPlaying || betAmount === 0}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleDeal}
                  disabled={isPlaying || betAmount === 0 || !selectedBet}
                  className="btn-cyber"
                  size="lg"
                >
                  {isPlaying ? 'Dealing...' : 'Deal'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Game Rules */}
        <Card className="cyber-card mt-8">
          <CardHeader>
            <CardTitle className="font-cyber text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Select chip values to build your bet amount</p>
            <p>2. Click on Player, Banker, or Tie to place your bet</p>
            <p>3. Click Deal to start the game</p>
            <p>4. The hand closest to 9 wins!</p>
            <p className="text-xs mt-4">
              <strong>Payouts:</strong> Player 1:1 | Banker 0.95:1 (5% commission) | Tie 8:1
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Baccarat;
