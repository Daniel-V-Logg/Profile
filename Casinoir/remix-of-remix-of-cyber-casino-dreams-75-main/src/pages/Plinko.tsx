import { useState, useCallback, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Coins, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CHIP_VALUES = [10, 25, 50, 100, 500];

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

interface RiskLevel {
  name: string;
  multipliers: number[];
  color: string;
}

const RISK_LEVELS: Record<string, RiskLevel> = {
  low: {
    name: 'Low',
    multipliers: [1.5, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.5],
    color: 'text-green-500',
  },
  medium: {
    name: 'Medium',
    multipliers: [3, 1.5, 1.2, 0.5, 0.3, 0.5, 1.2, 1.5, 3],
    color: 'text-yellow-500',
  },
  high: {
    name: 'High',
    multipliers: [10, 3, 1.5, 0.3, 0, 0.3, 1.5, 3, 10],
    color: 'text-red-500',
  },
};

const ROWS = 8;
const GRAVITY = 0.3;
const BOUNCE = 0.7;
const FRICTION = 0.99;

const Plinko = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [history, setHistory] = useState<{ multiplier: number; win: number }[]>([]);
  const [isDropping, setIsDropping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const ballIdRef = useRef(0);

  const pegPositions = useRef<{ x: number; y: number }[]>([]);
  const canvasWidth = 400;
  const canvasHeight = 500;
  const pegRadius = 6;
  const ballRadius = 10;
  const startY = 40;
  const endY = canvasHeight - 60;
  const rowSpacing = (endY - startY) / (ROWS + 1);

  // Calculate peg positions
  useEffect(() => {
    const pegs: { x: number; y: number }[] = [];
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * 40;
      const startX = (canvasWidth - rowWidth) / 2;
      for (let col = 0; col < pegsInRow; col++) {
        pegs.push({
          x: startX + col * 40,
          y: startY + (row + 1) * rowSpacing,
        });
      }
    }
    pegPositions.current = pegs;
  }, []);

  const multipliers = RISK_LEVELS[riskLevel].multipliers;
  const slotWidth = canvasWidth / multipliers.length;

  const handleChipClick = (value: number) => {
    if (isDropping) return;
    if (balance >= value) {
      setBetAmount(prev => prev + value);
    } else {
      toast.error("Insufficient balance!");
    }
  };

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, currentBalls: Ball[]) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, 'rgba(30, 30, 40, 0.8)');
    gradient.addColorStop(1, 'rgba(20, 20, 30, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw pegs with glow effect
    pegPositions.current.forEach((peg) => {
      // Glow
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, pegRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(155, 135, 245, 0.3)';
      ctx.fill();

      // Peg
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, pegRadius, 0, Math.PI * 2);
      const pegGradient = ctx.createRadialGradient(peg.x - 2, peg.y - 2, 0, peg.x, peg.y, pegRadius);
      pegGradient.addColorStop(0, '#c4b5fd');
      pegGradient.addColorStop(1, '#7c3aed');
      ctx.fillStyle = pegGradient;
      ctx.fill();
    });

    // Draw multiplier slots
    multipliers.forEach((mult, i) => {
      const x = i * slotWidth;
      const y = canvasHeight - 50;
      
      // Slot background
      let slotColor = 'rgba(34, 197, 94, 0.3)'; // green for >= 1
      if (mult >= 3) slotColor = 'rgba(234, 179, 8, 0.4)'; // yellow for >= 3
      if (mult >= 5) slotColor = 'rgba(239, 68, 68, 0.4)'; // red for >= 5
      if (mult < 1) slotColor = 'rgba(100, 100, 100, 0.3)'; // gray for < 1
      
      ctx.fillStyle = slotColor;
      ctx.fillRect(x + 2, y, slotWidth - 4, 45);
      
      // Border
      ctx.strokeStyle = 'rgba(155, 135, 245, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y, slotWidth - 4, 45);
      
      // Multiplier text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${mult}x`, x + slotWidth / 2, y + 28);
    });

    // Draw balls
    currentBalls.forEach((ball) => {
      if (!ball.active) return;
      
      // Ball glow
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
      ctx.fill();
      
      // Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      const ballGradient = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 0, ball.x, ball.y, ballRadius);
      ballGradient.addColorStop(0, '#67e8f9');
      ballGradient.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = ballGradient;
      ctx.fill();
    });
  }, [multipliers, slotWidth]);

  const updateBall = useCallback((ball: Ball): Ball => {
    if (!ball.active) return ball;

    let newVx = ball.vx * FRICTION;
    let newVy = ball.vy + GRAVITY;
    let newX = ball.x + newVx;
    let newY = ball.y + newVy;

    // Check collision with pegs
    for (const peg of pegPositions.current) {
      const dx = newX - peg.x;
      const dy = newY - peg.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < ballRadius + pegRadius) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        const overlap = ballRadius + pegRadius - distance;
        
        // Push ball out
        newX += Math.cos(angle) * overlap;
        newY += Math.sin(angle) * overlap;
        
        // Reflect velocity with randomness
        const normalX = Math.cos(angle);
        const normalY = Math.sin(angle);
        const dotProduct = newVx * normalX + newVy * normalY;
        
        newVx = (newVx - 2 * dotProduct * normalX) * BOUNCE + (Math.random() - 0.5) * 2;
        newVy = (newVy - 2 * dotProduct * normalY) * BOUNCE;
      }
    }

    // Wall collisions
    if (newX < ballRadius) {
      newX = ballRadius;
      newVx = -newVx * BOUNCE;
    }
    if (newX > canvasWidth - ballRadius) {
      newX = canvasWidth - ballRadius;
      newVx = -newVx * BOUNCE;
    }

    // Check if ball reached bottom
    if (newY >= canvasHeight - 60) {
      return { ...ball, x: newX, y: canvasHeight - 55, vx: 0, vy: 0, active: false };
    }

    return { ...ball, x: newX, y: newY, vx: newVx, vy: newVy };
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setBalls(prevBalls => {
      const updatedBalls = prevBalls.map(updateBall);
      drawGame(ctx, updatedBalls);
      
      // Check for newly stopped balls
      const justStopped = updatedBalls.filter((ball, i) => 
        !ball.active && prevBalls[i]?.active
      );
      
      if (justStopped.length > 0) {
        justStopped.forEach(ball => {
          const slotIndex = Math.floor(ball.x / slotWidth);
          const clampedIndex = Math.max(0, Math.min(multipliers.length - 1, slotIndex));
          const multiplier = multipliers[clampedIndex];
          const winAmount = betAmount * multiplier;
          
          setBalance(prev => prev + winAmount);
          setLastWin(winAmount - betAmount);
          setHistory(prev => [{ multiplier, win: winAmount - betAmount }, ...prev].slice(0, 10));
          
          if (winAmount > betAmount) {
            toast.success(`${multiplier}x - Won $${(winAmount - betAmount).toFixed(2)}!`);
          } else if (winAmount < betAmount) {
            toast.error(`${multiplier}x - Lost $${(betAmount - winAmount).toFixed(2)}`);
          } else {
            toast.info(`${multiplier}x - Break even!`);
          }
          
          setIsDropping(false);
        });
      }
      
      return updatedBalls;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateBall, drawGame, betAmount, multipliers, slotWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawGame(ctx, balls);
    }
  }, [drawGame, balls]);

  useEffect(() => {
    if (balls.some(b => b.active)) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balls, gameLoop]);

  const handleDrop = () => {
    if (betAmount === 0) {
      toast.error("Please place a bet first!");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance!");
      return;
    }
    if (isDropping) return;

    setIsDropping(true);
    setBalance(prev => prev - betAmount);
    setLastWin(null);

    const newBall: Ball = {
      id: ballIdRef.current++,
      x: canvasWidth / 2 + (Math.random() - 0.5) * 20,
      y: 15,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      active: true,
    };

    setBalls([newBall]);
  };

  const handleClearBet = () => {
    if (isDropping) return;
    setBetAmount(0);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cyber text-4xl md:text-5xl mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Plinko
            </span>
          </h1>
          <p className="text-muted-foreground">Drop the ball and watch it bounce!</p>
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
                <span className="text-xs text-muted-foreground">No drops yet</span>
              ) : (
                history.slice(0, 8).map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-bold",
                      result.win > 0 && "bg-green-500/20 text-green-500",
                      result.win < 0 && "bg-red-500/20 text-red-500",
                      result.win === 0 && "bg-gray-500/20 text-gray-500"
                    )}
                  >
                    {result.multiplier}x
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Game Canvas */}
          <Card className="cyber-card overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="block"
            />
          </Card>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full lg:w-80">
            {/* Risk Level */}
            <Card className="cyber-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-cyber text-sm">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => !isDropping && setRiskLevel(level)}
                      disabled={isDropping}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg font-cyber text-sm uppercase transition-all",
                        riskLevel === level
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80",
                        isDropping && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chips */}
            <Card className="cyber-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-cyber text-sm">Select Chips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleChipClick(value)}
                      disabled={isDropping || balance < value}
                      className={cn(
                        "w-12 h-12 rounded-full font-cyber text-xs",
                        "border-4 transition-all duration-200 hover:scale-110",
                        "shadow-lg active:scale-95",
                        value === 10 && "bg-red-600 border-red-400 text-white",
                        value === 25 && "bg-green-600 border-green-400 text-white",
                        value === 50 && "bg-blue-600 border-blue-400 text-white",
                        value === 100 && "bg-black border-gray-400 text-white",
                        value === 500 && "bg-purple-600 border-purple-400 text-white",
                        (isDropping || balance < value) && "opacity-50 cursor-not-allowed hover:scale-100"
                      )}
                    >
                      ${value}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Bet */}
            <Card className="cyber-card">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">Current Bet</p>
                <p className="font-cyber text-3xl text-primary">${betAmount}</p>
                {lastWin !== null && (
                  <p className={cn(
                    "mt-2 font-cyber text-lg",
                    lastWin > 0 ? "text-green-500" : lastWin < 0 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {lastWin > 0 ? `+$${lastWin.toFixed(2)}` : lastWin < 0 ? `-$${Math.abs(lastWin).toFixed(2)}` : '$0.00'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleClearBet}
                variant="outline"
                disabled={isDropping || betAmount === 0}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={handleDrop}
                disabled={isDropping || betAmount === 0}
                className="btn-cyber flex-1"
                size="lg"
              >
                {isDropping ? 'Dropping...' : 'Drop Ball'}
              </Button>
            </div>

            {/* Multipliers Reference */}
            <Card className="cyber-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-cyber text-sm">Multipliers ({RISK_LEVELS[riskLevel].name} Risk)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 justify-center">
                  {multipliers.map((mult, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "font-cyber text-xs",
                        mult >= 3 && "border-yellow-500 text-yellow-500",
                        mult >= 5 && "border-red-500 text-red-500",
                        mult < 1 && "border-muted-foreground text-muted-foreground",
                        mult >= 1 && mult < 3 && "border-green-500 text-green-500"
                      )}
                    >
                      {mult}x
                    </Badge>
                  ))}
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
            <p>1. Select your risk level (Low, Medium, or High)</p>
            <p>2. Click chips to build your bet amount</p>
            <p>3. Click "Drop Ball" to release the ball</p>
            <p>4. Watch the ball bounce through the pegs and land in a multiplier slot!</p>
            <p className="text-xs mt-4">
              <strong>Higher risk = Higher potential rewards but also higher chance of loss!</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Plinko;
