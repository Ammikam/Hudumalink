import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import { RoleProvider, BanGate } from '@/contexts/RoleContext';
import { ProtectedDesignerRoute } from '@/components/auth/ProtectedDesignerRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ScrollToTop } from '@/components/ScrollToTop';

import HomePage from "./pages/Homepage";
import InspirationPage from "./pages/InspirationPage";
import DesignersPage from "./pages/DesignerPage";
import DesignerProfilePage from "./pages/designerpages/DesignerProfilePage";
import PostProjectPage from "./pages/PostProjectPage";
import ClientDashboard from "./pages/ClientDashboard";
import NotFound from "./pages/NotFound";
import SuccessPage from "./pages/SuccessPage";
import OpenProjectsPage from "@/pages/designerpages/OpenProjectsPage";
import InvitesPage from "@/pages/designerpages/InvitesPage";
import ProposalsPage from "@/pages/designerpages/ProposalPage";
import ActiveProjectsPage from "@/pages/designerpages/ActiveProjectsPage";
import EarningsPage from "@/pages/designerpages/EarningsPage";
import ProjectDetailPage from "./pages/ClientProjectDetailPage";
import DesignerProjectDetailPage from "./pages/designerpages/DesignerProjectDetailPage";
import PublicDesignerProfile from "./pages/PublicDesignerProfile";
import BecomeDesignerPage from "./pages/BecomeDesignerPage";
import ApplicationPendingPage from '@/pages/ApplicationPendingPage';
import AddInspirationPage from '@/pages/designerpages/AddInpirationPage';
import ClientProfilePage from "./pages/Clientprofilepage";
import PaymentPage from './pages/PaymentPage';
import MyInspirationsPage from "./pages/designerpages/MyInspirationPage";
import BannedPage from "./pages/BannedPage";
import SuspendedPage from "./pages/SuspendedPage";


const queryClient = new QueryClient();
const publishableKey = "pk_test_aW5maW5pdGUtZ2liYm9uLTcwLmNsZXJrLmFjY291bnRzLmRldiQ";

const App = () => (
  <ClerkProvider publishableKey={publishableKey}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RoleProvider>
          
          <BrowserRouter>
            <ScrollToTop />
            <BanGate>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/inspiration" element={<InspirationPage />} />
              <Route path="/designers" element={<DesignersPage />} />
              <Route path="/designer/:id" element={<DesignerProfilePage />} />
              <Route path="/designers/:id" element={<PublicDesignerProfile />} />
              <Route path="/become-designer" element={<BecomeDesignerPage />} />
              <Route path="/designer/application-pending" element={<ApplicationPendingPage />} />

              {/* Account status pages accessible without full auth so banned/suspended users can see them */}
              <Route path="/banned" element={<BannedPage />} />
              <Route path="/suspended" element={<SuspendedPage />} />

              {/* Protected Client Routes */}
              <Route path="/post-project" element={<ProtectedRoute><PostProjectPage /></ProtectedRoute>} />
              <Route path="/dashboard/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
              <Route path="/payment/:projectId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ClientProfilePage /></ProtectedRoute>} />
              <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />

          

              {/* Protected Designer Routes */}
              <Route element={<ProtectedDesignerRoute />}>
                <Route path="/designer/open-projects" element={<OpenProjectsPage />} />
                <Route path="/designer/invites" element={<InvitesPage />} />
                <Route path="/designer/proposals" element={<ProposalsPage />} />
                <Route path="/designer/active-projects" element={<ActiveProjectsPage />} />
                <Route path="/designer/profile" element={<DesignerProfilePage />} />
                <Route path="/designer/earnings" element={<EarningsPage />} />
                <Route path="/designer/my-inspirations" element={<MyInspirationsPage />} />
                <Route path="/designer/projects/:id" element={<DesignerProjectDetailPage />} />
                <Route path="/designer/add-inspiration" element={<AddInspirationPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </BanGate>
          </BrowserRouter>
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;