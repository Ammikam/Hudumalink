// src/components/Layout/Layout.tsx - WITH MOBILE NAV
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <Navbar />
      
      {/* Main content - Add padding bottom for mobile nav */}
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-0">
        {children}
      </main>
      
      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}