
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LoginModalProps {
  trigger?: React.ReactNode;
}

const LoginModal = ({ trigger }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Login successful!');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="btn-cyber">
            Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="cyber-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cyber text-2xl text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan">
              Login to Casinoir
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-neon-purple hover:text-neon-cyan"
                onClick={() => setOpen(false)}
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full btn-cyber"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card text-muted-foreground">or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" className="bg-background/50">
              Google
            </Button>
            <Button variant="outline" type="button" className="bg-background/50">
              Facebook
            </Button>
          </div>
          
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-neon-purple hover:text-neon-cyan"
              onClick={() => setOpen(false)}
            >
              Register
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
