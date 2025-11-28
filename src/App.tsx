import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { EditalProvider } from "@/contexts/EditalContext";
import { ProcessingProvider } from "@/contexts/ProcessingContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EditalEditor from "./pages/EditalEditor";
import RecoverPassword from "./pages/RecoverPassword";
import NewPassword from "./pages/NewPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <EditalProvider>
          <ProcessingProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename="/app">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/recover-password" element={<RecoverPassword />} />
                <Route path="/new-password" element={<NewPassword />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/editais/:id" 
                  element={
                    <ProtectedRoute>
                      <EditalEditor />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProcessingProvider>
        </EditalProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
