
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface GameExplanationProps {
  title: string;
  description: string;
  rules: string[];
  imageSrc?: string;
  icon?: React.ReactNode;
}

const GameExplanation = ({ title, description, rules, imageSrc, icon }: GameExplanationProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cyber-card h-full cursor-pointer hover:border-neon-purple/50 transition-all">
      <CardHeader>
        <CardTitle className="flex items-center font-cyber text-xl">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
            <Button variant="ghost" className="w-full mt-2">
              <Info className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="cyber-card sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-cyber text-2xl flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>
        {imageSrc && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <img 
              src={imageSrc} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/50 to-transparent"></div>
          </div>
        )}
        <div className="space-y-4">
          <h4 className="font-cyber text-lg font-semibold">How to Play:</h4>
          <ul className="space-y-3">
          {rules.map((rule, index) => (
            <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-neon-purple/20 text-neon-purple w-6 h-6 text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameExplanation;
