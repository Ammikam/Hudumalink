import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/use-store';
import { formatCurrency } from '../../data/MockData';

export function ActivityFeed() {
  const { activityFeed } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activityFeed.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activityFeed.length]);

  const currentActivity = activityFeed[currentIndex];

  const getIcon = () => {
    switch (currentActivity.type) {
      case 'project_posted':
        return <Sparkles className="w-4 h-4" />;
      case 'designer_hired':
        return <TrendingUp className="w-4 h-4" />;
      case 'project_completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getMessage = () => {
    switch (currentActivity.type) {
      case 'project_posted':
        return (
          <>
            <span className="font-semibold">{currentActivity.clientName}</span> in{' '}
            <span className="font-semibold">{currentActivity.location}</span> just posted a{' '}
            <span className="text-secondary font-semibold">
              {formatCurrency(currentActivity.amount)}
            </span>{' '}
            {currentActivity.projectType} project
          </>
        );
      case 'designer_hired':
        return (
          <>
            <span className="font-semibold">{currentActivity.clientName}</span> in{' '}
            <span className="font-semibold">{currentActivity.location}</span> hired a designer for{' '}
            <span className="text-secondary font-semibold">
              {formatCurrency(currentActivity.amount)}
            </span>
          </>
        );
      case 'project_completed':
        return (
          <>
            <span className="font-semibold">{currentActivity.clientName}</span>'s{' '}
            {currentActivity.projectType} project in{' '}
            <span className="font-semibold">{currentActivity.location}</span> was just completed!
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-full">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {getIcon()}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-foreground"
        >
          {getMessage()}
          <span className="text-muted-foreground ml-2">{currentActivity.timestamp}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
