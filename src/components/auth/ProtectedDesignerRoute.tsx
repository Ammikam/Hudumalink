import { Navigate, Outlet } from 'react-router-dom';
import { useRoles } from '@/contexts/RoleContext';
import { Layout } from '@/components/Layout/Layout';
import { Loader2 } from 'lucide-react';

export function ProtectedDesignerRoute() {
  const { isDesigner, isSuspendedDesigner, isPendingDesigner, loading } = useRoles();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Suspended designers get their own clear explanation page
  if (isSuspendedDesigner) {
    return <Navigate to="/suspended" replace />;
  }

  // Pending designers see the application-under-review page
  if (isPendingDesigner) {
    return <Navigate to="/designer/application-pending" replace />;
  }

  // Not a designer at all → home
  if (!isDesigner) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}