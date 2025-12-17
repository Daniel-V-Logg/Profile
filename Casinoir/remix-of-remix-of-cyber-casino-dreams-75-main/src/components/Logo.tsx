
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <Link 
      to="/" 
      className={`font-cyber font-bold text-transparent bg-clip-text 
      bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan 
      animate-glow text-3xl ${className}`}
    >
      CASINOIR
    </Link>
  );
};

export default Logo;
