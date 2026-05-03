import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Lock, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminLogin() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@zalitespamatskola.lv");
  const [password, setPassword] = useState("admin123");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/admin", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.ok) {
      toast.success("Veiksmīga pieteikšanās");
      navigate("/admin");
    } else {
      toast.error(result.error || "Nederīgi piekļuves dati");
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-background">
      {/* Side panel */}
      <aside className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="relative w-full p-16 flex flex-col justify-between text-white">
          <Link to="/" className="inline-flex items-center gap-2 group" data-testid="login-logo">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md group-hover:scale-110 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-heading font-black text-lg">Zālītes pamatskola</span>
          </Link>

          <div>
            <h1 className="font-heading font-black text-5xl tracking-tight leading-[1.05] mb-6">
              Admin <br />
              <span className="text-white/80">panelis</span>
            </h1>
            <p className="text-white/85 text-base leading-relaxed max-w-md mb-8">
              Pārvaldi skolas saturu — jaunumus, stundu sarakstu un lapas vienuviet.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                { n: "Jaunumi", d: "Publicēt aktualitātes" },
                { n: "Stundas", d: "Pārvaldīt sarakstu" },
                { n: "Lapas", d: "Rediģēt saturu" },
                { n: "Lietotāji", d: "Administratori" },
              ].map((f) => (
                <div key={f.n} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
                  <p className="font-bold text-sm">{f.n}</p>
                  <p className="text-xs text-white/70">{f.d}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/60">© Zālītes pamatskola</p>
        </div>
      </aside>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            data-testid="login-back-link"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Atpakaļ uz vietni
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-heading font-black text-lg">Zālītes pamatskola</span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight mb-2">
            Pieslēgšanās
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Ievadi savu administratora e-pastu un paroli, lai turpinātu.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="admin-login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.15em] font-bold">
                E-pasts
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zalitespamatskola.lv"
                  data-testid="login-email-input"
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.15em] font-bold">
                Parole
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  data-testid="login-password-input"
                  className="pl-11 pr-11 h-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="login-toggle-password"
                  aria-label="Rādīt paroli"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl text-base font-semibold active:scale-95 transition-all"
              data-testid="login-submit-btn"
            >
              {submitting ? "Pieslēdzas..." : "Pieslēgties"}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs uppercase tracking-[0.15em] font-bold text-muted-foreground mb-2">
              Demo dati
            </p>
            <p className="text-xs text-muted-foreground">
              E-pasts: <code className="font-mono">admin@zalitespamatskola.lv</code>
              <br />
              Parole: <code className="font-mono">admin123</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
