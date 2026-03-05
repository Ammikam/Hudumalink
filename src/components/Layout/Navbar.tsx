// src/components/Layout/Navbar.tsx - WITH PROFILE MENU
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, Sparkles, Briefcase, User, ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/use-store';
import { cn } from '../../lib/utils';
import {
  SignedIn, SignedOut, SignInButton, UserButton, useAuth,
} from '@clerk/clerk-react';

const designerNavLinks = [
  { href: '/designer/open-projects', label: 'Open Projects' },
  { href: '/designer/invites', label: 'Invites' },
  { href: '/designer/proposals', label: 'My Proposals' },
  { href: '/designer/active-projects', label: 'Active Projects' },
  { href: '/designer/add-inspiration', label: 'Add Inspiration' },
  { href: '/designer/profile', label: 'My Profile' },
  { href: '/designer/earnings', label: 'Earnings & Reviews' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
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

        setIsApprovedDesigner(data.success && data.status === 'approved');
      } catch (err) {
        console.error('Failed to check designer status:', err);
        setIsApprovedDesigner(false);
      }
    };

    checkDesignerStatus();
  }, [isSignedIn, getToken]);

  /** Client nav links (auth-aware) */
  const clientNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/inspiration', label: 'Inspiration' },
    { href: '/designers', label: 'Designers' },
    ...(isSignedIn
      ? [{ href: '/dashboard/client', label: 'Dashboard' }]
      : []),
    { href: '/post-project', label: 'Post Project' },
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
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl lg:text-2xl font-semibold">
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
          <div className="flex items-center gap-4">
            {/* Dark Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden lg:flex"
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </Button>

            {/* Role Switcher/Dropdown */}
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
                          {/* Always show Client View */}
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

                          {/* Designer View or Become a Designer CTA */}
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
              {/* ✅ UserButton with custom menu items including Profile */}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full ring-2 ring-border hover:ring-primary transition-all"
                  }
                }}
              >
                {/* ✅ Add custom Profile menu item */}
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Profile Settings"
                    labelIcon={<User className="w-4 h-4" />}
                    href="/profile"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t mt-2 pt-4 pb-4 space-y-3"
            >
              {currentNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block py-2',
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Role switcher - mobile */}
              <SignedIn>
                <div className="pt-3 mt-3 border-t space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide px-2">
                    Switch View
                  </p>

                  {/* Always show Client View */}
                  <Link
                    to="/dashboard/client"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted',
                      !isDesignerMode && 'bg-muted'
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span>Client View</span>
                  </Link>

                  {/* Designer View or Become a Designer CTA */}
                  {isApprovedDesigner ? (
                    <Link
                      to="/designer/open-projects"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted',
                        isDesignerMode && 'bg-muted'
                      )}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Designer View</span>
                    </Link>
                  ) : (
                    <Link
                      to="/become-designer"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Become a Designer</span>
                    </Link>
                  )}

                  {/* ✅ Profile link for mobile */}
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </Link>
                </div>
              </SignedIn>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}