import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, GraduationCap, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Sākums" },
  { to: "/jaunumi", label: "Jaunumi" },
  { to: "/vesture", label: "Vēsture" },
  { to: "/kontakti", label: "Kontakti" },
];

const MORE_ITEMS = [
  { to: "/skoleniem", label: "Skolēniem" },
  { to: "/skolotajiem", label: "Skolotājiem" },
  { to: "/stundas", label: "Stundas saraksts" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isAuthed = !!user;

  return (
    <header className="sticky top-0 z-50 glass" data-testid="public-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" data-testid="navbar-logo">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-heading font-black text-base sm:text-lg leading-tight tracking-tight">
              Zālītes <span className="text-primary">pamatskola</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                data-testid={`nav-link-${item.to.replace("/", "") || "home"}`}
                className={({ isActive }) =>
                  `nav-link px-4 py-2 rounded-full text-sm font-medium ${
                    isActive ? "" : "text-foreground/80"
                  }`
                }
              >
                {({ isActive }) => (
                  <span data-active={isActive ? "true" : "false"}>{item.label}</span>
                )}
              </NavLink>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger
                data-testid="nav-more-trigger"
                className="nav-link px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 text-foreground/80 outline-none"
              >
                Vairāk <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                {MORE_ITEMS.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link
                      to={item.to}
                      data-testid={`nav-more-${item.to.replace("/", "")}`}
                      className="cursor-pointer w-full"
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthed && (
              <Link
                to="/admin"
                data-testid="nav-admin-panel"
                className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95 transition-all"
              >
                <ShieldCheck className="h-4 w-4" /> Admin panelis
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="lg:hidden p-2 rounded-full hover:bg-muted"
              onClick={() => setOpen((v) => !v)}
              data-testid="navbar-mobile-toggle"
              aria-label="Atvērt izvēlni"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <div
            className="lg:hidden pb-4 animate-slide-down"
            data-testid="navbar-mobile-menu"
          >
            <div className="flex flex-col gap-1 border-t border-border pt-3">
              {[...NAV_ITEMS, ...MORE_ITEMS].map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    data-testid={`mobile-nav-${item.to.replace("/", "") || "home"}`}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {isAuthed && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-nav-admin"
                  className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground"
                >
                  Admin panelis
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
