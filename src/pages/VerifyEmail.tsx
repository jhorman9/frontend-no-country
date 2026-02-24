import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Token no encontrado en la URL");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://elevideo.onrender.com/api/v1/auth/verify-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Error al verificar el correo");
          toast({
            title: "Error de verificación",
            description: data.message || "No se pudo verificar el correo",
            variant: "destructive",
          });
          return;
        }

        setVerified(true);
        toast({
          title: "¡Correo verificado!",
          description: "Tu email ha sido verificado exitosamente",
        });

        // Redirigir a login después de 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setError("Error de conexión con el servidor");
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
          variant: "destructive",
        });
        console.error("Verify email error:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {loading && (
          <>
            <div className="flex justify-center">
              <Loader2 size={48} className="text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Verificando correo...
              </h1>
              <p className="text-muted-foreground">
                Por favor espera mientras verificamos tu dirección de correo
              </p>
            </div>
          </>
        )}

        {verified && !loading && (
          <>
            <div className="flex justify-center">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                ¡Correo verificado!
              </h1>
              <p className="text-muted-foreground">
                Tu dirección de correo ha sido verificada exitosamente. 
                Serás redirigido a login en unos momentos.
              </p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full gradient-cyber text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            >
              Ir a iniciar sesión ahora
            </Button>
          </>
        )}

        {error && !loading && (
          <>
            <div className="flex justify-center">
              <XCircle size={48} className="text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Error de verificación
              </h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full gradient-cyber text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            >
              Volver a iniciar sesión
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
