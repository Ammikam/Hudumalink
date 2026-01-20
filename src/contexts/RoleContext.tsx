import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface RoleContextType {
  roles: string[];
  hasRole: (role: string) => boolean;
  isDesigner: boolean;
  isPendingDesigner: boolean;
  isApprovedDesigner: boolean;
  isClient: boolean;
  isAdmin: boolean;
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
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async () => {
    if (!userId) {
      setRoles(['client']);
      setDesignerProfile(null);
      setLoading(false);
      return;
    }

    try {
      // Get auth token for authenticated requests
      const token = await getToken();
      
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await res.json();
      console.log('Fetched user data:', data); // Debug log

      if (data.success && data.user) {
        const userRoles = data.user.roles || ['client'];
        const profile = data.user.designerProfile || null;
        
        setRoles(userRoles);
        setDesignerProfile(profile);
        
        console.log('User roles:', userRoles); // Debug log
        console.log('Designer profile:', profile); // Debug log
        
        // Set active role intelligently
        if (userRoles.includes('admin')) {
          setActiveRole('admin');
        } else if (userRoles.includes('designer') && profile?.status === 'approved') {
          setActiveRole('designer');
        } else {
          setActiveRole('client');
        }
      } else {
        // Fallback to client if no user data
        setRoles(['client']);
        setDesignerProfile(null);
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
  
  // Check if user has designer role AND is approved
  const isApprovedDesigner = hasRole('designer') && designerProfile?.status === 'approved';
  
  // Check if user has designer role AND is pending
  const isPendingDesigner = hasRole('designer') && designerProfile?.status === 'pending';
  
  // isDesigner is true if they're approved (for backwards compatibility)
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
        isClient,
        isAdmin,
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

export const useRoles = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRoles must be used within RoleProvider');
  return context;
};