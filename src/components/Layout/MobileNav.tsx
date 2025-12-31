import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/inspiration', icon: Compass, label: 'Explore' },
  { href: '/post-project', icon: Plus, label: 'Post', isMain: true },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-effect border-t border-border">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.href} to={item.href} className="relative">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2"
                >
                  <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-strong ring-8 ring-background">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl transition-all"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-7 h-7 transition-all duration-300',
                    isActive 
                      ? 'text-primary drop-shadow-glow' 
                      : 'text-muted-foreground'
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute -inset-2 rounded-full bg-primary/10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}