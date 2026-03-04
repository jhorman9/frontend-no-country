import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api/user.api";
import { ArrowLeft, Loader2 } from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener datos del usuario
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userApi.getMe(),
  });

  // Estados del formulario de perfil
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  // Estados del formulario de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Cargar datos del usuario en el formulario
  useEffect(() => {
    if (userData?.data) {
      setFormData({
        firstName: userData.data.firstName || "",
        lastName: userData.data.lastName || "",
      });
    }
  }, [userData]);

  // Mutación para actualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: (payload: { firstName: string; lastName: string }) =>
      userApi.updateProfile(payload),
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
    onError: (error: Error) => {
      console.log(error)
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  // Mutación para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(userData?.data?.id || "", payload),
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Contraseña cambiada correctamente",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    },
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(formData);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyber-blue" />
          <p className="text-obsidian">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          <p className="text-white/60">Gestiona tu información personal y contraseña</p>
        </div>
      </div>

      {/* Container */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Información Personal */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Información Personal</CardTitle>
            <CardDescription>Actualiza tu nombre y apellido</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">
                    Nombre
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleProfileChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleProfileChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userData?.data?.email || ""}
                  disabled
                  className="bg-white/10 border-white/20 text-white/60 cursor-not-allowed"
                />
                <p className="text-xs text-white/50">
                  El correo electrónico no puede ser modificado
                </p>
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/50"
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Seguridad</CardTitle>
            <CardDescription>Cambia tu contraseña regularmente para mantener tu cuenta segura</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cambiar Contraseña
              </Button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white">
                    Contraseña Actual
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">
                    Nueva Contraseña
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-white/50">Mínimo 8 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirmar Nueva Contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="bg-gradient-to-r from-cyber-blue to-deep-violet hover:shadow-lg hover:shadow-cyber-blue/50"
                  >
                    {changePasswordMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Cambiar Contraseña
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
