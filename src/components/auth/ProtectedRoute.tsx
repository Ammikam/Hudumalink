// src/components/auth/ProtectedRoute.tsx
import { useAuth } from '@clerk/clerk-react';
import { RedirectToSignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useRoles } from '@/contexts/RoleContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isBanned, loading } = useRoles();

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) return <RedirectToSignIn />;

  // Banned users only ever see the banned page
  if (isBanned) return <Navigate to="/banned" replace />;

  return <>{children}</>;
}