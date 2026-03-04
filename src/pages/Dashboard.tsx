import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, Film, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import icon from "../../public/favicon.ico";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-obsidian via-slate-900 to-deep-violet/20 flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarOpen ? "w-64" : "lg:w-20 w-64"} fixed inset-y-0 left-0 lg:left-auto lg:inset-y-auto lg:sticky lg:top-0 z-50 h-screen bg-slate-800/50 border-r border-cyber-blue/20 backdrop-blur transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="p-4 lg:p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${
                !sidebarOpen && "lg:justify-center lg:w-full"
              }`}
            >
              <div>
                <img src={icon} alt="Elevideo Logo" className="w-10 h-10 lg:w-12 lg:h-12" />
              </div>
              {(sidebarOpen || window.innerWidth >= 1024) && (
                <div className={sidebarOpen ? "block" : "hidden lg:hidden"}>
                  <p className="text-white font-bold text-sm">Elevideo</p>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
              )}
            </div>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
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
            <span className={sidebarOpen ? "block" : "hidden lg:hidden"}>Proyectos</span>
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
            <span className={sidebarOpen ? "block" : "hidden lg:hidden"}>Cerrar sesión</span>
          </Button>
        </div>

        {/* Toggle Sidebar - Desktop only */}
        <div className="hidden lg:block p-4 border-t border-slate-700/50">
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
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Top Bar */}
        <div className="bg-slate-800/30 border-b border-slate-700/50 backdrop-blur px-4 lg:px-8 py-3 lg:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-cyber-blue to-deep-violet bg-clip-text text-transparent">
              Panel Administrativo
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-cyber-blue to-deep-violet flex items-center justify-center text-white text-sm lg:text-base font-semibold">
              U
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
