import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  CalendarClock,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NAV = [
  { to: "/admin", label: "Pārskats", icon: LayoutDashboard, end: true },
  { to: "/admin/jaunumi", label: "Jaunumi", icon: Newspaper },
  { to: "/admin/stundas", label: "Stundu saraksts", icon: CalendarClock },
  { to: "/admin/lapas", label: "Lapu saturs", icon: FileText },
  { to: "/admin/lietotaji", label: "Lietotāji", icon: Users },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Veiksmīgi izrakstīts");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        data-testid="admin-sidebar"
      >
        <div className="h-16 lg:h-20 px-6 flex items-center gap-2.5 border-b border-border">
          <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="font-heading font-black text-sm">Admin panelis</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Zālītes pamatskola
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              data-testid={`admin-nav-${to.replace("/admin", "") || "dashboard"}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "hover:bg-muted text-foreground/80"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/"
            data-testid="admin-back-to-site"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Globe className="h-3.5 w-3.5" /> Skatīt publisko vietni
          </Link>
          <div className="px-3 py-2 rounded-lg bg-muted/50">
            <p className="text-xs font-medium truncate" data-testid="admin-current-user">
              {user?.name || "Admin"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
            data-testid="admin-logout-btn"
          >
            <LogOut className="h-4 w-4" /> Izrakstīties
          </Button>
        </div>
      </aside>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 lg:h-20 bg-card border-b border-border px-4 sm:px-8 flex items-center justify-between">
          <button
            className="lg:hidden p-2 -ml-2 rounded-full hover:bg-muted"
            onClick={() => setOpen(true)}
            data-testid="admin-mobile-toggle"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-lg font-heading font-bold">Sveiki, {user?.name?.split(" ")[0] || "Admin"} 👋</h1>
            <p className="text-xs text-muted-foreground">Pārvaldi savu skolas vietni</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
