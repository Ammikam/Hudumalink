import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';

import HomePage from "./pages/Homepage";
import InspirationPage from "./pages/InspirationPage";
import DesignersPage from "./pages/DesignerPage";
import DesignerProfilePage from "./pages/designerpages/DesignerProfilePage";
import PostProjectPage from "./pages/PostProjectPage";
import ClientDashboard from "./pages/ClientDashboard";
import NotFound from "./pages/NotFound";
import SuccessPage from "./pages/SuccessPage";
import DesignerDashboard from "./pages/DesignerDashboard";
import OpenProjectsPage from "@/pages/designerpages/OpenProjectsPage"; 
import InvitesPage from "@/pages/designerpages/InvitesPage";
import ProposalsPage from "@/pages/designerpages/ProposalPage";
import ActiveProjectsPage from "@/pages/designerpages/ActiveProjectsPage";
import EarningsPage from "@/pages/designerpages/EarningsPage";

import { RoleProvider } from '@/contexts/RoleContext';
import { ProtectedDesignerRoute } from '@/components/designers/ProtectedDesignerRoute';

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
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/inspiration" element={<InspirationPage />} />
              <Route path="/designers" element={<DesignersPage />} />
              <Route path="/designer/:id" element={<DesignerProfilePage />} />
              <Route path="/post-project" element={<PostProjectPage />} />
              <Route path="/success" element={<SuccessPage />} />

              {/* Client Dashboard */}
              <Route path="/dashboard/client" element={<ClientDashboard />} />

              {/* Legacy Designer Dashboard (old path) */}
              <Route path="/dashboard/designer" element={<DesignerDashboard />} />

              {/* Protected Designer Routes */}
              <Route element={<ProtectedDesignerRoute />}>
                <Route path="/designer/open-projects" element={<OpenProjectsPage />} />
                <Route path="/designer/invites" element={<InvitesPage />} />
                <Route path="/designer/proposals" element={<ProposalsPage />} />
                <Route path="/designer/active-projects" element={<ActiveProjectsPage />} />
                <Route path="/designer/profile" element={<DesignerProfilePage />} />
               <Route path="/designer/earnings" element={<EarningsPage />} />
             </Route>

              {/* Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;