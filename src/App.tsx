import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import AuthGuard from "@/components/AuthGuard";

// Public pages
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import LandingRedirect from "./pages/LandingRedirect";

// App pages (user)
import AppDashboard from "./pages/app/Dashboard";
import BigFiveTest from "./pages/app/BigFiveTest";
import BigFiveResults from "./pages/app/BigFiveResults";
import DesenhoHumanoTest from "./pages/app/DesenhoHumanoTest";
import DesenhoHumanoResults from "./pages/DesenhoHumanoResults";
import Historico from "./pages/app/Historico";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import UsuarioDetalhe from "./pages/admin/UsuarioDetalhe";
import AmbienteTeste from "./pages/admin/AmbienteTeste";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    let hasUtmParams = false;
    utmParams.forEach(param => {
      if (params.has(param)) {
        params.delete(param);
        hasUtmParams = true;
      }
    });
    
    if (hasUtmParams) {
      const cleanUrl = url.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingRedirect />} />
            <Route path="/auth" element={<Auth />} />

            {/* App Routes (User) */}
            <Route path="/app" element={
              <AuthGuard>
                <AppLayout>
                  <AppDashboard />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/app/big-five" element={
              <AuthGuard>
                <BigFiveTest />
              </AuthGuard>
            } />
            <Route path="/app/big-five/results/:sessionId" element={
              <AuthGuard>
                <AppLayout>
                  <BigFiveResults />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/app/desenho-humano" element={
              <AuthGuard>
                <DesenhoHumanoTest />
              </AuthGuard>
            } />
            <Route path="/app/desenho-humano/results/:id" element={
              <AuthGuard>
                <AppLayout>
                  <DesenhoHumanoResults />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/app/historico" element={
              <AuthGuard>
                <AppLayout>
                  <Historico />
                </AppLayout>
              </AuthGuard>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AuthGuard requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/usuarios" element={
              <AuthGuard requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/usuarios/:userId" element={
              <AuthGuard requiredRole="admin">
                <AdminLayout>
                  <UsuarioDetalhe />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/ambiente-teste" element={
              <AuthGuard requiredRole="admin">
                <AdminLayout>
                  <AmbienteTeste />
                </AdminLayout>
              </AuthGuard>
            } />

            {/* Legacy redirects for backwards compatibility */}
            <Route path="/dashboard" element={<LandingRedirect />} />
            <Route path="/desenho-humano/test" element={
              <AuthGuard>
                <DesenhoHumanoTest />
              </AuthGuard>
            } />
            <Route path="/desenho-humano/results/:id" element={
              <AuthGuard>
                <AppLayout>
                  <DesenhoHumanoResults />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/admin/dashboard" element={
              <AuthGuard requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/user/:userId" element={
              <AuthGuard requiredRole="admin">
                <AdminLayout>
                  <UsuarioDetalhe />
                </AdminLayout>
              </AuthGuard>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
