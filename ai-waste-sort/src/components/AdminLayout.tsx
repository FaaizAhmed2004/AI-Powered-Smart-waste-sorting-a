import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getCurrentAdmin, adminLogout } from "@/services/admin";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();
  const adminTheme = admin?.role === "super_admin"
    ? "from-violet-500 via-fuchsia-500 to-pink-500"
    : "from-sky-500 via-cyan-500 to-emerald-500";

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Admin logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50 text-foreground">
      <header className={`bg-gradient-to-r ${adminTheme} border-b border-border shadow-xl backdrop-blur-md py-6`}>
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-glow border-2 border-white/10">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/80 font-semibold">Admin Console</p>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/75 bg-clip-text text-transparent">
                Secure Admin Portal
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-right sm:text-left p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground font-medium">Signed in as</p>
              <p className="font-bold text-foreground">{admin?.email || "Administrator"}</p>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary font-semibold shadow-sm transition-all duration-200" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
