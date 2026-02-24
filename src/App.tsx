import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import path from 'path';
import { 
  useApiHeartbeat, 
  ForgotPassword, 
  Homepage, 
  Login, 
  NotFound, 
  ProtectedRoutes, 
  Register,
  VerifyEmail,
  ResetPassword,
  Sonner, 
  Toaster, 
  TooltipProvider } from "./index";

const queryClient = new QueryClient();

const App = () => {
  useApiHeartbeat();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route path="/homepage" element={<Homepage />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
