import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../src/pages/Homepage";
import InspirationPage from "./pages/InspirationPage";
import DesignersPage from "../src/pages/DesignerPage";
import DesignerProfilePage from "./pages/DesignerProfilePage";
import PostProjectPage from "./pages/PostProjectPage";
import ClientDashboard from "./pages/ClientDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="/designers" element={<DesignersPage />} />
          <Route path="/designer/:id" element={<DesignerProfilePage />} />
          <Route path="/post-project" element={<PostProjectPage />} />
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="/dashboard/designer" element={<ClientDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
