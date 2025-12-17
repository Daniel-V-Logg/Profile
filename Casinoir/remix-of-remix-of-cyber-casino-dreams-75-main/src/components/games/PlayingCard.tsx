import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  faceDown?: boolean;
  delay?: number;
  className?: string;
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-foreground',
  spades: 'text-foreground',
};

const PlayingCard = ({ suit, rank, faceDown = false, delay = 0, className }: PlayingCardProps) => {
  const [isFlipped, setIsFlipped] = useState(faceDown);
  const [isDealt, setIsDealt] = useState(false);

  useEffect(() => {
    const dealTimer = setTimeout(() => {
      setIsDealt(true);
    }, delay);

    const flipTimer = setTimeout(() => {
      if (faceDown) {
        setIsFlipped(false);
      }
    }, delay + 300);

    return () => {
      clearTimeout(dealTimer);
      clearTimeout(flipTimer);
    };
  }, [delay, faceDown]);

  return (
    <div
      className={cn(
        'relative w-20 h-28 md:w-24 md:h-32 perspective-1000 transition-all duration-500',
        isDealt ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-500 transform-style-3d',
          isFlipped ? 'rotate-y-180' : ''
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 rounded-lg bg-card border-2 border-border shadow-lg backface-hidden flex flex-col justify-between p-2"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={cn('text-lg md:text-xl font-bold', suitColors[suit])}>
            {rank}
            <span className="ml-1">{suitSymbols[suit]}</span>
          </div>
          <div className={cn('text-3xl md:text-4xl self-center', suitColors[suit])}>
            {suitSymbols[suit]}
          </div>
          <div className={cn('text-lg md:text-xl font-bold self-end rotate-180', suitColors[suit])}>
            {rank}
            <span className="ml-1">{suitSymbols[suit]}</span>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent border-2 border-border shadow-lg backface-hidden rotate-y-180"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-14 h-20 md:w-16 md:h-24 rounded border-2 border-primary-foreground/30 bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center">
              <span className="text-primary-foreground/50 text-2xl font-cyber">C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayingCard;
