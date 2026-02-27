import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import icon from "../../public/favicon.ico";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian via-slate-900 to-deep-violet/20 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-800/50 border-r border-cyber-blue/20 backdrop-blur transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${
                !sidebarOpen && "justify-center w-full"
              }`}
            >
              <div>
                <img src={icon} alt="Elevideo Logo" className="w-12 h-12" />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-white font-bold text-sm">Elevideo</p>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            onClick={() => navigate("/admin/proyectos")}
            variant="ghost"
            className={`w-full justify-start gap-3 transition-colors ${
              isActive("proyectos")
                ? "bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <LayoutGrid className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Proyectos</span>}
          </Button>

          {/* <Button
            onClick={() => navigate("/admin/videos")}
            variant="ghost"
            className={`w-full justify-start gap-3 transition-colors ${
              isActive("videos")
                ? "bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Film className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Videos</span>}
          </Button> */}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <Button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/30 text-white font-semibold gap-2"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </Button>
        </div>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-slate-700/50">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="outline"
            className="w-full border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            {sidebarOpen ? "←" : "→"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-800/30 border-b border-slate-700/50 backdrop-blur px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-deep-violet bg-clip-text text-transparent">
            Panel Administrativo
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-blue to-deep-violet flex items-center justify-center text-white font-semibold">
              U
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
