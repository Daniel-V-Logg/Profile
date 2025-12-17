
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    'Company': [
      { name: 'About Us', path: '/about' },
      { name: 'Terms', path: '/terms' },
      { name: 'Privacy', path: '/privacy' },
      { name: 'Responsible Gambling', path: '/responsible-gambling' }
    ],
    'Games': [
      { name: 'Baccarat', path: '/games/baccarat' },
      { name: 'Plinko', path: '/games/plinko' },
      { name: 'Roulette', path: '/games/roulette' }
    ],
    'Support': [
      { name: 'FAQ', path: '/support' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Live Chat', path: '/chat' }
    ]
  };
  
  const socialLinks = [
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'Discord', url: 'https://discord.com' },
    { name: 'Instagram', url: 'https://instagram.com' }
  ];
  
  return (
    <footer className="border-t border-border bg-background relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and info */}
          <div className="space-y-4">
            <Logo className="text-2xl" />
            <p className="text-sm text-muted-foreground">
              The future of online gambling with cyberpunk-themed casino games.
              Always gamble responsibly.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-neon-purple transition-colors"
                  aria-label={link.name}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-cyber text-lg">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-neon-purple transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Language selector */}
          <div className="space-y-4">
            <h3 className="font-cyber text-lg">Language</h3>
            <select 
              className="w-full bg-background border border-border rounded-md py-2 px-3"
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="jp">日本語</option>
            </select>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>
              © {currentYear} Casinoir. All rights reserved.
            </p>
            <div>
              <span>18+ | Gamble Responsibly</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
