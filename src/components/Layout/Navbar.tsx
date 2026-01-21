import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Sparkles, Briefcase, User, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/use-store';
import { cn } from '../../lib/utils';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const clientNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/inspiration', label: 'Inspiration' },
  { href: '/designers', label: 'Designers' },
  { href: '/post-project', label: 'Post Project' },
];

const designerNavLinks = [
  { href: '/designer/open-projects', label: 'Open Projects' },
  { href: '/designer/invites', label: 'Invites' },
  { href: '/designer/proposals', label: 'My Proposals' },
  { href: '/designer/active-projects', label: 'Active Projects' },
  { href: '/designer/profile', label: 'My Profile' },
  { href: '/designer/earnings', label: 'Earnings & Reviews' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useStore();

  // Detect if we're in designer mode (but NOT /designers which is for browsing)
  const isDesignerMode = location.pathname.startsWith('/designer/');
  const currentNavLinks = isDesignerMode ? designerNavLinks : clientNavLinks;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to={isDesignerMode ? '/designer/open-projects' : '/'} className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl lg:text-2xl font-semibold text-foreground">
                Huduma<span className="text-secondary">link</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {currentNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-300 relative py-2 whitespace-nowrap',
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side - Actions + Profile */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden lg:flex"
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Role Switcher - Only when signed in */}
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
                      <Briefcase className="w-4 h-4" />
                      Designer
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Client
                    </>
                  )}
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    showRoleSwitch && "rotate-180"
                  )} />
                </Button>

                <AnimatePresence>
                  {showRoleSwitch && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowRoleSwitch(false)}
                      />
                      
                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-2 space-y-1">
                          <Link
                            to="/dashboard/client"
                            onClick={() => setShowRoleSwitch(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                              !isDesignerMode
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              !isDesignerMode ? "bg-primary/20" : "bg-muted"
                            )}>
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium">Client View</div>
                              <div className="text-xs text-muted-foreground">
                                Browse & hire designers
                              </div>
                            </div>
                          </Link>

                          <Link
                            to="/designer/open-projects"
                            onClick={() => setShowRoleSwitch(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                              isDesignerMode
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isDesignerMode ? "bg-primary/20" : "bg-muted"
                            )}>
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium">Designer View</div>
                              <div className="text-xs text-muted-foreground">
                                Find projects & clients
                              </div>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </SignedIn>

            {/* Signed Out - Sign In Button */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="hidden lg:flex">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            {/* Signed In - CTA Button based on mode */}
            <SignedIn>
              <div className="hidden lg:flex items-center gap-3">
                {isDesignerMode ? (
                  <Link to="/designer/profile">
                    <Button variant="terracotta" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Link to="/post-project">
                    <Button variant="terracotta" size="sm">
                      Post Project
                    </Button>
                  </Link>
                )}
              </div>
            </SignedIn>

            {/* User Profile — Furthest Right */}
            <SignedIn>
              <div className="hidden lg:block">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-4 ring-cream ring-offset-2 ring-offset-background shadow-medium"
                    }
                  }}
                />
              </div>
            </SignedIn>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-3 border-t border-border">
                {/* Role Switcher - Mobile */}
                <SignedIn>
                  <div className="mb-4 p-3 bg-muted/50 rounded-xl">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Switch View
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/dashboard/client"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg transition-colors",
                          !isDesignerMode
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border border-border"
                        )}
                      >
                        <User className="w-5 h-5" />
                        <span className="text-xs font-medium">Client</span>
                      </Link>
                      <Link
                        to="/designer/open-projects"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg transition-colors",
                          isDesignerMode
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border border-border"
                        )}
                      >
                        <Briefcase className="w-5 h-5" />
                        <span className="text-xs font-medium">Designer</span>
                      </Link>
                    </div>
                  </div>
                </SignedIn>

                {/* Navigation Links */}
                {currentNavLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'block py-2 text-base font-medium transition-colors',
                        location.pathname === link.href
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Auth & Actions */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 space-y-3"
                >
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="w-full" variant="outline">
                        Sign In
                      </Button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    {isDesignerMode ? (
                      <Link to="/designer/profile" onClick={() => setIsOpen(false)}>
                        <Button className="w-full" variant="terracotta">
                          Edit Profile
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/post-project" onClick={() => setIsOpen(false)}>
                        <Button className="w-full" variant="terracotta">
                          Post Project
                        </Button>
                      </Link>
                    )}
                    <div className="flex justify-center pt-4">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="w-full justify-start"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}