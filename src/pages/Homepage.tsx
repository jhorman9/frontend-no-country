import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Homepage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">¡Autenticación Exitosa!</h1>
          <p className="text-muted-foreground">Te has autenticado correctamente en la aplicación</p>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">UI auth:</span> Tokenizado
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Estado:</span> Conectado
          </p>
        </div>

        <Button
          onClick={handleLogout}
          className="w-full gradient-cyber text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default Homepage;
