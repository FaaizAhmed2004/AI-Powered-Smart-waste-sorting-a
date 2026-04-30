import { NavLink } from "@/components/NavLink";
import { Home, ScanLine, History, MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, isAuthenticated } from "@/services/auth";
import { useStats } from "@/lib/statsContext";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { totalPoints } = useStats();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <ScanLine className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground leading-tight">AI Smart Waste</h1>
                <p className="text-xs text-muted-foreground">Sorting & Recycling</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Points badge */}
              {isAuthenticated() && user && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 shadow-sm">
                  <span className="text-base">🪙</span>
                  <span className="text-sm font-bold text-amber-600">{totalPoints}</span>
                  <span className="text-xs text-amber-500 hidden sm:inline">pts</span>
                </div>
              )}

              {/* User name */}
              {isAuthenticated() && user && (
                <div className="hidden sm:flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-full px-3 py-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                </div>
              )}

              {isAuthenticated() && user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-primary border-primary/30 hover:bg-primary/5 hover:border-primary font-semibold text-xs"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border shadow-2xl z-50 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-5 items-end h-16 relative">
            <NavLink
              to="/dashboard"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200 py-2 group"
              activeClassName="text-primary font-semibold"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Dashboard</span>
            </NavLink>

            <NavLink
              to="/history"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200 py-2 group"
              activeClassName="text-primary font-semibold"
            >
              <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">History</span>
            </NavLink>

            {/* Center scan button */}
            <div className="flex justify-center">
              <NavLink to="/scan" className="flex flex-col items-center gap-1" activeClassName="">
                <div className="w-16 h-16 -mt-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg border-4 border-background hover:scale-105 transition-transform duration-200">
                  <ScanLine className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs text-primary font-semibold">Scan</span>
              </NavLink>
            </div>

            <NavLink
              to="/location"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200 py-2 group"
              activeClassName="text-primary font-semibold"
            >
              <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Location</span>
            </NavLink>

            <NavLink
              to="/rewards"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200 py-2 group"
              activeClassName="text-primary font-semibold"
            >
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Rewards</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
