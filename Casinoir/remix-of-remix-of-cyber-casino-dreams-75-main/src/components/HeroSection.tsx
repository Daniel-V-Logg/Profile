
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      
      const scrollPosition = window.scrollY;
      parallaxRef.current.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Parallax background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cyber-darker opacity-70 z-10"></div>
        <div 
          ref={parallaxRef} 
          className="absolute inset-0 z-0 bg-cyberpunk-gradient opacity-10"
          style={{ 
            backgroundImage: 'url("/lovable-uploads/bbaba1ea-fee6-4642-b7d2-3d60db07bb26.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '120%',
            top: '-10%'
          }}
        ></div>
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 z-10 circuit-bg opacity-20"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-20 pt-16">
        <div className="max-w-3xl">
          <div className="mb-6">
            <span className="inline-block font-cyber text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
              Welcome to the future of gambling
            </span>
          </div>
          <h1 className="font-cyber text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-4 text-glow">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan">
              CASINOIR
            </span>
            <br />
            <span className="text-white">Cyberpunk Casino</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl text-muted-foreground">
            Experience the future of online gambling with our immersive cyberpunk-themed
            games. Play Baccarat, Plinko, and Roulette in a neon-lit digital realm.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="btn-cyber text-base" size="lg" asChild>
              <Link to="/games">Play Now</Link>
            </Button>
            <Button variant="outline" className="btn-cyber text-base" size="lg" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20"></div>
    </div>
  );
};

export default HeroSection;
