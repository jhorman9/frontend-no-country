import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://elevideo.onrender.com/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error en el registro",
          description: data.message || "No se pudo completar el registro",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Te hemos enviado un correo de verificación. Debes verificar tu correo para poder iniciar sesión.",
      });

      // Redirigir a login después del registro exitoso
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">Crear cuenta</h2>
        <p className="text-muted-foreground text-sm">Únete a la plataforma hoy mismo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-foreground text-sm font-medium">
            Nombre
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Juan José"
            value={form.firstName}
            onChange={handleChange}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-foreground text-sm font-medium">
            Apellido
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Pérez Gómez"
            value={form.lastName}
            onChange={handleChange}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground text-sm font-medium">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@ejemplo.com"
            value={form.email}
            onChange={handleChange}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full gradient-cyber text-white font-semibold py-2.5 px-4 rounded-lg glow-button hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <UserPlus size={18} />
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
