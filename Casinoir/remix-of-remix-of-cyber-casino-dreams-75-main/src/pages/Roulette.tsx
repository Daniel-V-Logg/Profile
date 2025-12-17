import { useState, useCallback, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CHIP_VALUES = [5, 10, 25, 50, 100];

// Roulette wheel numbers in order (European)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
};

interface Bet {
  type: 'straight' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' | 'dozen' | 'column';
  value: number | string;
  amount: number;
}

const Roulette = () => {
  const [balance, setBalance] = useState(1000);
  const [selectedChip, setSelectedChip] = useState(10);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);

  const placeBet = (type: Bet['type'], value: number | string) => {
    if (isSpinning) return;
    if (selectedChip > balance - totalBet) {
      toast.error("Insufficient balance!");
      return;
    }

    setBets(prev => {
      const existingIndex = prev.findIndex(b => b.type === type && b.value === value);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].amount += selectedChip;
        return updated;
      }
      return [...prev, { type, value, amount: selectedChip }];
    });
  };

  const clearBets = () => {
    if (isSpinning) return;
    setBets([]);
  };

  const calculateWinnings = (number: number): number => {
    let winnings = 0;
    const color = getNumberColor(number);

    bets.forEach(bet => {
      let won = false;
      let multiplier = 0;

      switch (bet.type) {
        case 'straight':
          if (bet.value === number) {
            won = true;
            multiplier = 35;
          }
          break;
        case 'red':
          if (color === 'red') {
            won = true;
            multiplier = 1;
          }
          break;
        case 'black':
          if (color === 'black') {
            won = true;
            multiplier = 1;
          }
          break;
        case 'odd':
          if (number !== 0 && number % 2 === 1) {
            won = true;
            multiplier = 1;
          }
          break;
        case 'even':
          if (number !== 0 && number % 2 === 0) {
            won = true;
            multiplier = 1;
          }
          break;
        case 'low':
          if (number >= 1 && number <= 18) {
            won = true;
            multiplier = 1;
          }
          break;
        case 'high':
          if (number >= 19 && number <= 36) {
            won = true;
            multiplier = 1;
          }
          break;
        case 'dozen':
          const dozen = Math.ceil(number / 12);
          if (number !== 0 && dozen === bet.value) {
            won = true;
            multiplier = 2;
          }
          break;
        case 'column':
          if (number !== 0 && number % 3 === (bet.value === 3 ? 0 : bet.value as number)) {
            won = true;
            multiplier = 2;
          }
          break;
      }

      if (won) {
        winnings += bet.amount + (bet.amount * multiplier);
      }
    });

    return winnings;
  };

  const spin = () => {
    if (bets.length === 0) {
      toast.error("Please place at least one bet!");
      return;
    }
    if (totalBet > balance) {
      toast.error("Insufficient balance!");
      return;
    }

    setIsSpinning(true);
    setBalance(prev => prev - totalBet);
    setWinningNumber(null);
    setLastWin(null);

    // Random winning number
    const randomIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const number = WHEEL_NUMBERS[randomIndex];
    
    // Calculate rotations
    const numberPosition = randomIndex / WHEEL_NUMBERS.length;
    const baseWheelRotation = 360 * 5; // 5 full rotations
    const finalWheelRotation = baseWheelRotation + (360 - numberPosition * 360);
    
    // Ball spins opposite direction
    const baseBallRotation = -360 * 8;
    const finalBallRotation = baseBallRotation - (numberPosition * 360);

    // Start animation
    setWheelRotation(prev => prev + finalWheelRotation);
    setBallRotation(prev => prev + finalBallRotation);

    // Show result after animation
    setTimeout(() => {
      setWinningNumber(number);
      const winnings = calculateWinnings(number);
      
      if (winnings > 0) {
        setBalance(prev => prev + winnings);
        setLastWin(winnings - totalBet);
        toast.success(`${number} ${getNumberColor(number).toUpperCase()}! Won $${(winnings - totalBet).toFixed(2)}!`);
      } else {
        setLastWin(-totalBet);
        toast.error(`${number} ${getNumberColor(number).toUpperCase()}! Better luck next time!`);
      }
      
      setHistory(prev => [number, ...prev].slice(0, 15));
      setBets([]);
      setIsSpinning(false);
    }, 5000);
  };

  const getBetOnNumber = (num: number) => {
    const bet = bets.find(b => b.type === 'straight' && b.value === num);
    return bet?.amount || 0;
  };

  const renderNumberCell = (num: number) => {
    const color = getNumberColor(num);
    const betAmount = getBetOnNumber(num);
    
    return (
      <button
        key={num}
        onClick={() => placeBet('straight', num)}
        disabled={isSpinning}
        className={cn(
          "relative w-10 h-14 md:w-12 md:h-16 flex items-center justify-center font-cyber text-sm md:text-base font-bold transition-all border border-border/50",
          color === 'red' && "bg-red-600 hover:bg-red-500",
          color === 'black' && "bg-gray-900 hover:bg-gray-800",
          color === 'green' && "bg-green-600 hover:bg-green-500",
          isSpinning && "opacity-50 cursor-not-allowed",
          winningNumber === num && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background"
        )}
      >
        <span className="text-white">{num}</span>
        {betAmount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
            {betAmount}
          </div>
        )}
      </button>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-cyber text-4xl md:text-5xl mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Roulette
            </span>
          </h1>
          <p className="text-muted-foreground">Place your bets and spin the wheel!</p>
        </div>

        {/* Balance & History */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Card className="cyber-card">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Coins className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-cyber text-xl text-foreground">${balance.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">History:</span>
            {history.length === 0 ? (
              <span className="text-xs text-muted-foreground">No spins yet</span>
            ) : (
              history.slice(0, 10).map((num, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white",
                    getNumberColor(num) === 'red' && "bg-red-600",
                    getNumberColor(num) === 'black' && "bg-gray-900",
                    getNumberColor(num) === 'green' && "bg-green-600"
                  )}
                >
                  {num}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start justify-center">
          {/* Wheel Section */}
          <div className="flex flex-col items-center gap-4">
            <Card className="cyber-card p-6 overflow-hidden">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className="absolute inset-0 rounded-full border-4 border-yellow-600 overflow-hidden transition-transform"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transitionDuration: isSpinning ? '5s' : '0s',
                    transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                  }}
                >
                  {/* Wheel segments */}
                  {WHEEL_NUMBERS.map((num, i) => {
                    const angle = (360 / WHEEL_NUMBERS.length) * i;
                    const color = getNumberColor(num);
                    return (
                      <div
                        key={num}
                        className="absolute w-full h-full"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div
                          className={cn(
                            "absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1/2 origin-bottom flex items-start justify-center pt-2",
                            color === 'red' && "bg-red-600",
                            color === 'black' && "bg-gray-900",
                            color === 'green' && "bg-green-600"
                          )}
                          style={{
                            clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                          }}
                        >
                          <span className="text-[8px] md:text-[10px] font-bold text-white">{num}</span>
                        </div>
                      </div>
                    );
                  })}
                  {/* Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 border-4 border-yellow-400 shadow-lg" />
                </div>

                {/* Ball */}
                <div
                  className="absolute inset-4 rounded-full pointer-events-none"
                  style={{
                    transform: `rotate(${ballRotation}deg)`,
                    transitionDuration: isSpinning ? '5s' : '0s',
                    transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                  }}
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg" />
                </div>

                {/* Pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-yellow-500 z-10" />
              </div>
            </Card>

            {/* Winning Number Display */}
            {winningNumber !== null && (
              <div className={cn(
                "text-center p-4 rounded-lg animate-fade-in",
                getNumberColor(winningNumber) === 'red' && "bg-red-600/20 border border-red-500",
                getNumberColor(winningNumber) === 'black' && "bg-gray-900/50 border border-gray-600",
                getNumberColor(winningNumber) === 'green' && "bg-green-600/20 border border-green-500"
              )}>
                <p className="text-sm text-muted-foreground">Winning Number</p>
                <p className="font-cyber text-4xl">{winningNumber}</p>
                {lastWin !== null && (
                  <p className={cn(
                    "font-cyber text-lg mt-1",
                    lastWin > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {lastWin > 0 ? `+$${lastWin.toFixed(2)}` : `-$${Math.abs(lastWin).toFixed(2)}`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Betting Table */}
          <Card className="cyber-card p-4 overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Numbers Grid */}
              <div className="flex mb-2">
                {/* Zero */}
                <div className="mr-1">
                  {renderNumberCell(0)}
                </div>
                
                {/* Main Numbers Grid */}
                <div className="grid grid-cols-12 gap-[2px]">
                  {[...Array(12)].map((_, col) => (
                    [3, 2, 1].map(row => {
                      const num = col * 3 + row;
                      return renderNumberCell(num);
                    })
                  ))}
                </div>
              </div>

              {/* Dozen Bets */}
              <div className="flex gap-[2px] mb-2 ml-11">
                {[1, 2, 3].map(dozen => {
                  const bet = bets.find(b => b.type === 'dozen' && b.value === dozen);
                  return (
                    <button
                      key={dozen}
                      onClick={() => placeBet('dozen', dozen)}
                      disabled={isSpinning}
                      className={cn(
                        "flex-1 h-10 border border-border bg-muted/30 hover:bg-muted/50 font-cyber text-xs transition-all relative",
                        isSpinning && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {dozen === 1 ? '1st 12' : dozen === 2 ? '2nd 12' : '3rd 12'}
                      {bet && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                          {bet.amount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Outside Bets */}
              <div className="grid grid-cols-6 gap-[2px] ml-11">
                {[
                  { type: 'low', label: '1-18', value: 'low' },
                  { type: 'even', label: 'EVEN', value: 'even' },
                  { type: 'red', label: 'RED', value: 'red', color: 'bg-red-600' },
                  { type: 'black', label: 'BLACK', value: 'black', color: 'bg-gray-900' },
                  { type: 'odd', label: 'ODD', value: 'odd' },
                  { type: 'high', label: '19-36', value: 'high' },
                ].map(({ type, label, value, color }) => {
                  const bet = bets.find(b => b.type === type as Bet['type']);
                  return (
                    <button
                      key={type}
                      onClick={() => placeBet(type as Bet['type'], value)}
                      disabled={isSpinning}
                      className={cn(
                        "h-10 border border-border font-cyber text-xs transition-all relative",
                        color || "bg-muted/30 hover:bg-muted/50",
                        color && "text-white hover:opacity-80",
                        isSpinning && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {label}
                      {bet && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                          {bet.amount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Column Bets */}
              <div className="flex gap-[2px] mt-2 ml-11">
                {[1, 2, 3].map(col => {
                  const bet = bets.find(b => b.type === 'column' && b.value === col);
                  return (
                    <button
                      key={col}
                      onClick={() => placeBet('column', col)}
                      disabled={isSpinning}
                      className={cn(
                        "flex-1 h-8 border border-border bg-muted/30 hover:bg-muted/50 font-cyber text-xs transition-all relative",
                        isSpinning && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      2:1
                      {bet && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                          {bet.amount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
          {/* Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {CHIP_VALUES.map((value) => (
              <button
                key={value}
                onClick={() => setSelectedChip(value)}
                disabled={isSpinning}
                className={cn(
                  "w-12 h-12 md:w-14 md:h-14 rounded-full font-cyber text-xs md:text-sm",
                  "border-4 transition-all duration-200",
                  "shadow-lg active:scale-95",
                  value === 5 && "bg-white border-gray-300 text-gray-800",
                  value === 10 && "bg-red-600 border-red-400 text-white",
                  value === 25 && "bg-green-600 border-green-400 text-white",
                  value === 50 && "bg-blue-600 border-blue-400 text-white",
                  value === 100 && "bg-black border-gray-400 text-white",
                  selectedChip === value && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background scale-110",
                  isSpinning && "opacity-50 cursor-not-allowed"
                )}
              >
                ${value}
              </button>
            ))}
          </div>

          {/* Bet Info & Actions */}
          <Card className="cyber-card">
            <CardContent className="py-3 px-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Bet</p>
                <p className="font-cyber text-xl text-primary">${totalBet}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={clearBets}
                  variant="outline"
                  disabled={isSpinning || bets.length === 0}
                  size="sm"
                >
                  Clear
                </Button>
                <Button
                  onClick={spin}
                  disabled={isSpinning || bets.length === 0}
                  className="btn-cyber"
                  size="lg"
                >
                  {isSpinning ? 'Spinning...' : 'Spin'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts */}
        <Card className="cyber-card mt-8 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-cyber text-lg">Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Straight (single number)</p>
                <p className="font-cyber text-primary">35:1</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dozen / Column</p>
                <p className="font-cyber text-primary">2:1</p>
              </div>
              <div>
                <p className="text-muted-foreground">Red / Black</p>
                <p className="font-cyber text-primary">1:1</p>
              </div>
              <div>
                <p className="text-muted-foreground">Odd / Even / High / Low</p>
                <p className="font-cyber text-primary">1:1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Roulette;
