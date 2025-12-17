
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Sparkles, Zap, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Slot symbols with values
const SYMBOLS = [
  { id: 'cherry', emoji: '🍒', value: 2, name: 'Cherry' },
  { id: 'lemon', emoji: '🍋', value: 3, name: 'Lemon' },
  { id: 'orange', emoji: '🍊', value: 4, name: 'Orange' },
  { id: 'plum', emoji: '🟣', value: 5, name: 'Plum' },
  { id: 'bell', emoji: '🔔', value: 6, name: 'Bell' },
  { id: 'bar', emoji: '📊', value: 7, name: 'Bar' },
  { id: 'seven', emoji: '7️⃣', value: 10, name: 'Seven' },
  { id: 'wild', emoji: '⭐', value: 0, name: 'Wild', isWild: true },
  { id: 'scatter', emoji: '💎', value: 0, name: 'Scatter', isScatter: true },
];

const REELS = 5;
const ROWS = 3;
const PAYLINES = [
  // Horizontal lines
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], // Top
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]], // Middle
  [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]], // Bottom
  // V shapes
  [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]], // V down
  [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]], // V up
  // W shapes
  [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]], // W top
  [[0, 2], [1, 1], [2, 2], [3, 1], [4, 2]], // W bottom
  // Diagonals
  [[0, 0], [1, 0], [2, 1], [3, 2], [4, 2]], // Diagonal 1
  [[0, 2], [1, 2], [2, 1], [3, 0], [4, 0]], // Diagonal 2
  // Bonus lines
  [[0, 1], [1, 0], [2, 1], [3, 2], [4, 1]], // Zigzag 1
  [[0, 1], [1, 2], [2, 1], [3, 0], [4, 1]], // Zigzag 2
  [[0, 0], [1, 0], [2, 0], [3, 1], [4, 2]], // Step down
  [[0, 2], [1, 2], [2, 2], [3, 1], [4, 0]], // Step up
  [[0, 1], [1, 2], [2, 2], [3, 2], [4, 1]], // L shape 1
  [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]], // L shape 2
  [[0, 0], [1, 1], [1, 2], [3, 1], [4, 0]], // Special 1
  [[0, 2], [1, 1], [1, 0], [3, 1], [4, 2]], // Special 2
  [[0, 0], [1, 0], [2, 1], [2, 2], [4, 2]], // Special 3
  [[0, 2], [1, 2], [2, 1], [2, 0], [4, 0]], // Special 4
];

const BET_AMOUNTS = [0.25, 0.5, 1, 2, 5, 10, 25, 50];
const SPIN_DURATION = 2000; // 2 seconds
const REEL_SPIN_DELAY = 100; // Delay between reels starting

interface ReelState {
  symbols: string[];
  isSpinning: boolean;
  finalPosition: number;
}

