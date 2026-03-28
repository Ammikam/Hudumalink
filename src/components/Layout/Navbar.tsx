// src/components/Layout/Navbar.tsx - COMPLETE VERSION
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Sparkles, Briefcase, User, ChevronDown, Plus, Images
} from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/use-store';
import { cn } from '../../lib/utils';
import {
  SignedIn, SignedOut, SignInButton, UserButton, useAuth,
} from '@clerk/clerk-react';

const designerNavLinks = [
  { href: '/designer/open-projects', label: 'Browse Projects' },
  { href: '/designer/invites', label: 'Invites' },
  { href: '/designer/proposals', label: 'Proposals' },
  { href: '/designer/active-projects', label: 'Active Projects' },
  { href: '/designer/my-inspirations', label: 'My Inspirations'},
  { href: '/designer/earnings', label: 'Earnings' },
];

export function Navbar() {
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [isApprovedDesigner, setIsApprovedDesigner] = useState(false);

  const location = useLocation();
  const { isSignedIn, getToken } = useAuth();
  const { isDarkMode, toggleDarkMode } = useStore();

  const isDesignerMode = location.pathname.startsWith('/designer/');

  // Check if user is an approved designer
  useEffect(() => {
    const checkDesignerStatus = async () => {
      if (!isSignedIn) {
        setIsApprovedDesigner(false);
        return;
      }

      try {
        const token = await getToken();
        const res = await fetch('http://localhost:5000/api/users/designer-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('Designer status:', data, 'Token:', token?.slice(0, 20));

        setIsApprovedDesigner(data.success && data.status === 'approved');
      } catch (err) {
        console.error('Failed to check designer status:', err);
        setIsApprovedDesigner(false);
      }
    };

    checkDesignerStatus();
  }, [isSignedIn, getToken]);

  /** Client nav links - now includes Post Project */
  const clientNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/inspiration', label: 'Discover' },
    { href: '/designers', label: 'Find Designers' },
    ...(isSignedIn
      ? [{ href: '/dashboard/client', label: 'Dashboard' }]
      : []),
  ];

  const currentNavLinks = isDesignerMode ? designerNavLinks : clientNavLinks;

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to={
              isDesignerMode
                ? '/designer/open-projects'
                : isSignedIn
                ? '/dashboard/client'
                : '/'
            }
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              {/* Logo Image */}
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src="/logo.jpg" 
                  alt="HudumaLink" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Brand name — always visible, including on mobile */}
              <span className="font-display text-lg lg:text-2xl font-semibold">
                Huduma<span className="text-secondary">link</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {currentNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'relative py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Post Project Button - Desktop (Client mode only) */}
            {!isDesignerMode && (
              <Link to="/post-project" className="hidden lg:block">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Post Project
                </Button>
              </Link>
            )}

            {/* Add Inspiration Button - Desktop (Designer mode only) */}
            {isDesignerMode && (
              <Link to="/designer/add-inspiration" className="hidden lg:block">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Share Work
                </Button>
              </Link>
            )}

            {/* Dark Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden lg:flex"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Role Switcher - Desktop only */}
            <SignedIn>
              <div className="hidden lg:block relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleSwitch(!showRoleSwitch)}
                  className="gap-2"
                >
                  {isDesignerMode ? (
                    <>
                      <Briefcase className="w-4 h-4" /> Designer
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" /> Client
                    </>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      showRoleSwitch && 'rotate-180'
                    )}
                  />
                </Button>

                <AnimatePresence>
                  {showRoleSwitch && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowRoleSwitch(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-background border rounded-xl shadow-xl z-50"
                      >
                        <div className="p-2 space-y-1">
                          {/* Client View */}
                          <Link
                            to="/dashboard/client"
                            onClick={() => setShowRoleSwitch(false)}
                            className={cn(
                              'flex gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors',
                              !isDesignerMode && 'bg-muted'
                            )}
                          >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Client View</span>
                          </Link>

                          {/* Designer View or Become a Designer */}
                          {isApprovedDesigner ? (
                            <Link
                              to="/designer/open-projects"
                              onClick={() => setShowRoleSwitch(false)}
                              className={cn(
                                'flex gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors',
                                isDesignerMode && 'bg-muted'
                              )}
                            >
                              <Briefcase className="w-5 h-5" />
                              <span className="font-medium">Designer View</span>
                            </Link>
                          ) : (
                            <Link
                              to="/become-designer"
                              onClick={() => setShowRoleSwitch(false)}
                              className="flex gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <Briefcase className="w-5 h-5" />
                              <span className="font-medium">Become a Designer</span>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </SignedIn>

            {/* Auth */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {/* UserButton - Desktop only */}
              <div className="hidden lg:block">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full ring-2 ring-border hover:ring-primary transition-all"
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Profile Settings"
                      labelIcon={<User className="w-4 h-4" />}
                      href="/profile"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>
    </header>
  );
}