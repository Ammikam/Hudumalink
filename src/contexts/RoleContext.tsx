import { createContext, useContext, useState, useEffect } from 'react';
import type{ ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface RoleContextType {
  roles: string[];
  hasRole: (role: string) => boolean;
  isDesigner: boolean;
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
  const { userId, isLoaded } = useAuth();
  const [roles, setRoles] = useState<string[]>(['client']);
  const [activeRole, setActiveRole] = useState<'client' | 'designer' | 'admin'>('client');
  const [designerProfile, setDesignerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async () => {
    if (!userId) {
      setRoles(['client']);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`);
      const data = await res.json();

      if (data.success) {
        setRoles(data.user.roles || ['client']);
        setDesignerProfile(data.user.designerProfile);
        
        // Set active role to designer if they have it
        if (data.user.roles.includes('designer')) {
          setActiveRole('designer');
        }
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      setRoles(['client']);
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
  
  const isDesigner = hasRole('designer') && designerProfile?.status === 'active';
  const isClient = hasRole('client');
  const isAdmin = hasRole('admin');

  return (
    <RoleContext.Provider
      value={{
        roles,
        hasRole,
        isDesigner,
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