const Slot = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(1);
  const [lines, setLines] = useState(20); // All paylines active
  const [reels, setReels] = useState<ReelState[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [freeSpins, setFreeSpins] = useState(0);
  const [bonusActive, setBonusActive] = useState(false);
  const [totalWins, setTotalWins] = useState(0);

  // Initialize reels
  useEffect(() => {
    const initialReels: ReelState[] = Array(REELS).fill(null).map(() => ({
      symbols: Array(ROWS * 3).fill(null).map(() => 
        SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 2))].id // Exclude wild and scatter initially
      ),
      isSpinning: false,
      finalPosition: 0,
    }));
    setReels(initialReels);
  }, []);

  // Get symbol at position
  const getSymbolAt = (reelIndex: number, rowIndex: number): typeof SYMBOLS[0] => {
    if (reels.length === 0 || !reels[reelIndex]) return SYMBOLS[0];
    const reel = reels[reelIndex];
    if (!reel.symbols || reel.symbols.length === 0) return SYMBOLS[0];
    const symbolIndex = (reel.finalPosition + rowIndex) % reel.symbols.length;
    const symbolId = reel.symbols[symbolIndex];
    return SYMBOLS.find(s => s.id === symbolId) || SYMBOLS[0];
  };

  // Check for winning combinations
  const checkWins = useCallback((): { win: number; lines: number[] } => {
    let totalWin = 0;
    const winningLineIndices: number[] = [];

    PAYLINES.slice(0, lines).forEach((payline, lineIndex) => {
      const lineSymbols = payline.map(([reel, row]) => getSymbolAt(reel, row));
      
      // Check for scatter (3+ anywhere)
      const scatterCount = lineSymbols.filter(s => s.isScatter).length;
      if (scatterCount >= 3) {
        const scatterWin = betAmount * (scatterCount === 3 ? 5 : scatterCount === 4 ? 20 : 100);
        totalWin += scatterWin;
        winningLineIndices.push(lineIndex);
        return;
      }

      // Check for matching symbols (wilds substitute)
      let firstSymbol = lineSymbols.find(s => !s.isWild && !s.isScatter);
      if (!firstSymbol) return;

      let matchCount = 0;
      for (let i = 0; i < lineSymbols.length; i++) {
        const symbol = lineSymbols[i];
        if (symbol.id === firstSymbol.id || symbol.isWild) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const multiplier = matchCount === 3 ? 1 : matchCount === 4 ? 2 : 5;
        const lineWin = betAmount * firstSymbol.value * multiplier;
        totalWin += lineWin;
        winningLineIndices.push(lineIndex);
      }
    });

    return { win: totalWin, lines: winningLineIndices };
  }, [reels, lines, betAmount]);

  // Check for bonus features
  const checkBonus = useCallback((): number => {
    let scatterCount = 0;
    for (let reel = 0; reel < REELS; reel++) {
      for (let row = 0; row < ROWS; row++) {
        const symbol = getSymbolAt(reel, row);
        if (symbol.isScatter) scatterCount++;
      }
    }

    if (scatterCount >= 3) {
      const spins = scatterCount === 3 ? 10 : scatterCount === 4 ? 15 : 20;
      setFreeSpins(prev => prev + spins);
      setBonusActive(true);
      toast.success(`🎉 ${spins} FREE SPINS! 🎉`);
      return spins;
    }
    return 0;
  }, [reels]);

  // Spin animation
  const spinReel = useCallback((reelIndex: number, finalSymbols: string[]): Promise<void> => {
    return new Promise((resolve) => {
      setReels(prev => {
        const reel = prev[reelIndex];
        if (!reel) {
          resolve();
          return prev;
        }
        return prev.map((r, i) => 
          i === reelIndex 
            ? { ...r, isSpinning: true }
            : r
        );
      });

      const startTime = Date.now();
      const spinInterval = setInterval(() => {
        setReels(prev => prev.map((r, i) => {
          if (i !== reelIndex) return r;
          return {
            ...r,
            finalPosition: (r.finalPosition + 1) % (r.symbols.length || 1),
          };
        }));

        if (Date.now() - startTime >= SPIN_DURATION + (reelIndex * REEL_SPIN_DELAY)) {
          clearInterval(spinInterval);
          setReels(prev => prev.map((r, i) => 
            i === reelIndex 
              ? { ...r, isSpinning: false, symbols: finalSymbols }
              : r
          ));
          resolve();
        }
      }, 50);
    });
  }, []);

  // Main spin function
  const handleSpin = useCallback(async () => {
    if (isSpinning) return;
    if (betAmount * lines > balance) {
      toast.error('Insufficient balance!');
      return;
    }

    const useFreeSpin = freeSpins > 0;
    if (!useFreeSpin) {
      setBalance(prev => prev - betAmount * lines);
    } else {
      setFreeSpins(prev => prev - 1);
    }

    setIsSpinning(true);
    setWinningLines([]);
    setLastWin(0);
    setBonusActive(false);

    // Generate final positions
    const finalReels: ReelState[] = reels.map((reel, reelIndex) => {
      const newSymbols = Array(ROWS * 3).fill(null).map(() => {
        // Higher chance for wilds and scatters during bonus
        if (bonusActive && Math.random() < 0.15) {
          return Math.random() < 0.5 ? 'wild' : 'scatter';
        }
        // Normal distribution
        const rand = Math.random();
        if (rand < 0.05) return 'wild';
        if (rand < 0.1) return 'scatter';
        return SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 2))].id;
      });
      
      return {
        ...reel,
        symbols: newSymbols,
        finalPosition: Math.floor(Math.random() * reel.symbols.length),
      };
    });

    // Animate spins
    const spinPromises = finalReels.map((_, i) => 
      spinReel(i, finalReels[i].symbols)
    );
    await Promise.all(spinPromises);

    // Update reels with final positions
    setReels(finalReels);

    // Check for wins
    setTimeout(() => {
      const { win, lines: winLines } = checkWins();
      const bonusSpins = checkBonus();

      if (win > 0) {
        setBalance(prev => prev + win);
        setLastWin(win);
        setTotalWins(prev => prev + win);
        setWinningLines(winLines);
        toast.success(`🎊 Win: $${win.toFixed(2)}! 🎊`);
      } else if (!bonusSpins) {
        toast.info('No win this time. Try again!');
      }

      setIsSpinning(false);
    }, 500);
  }, [isSpinning, balance, betAmount, lines, freeSpins, reels, bonusActive, spinReel, checkWins, checkBonus]);

  // Auto-spin for free spins
  useEffect(() => {
    if (freeSpins > 0 && !isSpinning && !bonusActive) {
      const timer = setTimeout(() => {
        handleSpin();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [freeSpins, isSpinning, bonusActive, handleSpin]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cyber text-4xl md:text-5xl mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan">
              Cyber Slots
            </span>
          </h1>
          <p className="text-muted-foreground">Spin the reels and win big with {PAYLINES.length} paylines!</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="cyber-card">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Coins className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-cyber text-lg">${balance.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Trophy className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Last Win</p>
                <p className={cn("font-cyber text-lg", lastWin > 0 ? "text-green-500" : "text-muted-foreground")}>
                  {lastWin > 0 ? `+$${lastWin.toFixed(2)}` : '$0.00'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Free Spins</p>
                <p className="font-cyber text-lg text-purple-500">{freeSpins}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Zap className="w-5 h-5 text-cyan-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Wins</p>
                <p className="font-cyber text-lg text-cyan-500">${totalWins.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Slot Machine */}
          <Card className="cyber-card p-6">
            <div className="relative">
              {/* Reels */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array(REELS).fill(null).map((_, reelIndex) => (
                  <div key={reelIndex} className="relative">
                    <div className="bg-gradient-to-b from-cyber-dark/50 to-cyber-dark rounded-lg p-2 border-2 border-neon-purple/30">
                      {Array(ROWS).fill(null).map((_, rowIndex) => {
                        const symbol = getSymbolAt(reelIndex, rowIndex);
                        const isWinning = winningLines.some(lineIdx => {
                          const payline = PAYLINES[lineIdx];
                          return payline.some(([r, rw]) => r === reelIndex && rw === rowIndex);
                        });
                        
                        return (
                          <div
                            key={rowIndex}
                            className={cn(
                              "aspect-square flex items-center justify-center text-4xl md:text-5xl mb-2 rounded",
                              "bg-gradient-to-br from-background/80 to-background/40",
                              "border-2 transition-all duration-300",
                              isWinning && "border-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse",
                              reels[reelIndex]?.isSpinning && "animate-spin-fast"
                            )}
                          >
                            {symbol.emoji}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Paylines indicator */}
              <div className="text-center mb-4">
                <Badge variant="outline" className="font-cyber">
                  {lines} Paylines Active
                </Badge>
              </div>

              {/* Spin Button */}
              <Button
                onClick={handleSpin}
                disabled={isSpinning || betAmount * lines > balance}
                className={cn(
                  "w-full btn-cyber text-lg py-6 font-cyber uppercase",
                  isSpinning && "animate-pulse"
                )}
                size="lg"
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🎰</span>
                    Spinning...
                  </span>
                ) : freeSpins > 0 ? (
                  `Free Spin (${freeSpins} left)`
                ) : (
                  'Spin'
                )}
              </Button>
            </div>
          </Card>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full lg:w-80">
            {/* Bet Amount */}
            <Card className="cyber-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-cyber text-sm">Bet Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {BET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => !isSpinning && setBetAmount(amount)}
                      disabled={isSpinning}
                      className={cn(
                        "py-2 px-3 rounded-lg font-cyber text-sm transition-all",
                        betAmount === amount
                          ? "bg-neon-purple text-white"
                          : "bg-muted hover:bg-muted/80",
                        isSpinning && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Total Bet: ${(betAmount * lines).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* Paylines */}
            <Card className="cyber-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-cyber text-sm">Paylines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max={PAYLINES.length}
                    value={lines}
                    onChange={(e) => !isSpinning && setLines(Number(e.target.value))}
                    disabled={isSpinning}
                    className="flex-1"
                  />
                  <span className="font-cyber text-sm w-12 text-center">{lines}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Max: {PAYLINES.length} lines
                </p>
              </CardContent>
            </Card>

            {/* Symbol Payouts */}
            <Card className="cyber-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-cyber text-sm">Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {SYMBOLS.filter(s => !s.isWild && !s.isScatter).map((symbol) => (
                    <div key={symbol.id} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{symbol.emoji}</span>
                        <span>{symbol.name}</span>
                      </span>
                      <span className="text-muted-foreground">
                        3x: {symbol.value}x | 4x: {symbol.value * 2}x | 5x: {symbol.value * 5}x
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      <span>Wild</span>
                    </span>
                    <span className="text-muted-foreground">Substitutes all</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">💎</span>
                      <span>Scatter</span>
                    </span>
                    <span className="text-muted-foreground">3+: Free Spins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Rules */}
        <Card className="cyber-card mt-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-cyber text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Select your bet amount and number of paylines</p>
            <p>2. Click "Spin" to spin the reels</p>
            <p>3. Match 3+ symbols on any active payline to win</p>
            <p>4. Wild symbols (⭐) substitute for any symbol</p>
            <p>5. Get 3+ Scatter symbols (💎) to trigger Free Spins bonus!</p>
            <p className="text-xs mt-4 text-cyan-500">
              <strong>Bonus Feature:</strong> Free spins have increased chances of wilds and scatters!
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Slot;

