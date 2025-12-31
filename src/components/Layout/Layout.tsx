import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { WhatsAppButton } from './WhatsAppButton';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideMobileNav?: boolean;
}

export function Layout({ children, hideFooter = false, hideMobileNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20 pb-16 lg:pb-0">
        {children}
      </main>
      {!hideFooter && <Footer />}
      {!hideMobileNav && <MobileNav />}
      <WhatsAppButton />
      <Toaster/>
    </div>
  );
}
