
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  imageSrc: string;
  slug: string;
  playerCount: number;
}

const GameCard = ({ title, description, imageSrc, slug, playerCount }: GameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="cyber-card overflow-hidden group h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark to-transparent opacity-50 z-10"></div>
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-in-out group-hover:scale-110" 
        />
        <div className="absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-sm rounded-full py-1 px-3 flex items-center">
          <Users className="w-3.5 h-3.5 text-neon-purple mr-1" />
          <span className="text-xs font-medium">{playerCount}</span>
        </div>
      </div>
      
      <div className="flex-grow p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-cyber text-xl mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        </div>
        
        <Button 
          className={`group btn-cyber w-full ${isHovered ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20' : ''}`}
          asChild
        >
          <Link to={`/games/${slug}`}>
            Play Now
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default GameCard;
