import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://elevideo.onrender.com/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log(response)
      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "No se pudo procesar la solicitud",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Correo enviado!",
        description: "Revisa tu correo para continuar con la recuperación",
      });

      setSent(true);
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {!sent ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">Recuperar contraseña</h2>
            <p className="text-muted-foreground text-sm">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-cyber text-white font-semibold py-2.5 px-4 rounded-lg glow-button hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-cyber-subtle border border-primary/30 mb-4">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">¡Correo enviado!</h2>
          <p className="text-muted-foreground text-sm mb-2">
            Enviamos un enlace de recuperación a
          </p>
          <p className="text-gradient-cyber font-medium text-sm mb-6">{email}</p>
          <p className="text-muted-foreground text-xs">
            ¿No lo encuentras? Revisa tu carpeta de spam.
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
