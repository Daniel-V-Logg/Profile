import { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Gift, Star, Award, Ticket } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

// Define a proper interface for our promotion type
interface Promotion {
  id: string;
  title: string;
  description: string;
  details: string;
  expires: string | null;
  imageSrc: string;
  isNew: boolean;
  isFeatured: boolean;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  claimed?: boolean;
}

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: 'welcome-bonus',
      title: 'Welcome Bonus',
      description: 'Get a 100% match on your first deposit up to $1,000',
      details: 'New players only. Min deposit $20. Wagering requirements apply.',
      expires: '2025-06-30',
      imageSrc: '/lovable-uploads/898fa4c5-dd26-4904-a050-b72205040cb1.png',
      isNew: true,
      isFeatured: true,
      icon: Gift
    },
    {
      id: 'daily-spin',
      title: 'Daily Spin',
      description: 'Spin the wheel once daily for rewards and bonuses',
      details: 'One free spin per day. Rewards vary from $1 to $100 in bonus cash.',
      expires: null,
      imageSrc: '/lovable-uploads/5510d486-48d7-40a2-818d-b879675e8c30.png',
      isNew: false,
      isFeatured: false,
      icon: Star
    },
    {
      id: 'vip-program',
      title: 'VIP Program',
      description: 'Earn points with every bet and climb the loyalty ladder',
      details: 'Exclusive rewards, personal account manager, and special promotions for VIP members.',
      expires: null,
      imageSrc: '/lovable-uploads/a63f3f86-24ca-4cf1-85c2-f5d20d5c2861.png',
      isNew: false,
      isFeatured: true,
      icon: Award
    },
    {
      id: 'weekend-cashback',
      title: 'Weekend Cashback',
      description: 'Get 10% cashback on all weekend losses',
      details: 'Valid Friday through Sunday. Minimum loss $50 to qualify. Maximum cashback $500.',
      expires: null,
      imageSrc: '/lovable-uploads/06ab303f-6c17-43c5-a31a-0957425d2e69.png',
      isNew: true,
      isFeatured: false,
      icon: Ticket
    }
  ]);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const scrollPosition = window.scrollY;
      parallaxRef.current.style.transform = `translateY(${scrollPosition * 0.05}px)`;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleClaimPromotion = (id: string) => {
    toast.success(`Promotion ${id} has been claimed. Check your account for details.`);
    
    // Animate the claimed promotion
    setPromotions(prev => prev.map(promo => {
      if (promo.id === id) {
        return { ...promo, claimed: true };
      }
      return promo;
    }));
    
    // Reset the claimed status after animation completes
    setTimeout(() => {
      setPromotions(prev => prev.map(promo => {
        if (promo.id === id) {
          return { ...promo, claimed: false };
        }
        return promo;
      }));
    }, 2000);
  };
  
  const filteredPromotions = activeFilter === 'all' 
    ? promotions 
    : activeFilter === 'new' 
    ? promotions.filter(promo => promo.isNew)
    : promotions.filter(promo => promo.isFeatured);
    
  // Calculate time remaining for timed promotions
  const getTimeRemaining = (expiryDate: string) => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, mins };
  };
  
  return (
    <Layout>
      {/* Background gradient with parallax effect */}
      <div className="relative min-h-screen overflow-hidden">
        <div ref={parallaxRef} className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-gradient-to-b from-cyber-dark via-purple-900/20 to-cyber-darker opacity-70"
          ></div>
          <div className="absolute inset-0 circuit-bg"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-16">
          {/* Header section with glowing effect */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-cyber text-4xl md:text-5xl mb-4">
              <span className="inline-block animate-glow bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan">
                Promotions & Bonuses
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Take advantage of our exclusive promotions and bonuses to enhance your gaming experience.
              From welcome bonuses to loyalty rewards, we've got something special for everyone.
            </p>
          </div>
          
          {/* Featured carousel */}
          <div className="mb-12">
            <h2 className="font-cyber text-2xl mb-6 text-center">Featured Offers</h2>
            <Carousel
              opts={{ loop: true, align: "center" }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent>
                {promotions.filter(p => p.isFeatured).map((promo) => (
                  <CarouselItem key={promo.id} className="md:basis-1/2 lg:basis-1/2 pl-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>
                      <img 
                        src={promo.imageSrc} 
                        alt={promo.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <h3 className="text-white font-cyber text-xl mb-1">{promo.title}</h3>
                        <p className="text-white/80 text-sm mb-3">{promo.description}</p>
                        <Button 
                          onClick={() => handleClaimPromotion(promo.id)}
                          className="btn-cyber w-full"
                          size="sm"
                        >
                          <promo.icon className="mr-2 h-4 w-4" />
                          Claim Offer
                        </Button>
                      </div>
                      {promo.isNew && (
                        <Badge className="absolute top-4 right-4 bg-neon-pink font-cyber">NEW</Badge>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-4">
                <CarouselPrevious className="relative left-auto right-auto top-auto translate-y-0" />
                <CarouselNext className="relative left-auto right-auto top-auto translate-y-0" />
              </div>
            </Carousel>
          </div>
          
          {/* Filter options */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-full bg-background/10 backdrop-blur-sm border border-white/10">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'ghost'}
                onClick={() => setActiveFilter('all')}
                className={`rounded-full px-4 ${activeFilter === 'all' ? 'bg-neon-purple text-white' : 'hover:bg-white/10'}`}
              >
                All Promotions
              </Button>
              <Button
                variant={activeFilter === 'new' ? 'default' : 'ghost'}
                onClick={() => setActiveFilter('new')}
                className={`rounded-full px-4 ${activeFilter === 'new' ? 'bg-neon-pink text-white' : 'hover:bg-white/10'}`}
              >
                New
              </Button>
              <Button
                variant={activeFilter === 'featured' ? 'default' : 'ghost'}
                onClick={() => setActiveFilter('featured')}
                className={`rounded-full px-4 ${activeFilter === 'featured' ? 'bg-neon-cyan text-white' : 'hover:bg-white/10'}`}
              >
                Featured
              </Button>
            </div>
          </div>
          
          {/* Promotions grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPromotions.map((promo) => (
              <Card 
                key={promo.id} 
                className={`cyber-card overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-neon-purple/20 ${
                  promo.claimed ? 'scale-[0.98] opacity-90' : ''
                }`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={promo.imageSrc} 
                    alt={promo.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark to-transparent opacity-60"></div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    {promo.isNew && (
                      <div className="bg-neon-pink py-1 px-3 rounded-full text-xs font-cyber">
                        NEW
                      </div>
                    )}
                    {promo.isFeatured && (
                      <div className="bg-neon-purple py-1 px-3 rounded-full text-xs font-cyber">
                        FEATURED
                      </div>
                    )}
                  </div>
                  
                  {promo.expires && (
                    <div className="absolute left-4 bottom-4 bg-black/50 backdrop-blur-sm py-1 px-3 rounded-full flex items-center text-xs">
                      <span className="text-neon-pink mr-2">ENDS IN:</span>
                      <div className="flex gap-1">
                        {getTimeRemaining(promo.expires)?.days && (
                          <span>{getTimeRemaining(promo.expires)?.days}d</span>
                        )}
                        {getTimeRemaining(promo.expires)?.hours && (
                          <span>{getTimeRemaining(promo.expires)?.hours}h</span>
                        )}
                        {getTimeRemaining(promo.expires)?.mins && (
                          <span>{getTimeRemaining(promo.expires)?.mins}m</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan bg-opacity-20">
                      <promo.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="font-cyber text-2xl">{promo.title}</CardTitle>
                      <CardDescription>{promo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <HoverCard>
                    <HoverCardTrigger>
                      <p className="text-sm text-muted-foreground cursor-help underline underline-offset-4">
                        View promotion terms
                      </p>
                    </HoverCardTrigger>
                    <HoverCardContent className="cyber-card backdrop-blur-lg border-neon-purple/30 w-80">
                      <p className="text-sm">{promo.details}</p>
                      {promo.expires && (
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">Expires: </span>
                          <span className="font-medium">{new Date(promo.expires).toLocaleDateString()}</span>
                        </p>
                      )}
                    </HoverCardContent>
                  </HoverCard>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handleClaimPromotion(promo.id)}
                    className="btn-cyber w-full group relative overflow-hidden"
                  >
                    <span className="relative z-10">Claim Now</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Join VIP section */}
          <div className="mt-16 relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src="/lovable-uploads/8ff540ec-66f0-43d7-a91d-203b8db82d8a.png" 
                alt="VIP Lounge" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20"></div>
            </div>
            <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-10 text-center md:text-left">
                <h3 className="font-cyber text-3xl mb-4 text-neon-purple">Join Our VIP Program</h3>
                <p className="text-white/80 max-w-md mb-6">
                  Unlock exclusive bonuses, personal account managers, and priority withdrawals 
                  when you join our elite VIP program. The more you play, the more you earn.
                </p>
                <Button 
                  variant="outline" 
                  className="btn-cyber bg-transparent border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                >
                  Learn More
                </Button>
              </div>
              <div className="w-full md:w-1/3 p-6 cyber-card backdrop-blur-lg border-neon-purple/30">
                <div className="text-center">
                  <h4 className="font-cyber text-xl mb-4">VIP Tiers</h4>
                  <ul className="space-y-3 text-left">
                    {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((tier, index) => (
                      <li key={tier} className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full bg-neon-${index > 2 ? 'pink' : 'purple'}`}></div>
                        <span className="font-cyber">{tier}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {index === 0 ? 'Start Here' : `${index * 500} Points`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Promotions;
