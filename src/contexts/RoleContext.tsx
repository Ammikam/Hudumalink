import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleContextType {
  roles: string[];
  hasRole: (role: string) => boolean;
  isDesigner: boolean;
  isPendingDesigner: boolean;
  isApprovedDesigner: boolean;
  isSuspendedDesigner: boolean;
  isClient: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  banReason: string | null;
  suspendReason: string | null;
  activeRole: 'client' | 'designer' | 'admin';
  setActiveRole: (role: 'client' | 'designer' | 'admin') => void;
  designerProfile: any;
  loading: boolean;
  refreshRoles: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { userId, isLoaded, getToken } = useAuth();
  const [roles, setRoles] = useState<string[]>(['client']);
  const [activeRole, setActiveRole] = useState<'client' | 'designer' | 'admin'>('client');
  const [designerProfile, setDesignerProfile] = useState<any>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async () => {
    if (!userId) {
      setRoles(['client']);
      setDesignerProfile(null);
      setIsBanned(false);
      setBanReason(null);
      setSuspendReason(null);
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('https://hudumalink-backend.onrender.com/api/users/designer-status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        const data = await res.json();
        if (data.banned) {
          setIsBanned(true);
          setBanReason(data.reason || null);
          setLoading(false);
          return;
        }
      }

      if (!res.ok) throw new Error('Failed to fetch status');

      const data = await res.json();

      setIsBanned(false);
      setBanReason(null);

      if (data.success && data.status === 'approved') {
        setRoles(['client', 'designer']);
        setDesignerProfile({ status: 'approved' });
        setSuspendReason(null);
        setActiveRole('designer');
      } else if (data.success && data.status === 'pending') {
        setRoles(['client', 'designer']);
        setDesignerProfile({ status: 'pending' });
        setSuspendReason(null);
        setActiveRole('client');
      } else if (data.success && data.status === 'suspended') {
        setRoles(['client', 'designer']);
        setDesignerProfile({ status: 'suspended' });
        setSuspendReason(data.reason || null);
        setActiveRole('client');
      } else {
        setRoles(['client']);
        setDesignerProfile(null);
        setSuspendReason(null);
        setActiveRole('client');
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      setRoles(['client']);
      setDesignerProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchUserRoles();
    }
  }, [userId, isLoaded]);

  const hasRole = (role: string) => roles.includes(role);

  const isApprovedDesigner = hasRole('designer') && designerProfile?.status === 'approved';
  const isPendingDesigner = hasRole('designer') && designerProfile?.status === 'pending';
  const isSuspendedDesigner = hasRole('designer') && designerProfile?.status === 'suspended';
  const isDesigner = isApprovedDesigner;
  const isClient = hasRole('client');
  const isAdmin = hasRole('admin');

  return (
    <RoleContext.Provider
      value={{
        roles,
        hasRole,
        isDesigner,
        isPendingDesigner,
        isApprovedDesigner,
        isSuspendedDesigner,
        isClient,
        isAdmin,
        isBanned,
        banReason,
        suspendReason,
        activeRole,
        setActiveRole,
        designerProfile,
        loading,
        refreshRoles: fetchUserRoles,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

// ─── BanGate ──────────────────────────────────────────────────────────────────
// Wraps the entire app. If the user is banned, redirect to /banned from
// ANY page — including public routes like / that ProtectedRoute never touches.
export function BanGate({ children }: { children: ReactNode }) {
  const { isBanned, loading } = useRoles();
  const location = useLocation();

  // Don't redirect if already on /banned or /sign-in (prevent loops)
  const exemptPaths = ['/banned', '/sign-in', '/sign-up'];
  const isExempt = exemptPaths.some(p => location.pathname.startsWith(p));

  if (!loading && isBanned && !isExempt) {
    return <Navigate to="/banned" replace />;
  }

  return <>{children}</>;
}

export const useRoles = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRoles must be used within RoleProvider');
  return context;
};