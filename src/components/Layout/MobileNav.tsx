import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/inspiration', icon: Compass, label: 'Explore' },
  { href: '/post-project', icon: Plus, label: 'Post', isMain: true },
  { href: '/dashboard/client', icon: MessageCircle, label: 'Chat' },
  { href: '/dashboard/client', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-effect border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-medium -mt-4"
                >
                  <Icon className="w-6 h-6 text-secondary-foreground" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href + item.label}
              to={item.href}
              className="flex flex-col items-center gap-1 py-2 px-3"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
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
