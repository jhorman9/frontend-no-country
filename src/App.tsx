import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { 
  useApiHeartbeat, 
  ForgotPassword, 
  Homepage,
  Dashboard,
  Proyectos,
  Videos,
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
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoutes />}>
              <Route path="/admin" element={<Dashboard />}>
                <Route path="proyectos" element={<Proyectos />} />
                <Route path="videos" element={<Videos />} />
                <Route index element={<Navigate to="proyectos" replace />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
