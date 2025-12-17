
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Promotions', path: '/promotions' },
    { name: 'Support', path: '/support' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-cyber text-sm uppercase tracking-wider transition-colors
                  hover:text-neon-purple ${
                    location.pathname === link.path ? 'text-neon-purple' : 'text-foreground'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="mr-2 btn-cyber text-sm"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" className="btn-cyber text-sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass-panel fixed inset-x-0 top-16 p-4 z-50">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-cyber text-base uppercase py-2 px-4 rounded hover:bg-muted/50 ${
                  location.pathname === link.path ? 'text-neon-purple' : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-border flex flex-col space-y-2">
              <Button
                variant="outline"
                className="w-full btn-cyber"
                asChild
              >
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </Button>
              <Button
                className="w-full btn-cyber"
                asChild
              >
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
