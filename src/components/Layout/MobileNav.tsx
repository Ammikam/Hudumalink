// src/components/Layout/MobileNav.tsx - COMPLETE VERSION
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Compass, Plus, User, 
  Briefcase, Mail, FileText, DollarSign, LayoutDashboard,
  Menu, X, Settings,  Images 
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

// Client navigation items (bottom bar + drawer)
const clientMainNav = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/inspiration', icon: Compass, label: 'Discover' },
  { href: '/post-project', icon: Plus, label: 'Post', isMain: true },
  { href: '/dashboard/client', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Me' },
];

const clientDrawerLinks = [
  { href: '/designers', label: 'Find Designers', icon: Compass },
  { href: '/dashboard/client', label: 'My Projects', icon: LayoutDashboard },
  { href: '/messages', label: 'Messages', icon: Mail },
  { href: '/profile', label: 'Profile Settings', icon: Settings },
];

// Designer navigation items (bottom bar + drawer)
const designerMainNav = [
  { href: '/designer/open-projects', icon: Compass, label: 'Explore' },
  { href: '/designer/invites', icon: Mail, label: 'Invites' },
  { href: '/designer/add-inspiration', icon: Plus, label: 'Share', isMain: true },
  { href: '/designer/active-projects', icon: Briefcase, label: 'Projects' },
  { href: '/designer/my-inspirations', label: 'My Work' },
  { href: '/designer/profile', icon: User, label: 'Me' },
];

const designerDrawerLinks = [
  { href: '/designer/open-projects', label: 'Browse Projects', icon: Compass },
  { href: '/designer/invites', label: 'Invites', icon: Mail },
  { href: '/designer/proposals', label: 'My Proposals', icon: FileText },
  { href: '/designer/active-projects', label: 'Active Projects', icon: Briefcase },
  { href: '/designer/earnings', label: 'Earnings & Reviews', icon: DollarSign },
   { href: '/designer/my-inspirations', label: 'My Inspirations', icon: Images },
  { href: '/designer/add-inspiration', label: 'Add Inspiration', icon: Plus },
  { href: '/designer/profile', label: 'My Profile', icon: User },
  { href: '/messages', label: 'Messages', icon: Mail },
];

export function MobileNav() {
  const location = useLocation();
  const { isSignedIn, getToken } = useAuth();
  const [isApprovedDesigner, setIsApprovedDesigner] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Check if user is approved designer
  useEffect(() => {
    const checkDesignerStatus = async () => {
      if (!isSignedIn) return;
      
      try {
        const token = await getToken();
        const res = await fetch('http://localhost:5000/api/users/designer-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsApprovedDesigner(data.success && data.status === 'approved');
      } catch (err) {
        console.error('Failed to check designer status:', err);
      }
    };

    checkDesignerStatus();
  }, [isSignedIn, getToken]);

  // Close drawer when route changes
  useEffect(() => {
    setShowDrawer(false);
  }, [location.pathname]);

  // Determine which nav to show based on current path
  const isDesignerMode = location.pathname.startsWith('/designer/');
  const mainNavItems = isDesignerMode ? designerMainNav : clientMainNav;
  const drawerLinks = isDesignerMode ? designerDrawerLinks : clientDrawerLinks;

  // Don't show mobile nav on certain pages
  const hiddenPaths = ['/sign-in', '/sign-up'];
  if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-effect border-t border-border pb-safe">
        <div className="flex items-center justify-around py-2 px-2">
          {mainNavItems.map((item, index) => {
            const isActive = 
              location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            const Icon = item.icon;

            // Main action button (elevated center button)
            if (item.isMain) {
              return (
                <Link key={item.href} to={item.href} className="relative flex-1 flex justify-center">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 flex items-center justify-center shadow-strong ring-4 ring-background hover:shadow-glow transition-all">
                     {Icon && <Icon className="w-8 h-8 text-primary-foreground" />}
                    </div>
                  </motion.div>
                  {/* Spacer */}
                  <div className="w-16 h-4" />
                </Link>
              );
            }

            // Menu button (last item)
            if (index === mainNavItems.length - 1) {
              return (
                <button
                  key="menu"
                  onClick={() => setShowDrawer(!showDrawer)}
                  className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px]"
                >
                  <div className="relative">
                    <Menu
                      className={cn(
                        'w-6 h-6 transition-all duration-300',
                        showDrawer 
                          ? 'text-primary scale-110' 
                          : 'text-muted-foreground'
                      )}
                    />
                    {showDrawer && (
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
                      showDrawer ? 'text-primary font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    Menu
                  </span>
                </button>
              );
            }

            // Regular nav items
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px]"
              >
                <div className="relative">
                  {Icon &&<Icon
                    className={cn(
                      'w-6 h-6 transition-all duration-300',
                      isActive 
                        ? 'text-primary scale-110' 
                        : 'text-muted-foreground'
                    )}
                  />}
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
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Drawer Menu */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto pb-safe lg:hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {isDesignerMode ? 'Designer Menu' : 'Menu'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isDesignerMode ? 'Manage your design business' : 'Navigate your projects'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-2">
                {drawerLinks.map((link) => {
                  const isActive = location.pathname === link.href || 
                    (link.href !== '/' && location.pathname.startsWith(link.href));
                  const Icon = link.icon;
                  

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all',
                        isActive 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                      <span className="flex-1">{link.label}</span>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Role Switcher */}
              {isSignedIn && isApprovedDesigner && (
                <div className="p-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 px-4">
                    Switch View
                  </p>
                  <div className="space-y-2">
                    <Link
                      to="/dashboard/client"
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                        !isDesignerMode 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'hover:bg-muted'
                      )}
                    >
                      <User className="w-5 h-5" />
                      <span>Client View</span>
                    </Link>
                    <Link
                      to="/designer/open-projects"
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                        isDesignerMode 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'hover:bg-muted'
                      )}
                    >
                      <Briefcase className="w-5 h-5" />
                      <span>Designer View</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Become Designer CTA */}
              {isSignedIn && !isApprovedDesigner && !isDesignerMode && (
                <div className="p-4 border-t">
                  <Link
                    to="/become-designer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>Become a Designer</span>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}