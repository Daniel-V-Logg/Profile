
import GameCard from './GameCard';

const FeaturedGames = () => {
  const games = [
    {
      title: 'Baccarat',
      slug: 'baccarat',
      description: 'Classic card game with a cyberpunk twist. Bet on player, banker, or tie.',
      imageSrc: '/images/Baccarat.png',
      playerCount: 342
    },
    {
      title: 'Plinko',
      slug: 'plinko',
      description: 'Drop the ball and watch it cascade through neon pegs for instant rewards.',
      imageSrc: '/images/Plinko.png',
      playerCount: 219
    },
    {
      title: 'Roulette',
      slug: 'roulette',
      description: 'Futuristic spin on the classic casino wheel. Place your bets and test your luck.',
      imageSrc: '/images/Roulette.png',
      playerCount: 185
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-cyber text-3xl md:text-4xl mb-4">
            Featured Games
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Step into our virtual casino floor and choose from our selection of cutting-edge games.
            Each game offers a unique cyberpunk experience with realistic graphics and immersive gameplay.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {games.map((game) => (
            <div key={game.slug} className="transform transition-all hover:scale-[1.02] hover:-translate-y-1">
              <GameCard {...game} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;
