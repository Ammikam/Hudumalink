import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, CheckCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    type: 'project_posted',
    message: 'Someone in Westlands just posted a KSh 1.2M living room project',
    icon: Home,
    color: 'text-primary',
  },
  {
    type: 'designer_hired',
    message: 'A client in Karen hired a designer for a luxury kitchen makeover',
    icon: TrendingUp,
    color: 'text-secondary',
  },
  {
    type: 'project_completed',
    message: 'A modern bedroom project in Kilimani was just completed!',
    icon: CheckCircle,
    color: 'text-accent',
  },
  {
    type: 'new_designer',
    message: 'New designer joined from Mombasa specializing in coastal style',
    icon: Sparkles,
    color: 'text-gold',
  },
];

export function ActivityFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const current = activities[currentIndex];
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-soft">
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
        current.type === 'project_posted' && 'bg-primary/10',
        current.type === 'designer_hired' && 'bg-secondary/10',
        current.type === 'project_completed' && 'bg-accent/10',
        current.type === 'new_designer' && 'bg-gold/10',
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
            • Just now
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}