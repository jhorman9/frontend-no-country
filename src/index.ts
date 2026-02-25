import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import Proyectos from "./pages/admin/Proyectos";
import Videos from "./pages/admin/Videos";
import NotFound from "./pages/NotFound";

import { ResetPassword } from "./pages/ResetPassword";


import { useApiHeartbeat } from "./hooks/use-api-heartbeat";
import { ProtectedRoutes } from "./components/ProtectedRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export {
  Toaster,
  Sonner,
  TooltipProvider,
  useApiHeartbeat,
  Login,
  Register,
  ForgotPassword,
  VerifyEmail,
  Homepage,
  Dashboard,
  Proyectos,
  Videos,
  NotFound,
  ProtectedRoutes,
  ResetPassword
}