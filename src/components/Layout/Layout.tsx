// src/components/Layout/Layout.tsx - COMPLETE WITH FOOTER
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top navigation */}
      <Navbar />
      
      {/* Main content - Add padding bottom for mobile nav, flex-1 to push footer down */}
      <main className="flex-1 pt-16 lg:pt-20 pb-20 lg:pb-0">
        {children}
      </main>
      
      {/* Footer - Hidden on mobile to avoid conflict with bottom nav */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      
      {/* Mobile bottom navigation - Only on mobile */}
      <MobileNav />
    </div>
  );
}