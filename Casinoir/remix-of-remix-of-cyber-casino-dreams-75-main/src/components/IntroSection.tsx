
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const IntroSection = () => {
  const features = [
    {
      title: 'Futuristic Design',
      description: 'Immerse yourself in a neon-drenched cyberpunk world with cutting-edge visuals and animations.',
      icon: '🌃'
    },
    {
      title: 'Fair Gameplay',
      description: 'All games run on provably fair algorithms, ensuring complete transparency and trust.',
      icon: '🔒'
    },
    {
      title: 'Instant Rewards',
      description: 'Win big and get paid instantly with our lightning-fast payout system.',
      icon: '⚡'
    },
    {
      title: 'Cross-Platform',
      description: 'Play anywhere, anytime on desktop or mobile with our responsive design.',
      icon: '📱'
    }
  ];
  
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyberpunk-radial opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left side content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <h2 className="font-cyber text-3xl md:text-4xl mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan">
                  The Next Generation
                </span>
                <br />
                of Online Gambling
              </h2>
              <p className="text-muted-foreground">
                Casinoir redefines the digital casino experience by combining cutting-edge 
                technology with classic gambling games. Our cyberpunk aesthetic creates an 
                immersive environment that transports you to a neon-lit future where every 
                bet feels like an adventure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="cyber-card p-4">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="font-cyber text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div>
              <Link 
                to="/games" 
                className="inline-flex items-center font-cyber text-sm uppercase text-neon-cyan hover:text-neon-purple transition-colors"
              >
                Explore all games 
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {/* Right side image */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-[4/3] rounded-lg overflow-hidden neon-border">
              <img 
                src="/lovable-uploads/36f65994-bd28-4a8d-baec-4d34715936d8.png" 
                alt="Cyberpunk casino environment" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
