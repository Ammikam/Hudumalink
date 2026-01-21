import { Navigate, Outlet } from 'react-router-dom';
import { useRoles } from '@/contexts/RoleContext';
import { Layout } from '@/components/Layout/Layout';
import { Loader2 } from 'lucide-react';

export function ProtectedDesignerRoute() {
  const { isDesigner, isApprovedDesigner, isPendingDesigner, loading } = useRoles();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isDesigner) {
    return <Navigate to="/" replace />;
  }

  if (isPendingDesigner) {
    return (
      <Layout>
        <div className="container mx-auto py-32 text-center">
          <div className="bg-white rounded-xl shadow p-16 max-w-2xl mx-auto">
            <Loader2 className="w-20 h-20 animate-spin mx-auto text-indigo-600 mb-8" />
            <h2 className="text-3xl font-bold mb-4">Application Under Review</h2>
            <p className="text-lg text-gray-600">
              Your designer application is being reviewed. You'll get access once approved.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Approved → render child routes
  return <Outlet />;
}