import { ReactNode } from "react";
import Logo from "../assets/images/logo-elevideo.png";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] bg-cyber-blue pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] bg-deep-violet pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-5 blur-[80px] bg-cyber-blue pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(207 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(207 100% 50%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <img src={Logo} alt="Elevideo Logo" className="mx-auto mb-4" />
        </div>

        {/* Card */}
        <div className="glass-card gradient-border rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
