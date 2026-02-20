import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Wallet, Ruler, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const tips = [
  {
    type: 'budget',
    message: 'Set a realistic budget before contacting a designer — it speeds up the process.',
    icon: Wallet,
    color: 'text-primary',
  },
  {
    type: 'measurements',
    message: 'Take accurate room measurements and photos before your first consultation.',
    icon: Ruler,
    color: 'text-secondary',
  },
  {
    type: 'vision',
    message: 'Create a Pinterest board or mood inspiration to communicate your style clearly.',
    icon: Lightbulb,
    color: 'text-accent',
  },
  {
    type: 'communication',
    message: 'Be honest about timelines and expectations — great design needs clarity.',
    icon: MessageCircle,
    color: 'text-gold',
  },
];

export function ClientTipsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = tips[currentIndex];
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-soft">
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
        current.type === 'budget' && 'bg-primary/10',
        current.type === 'measurements' && 'bg-secondary/10',
        current.type === 'vision' && 'bg-accent/10',
        current.type === 'communication' && 'bg-gold/10',
      )}>
        <Icon className={cn("w-5 h-5", current.color)} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <p className="text-sm font-medium text-foreground">
            {current.message}
          </p>
          <span className="text-xs text-muted-foreground">
            • Pro Tip
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}