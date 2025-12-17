
import { useState } from 'react';
import Layout from '@/components/Layout';
import GameCard from '@/components/GameCard';
import GameExplanation from '@/components/GameExplanation';

const Games = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const games = [
    {
      title: 'Baccarat',
      slug: 'baccarat',
      description: 'Classic card game with a cyberpunk twist. Bet on player, banker, or tie.',
      imageSrc: '/images/Baccarat.png',
      playerCount: 342,
      category: 'card',
      rules: [
        'Place your bet on the Player, Banker, or Tie.',
        'Two cards are dealt to both the Player and Banker.',
        'Cards 2-9 are worth their face value, 10s and face cards are worth 0, and Aces are worth 1.',
        'The hand with a total closest to 9 wins.',
        'A third card may be drawn based on specific rules.'
      ]
    },
    {
      title: 'Blackjack',
      slug: 'blackjack',
      description: 'Beat the dealer to 21 without going bust. Hit, stand, double, or split.',
      imageSrc: '/images/Baccarat.png', // Using Baccarat image as placeholder, you can add Blackjack.png later
      playerCount: 428,
      category: 'card',
      rules: [
        'Get a hand value as close to 21 as possible without exceeding it.',
        'Number cards are worth their face value, face cards are worth 10, Aces are worth 1 or 11.',
        'Hit to receive another card, Stand to keep your current hand.',
        'Double to double your bet and receive exactly one more card.',
        'Split pairs into two separate hands when dealt matching cards.'
      ]
    },
    {
      title: 'Plinko',
      slug: 'plinko',
      description: 'Drop the ball and watch it cascade through neon pegs for instant rewards.',
      imageSrc: '/images/Plinko.png',
      playerCount: 219,
      category: 'instant',
      rules: [
        'Choose the number of rows for the peg board (more rows = more volatility).',
        'Select your bet amount and risk level (low, medium, or high).',
        'Drop the ball and watch it bounce through the pegs.',
        'The ball lands in a multiplier slot that determines your payout.',
        'Higher risk levels offer larger potential multipliers.'
      ]
    },
    {
      title: 'Roulette',
      slug: 'roulette',
      description: 'Futuristic spin on the classic casino wheel. Place your bets and test your luck.',
      imageSrc: '/images/Roulette.png',
      playerCount: 185,
      category: 'table',
      rules: [
        'Place your chips on numbers (0-36), colors (red/black), or other betting areas.',
        'Different bet types offer different odds and payouts.',
        'The croupier spins the wheel and releases the ball.',
        'Whichever numbered pocket the ball lands in determines the winning number.',
        'Payouts are made based on the type of bet placed.'
      ]
    },
    {
      title: 'Cyber Slots',
      slug: 'slot',
      description: 'Spin the reels with 20 paylines, wild symbols, and free spin bonuses. Win big!',
      imageSrc: '/images/Slots.png',
      playerCount: 512,
      category: 'instant',
      rules: [
        'Select your bet amount and number of active paylines (up to 20).',
        'Click "Spin" to spin the 5 reels and watch for winning combinations.',
        'Match 3+ identical symbols on any active payline to win.',
        'Wild symbols (⭐) substitute for any symbol to complete winning lines.',
        'Get 3+ Scatter symbols (💎) to trigger Free Spins bonus with enhanced features!'
      ]
    }
  ];
  
  const filteredGames = activeTab === 'all' 
    ? games 
    : games.filter(game => game.category === activeTab);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="font-cyber text-4xl md:text-5xl mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan">
              Our Games
            </span>
          </h1>
          <p className="text-muted-foreground">
            Choose from our selection of immersive cyberpunk-themed casino games.
            Each game offers unique gameplay with realistic graphics and fair algorithms.
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {['all', 'card', 'table', 'instant'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-full text-sm font-cyber uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-neon-purple text-white'
                    : 'bg-background hover:bg-muted border border-border'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' ? 'All Games' : `${tab} Games`}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {filteredGames.map((game) => (
            <div key={game.slug} className="transform transition-all hover:scale-[1.02] hover:-translate-y-1">
              <GameCard {...game} />
            </div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h2 className="font-cyber text-3xl mb-8 text-center">
            How to Play
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameExplanation
                key={game.slug}
                title={game.title}
                description={game.description}
                rules={game.rules}
                imageSrc={game.imageSrc}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Games;
