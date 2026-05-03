import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, CalendarClock, Users, FileText, ArrowRight, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ news: 0, schedule: 0, users: 0, conflicts: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/news"),
      api.get("/schedule"),
      api.get("/users"),
      api.get("/schedule/conflicts"),
    ]).then(([n, s, u, c]) => {
      setStats({
        news: n.data.length,
        schedule: s.data.length,
        users: u.data.length,
        conflicts: c.data.length,
      });
    });
  }, []);

  const cards = [
    {
      to: "/admin/jaunumi",
      label: "Jaunumi",
      desc: "Pārvaldīt ziņas",
      count: stats.news,
      icon: Newspaper,
      color: "from-primary to-primary/60",
      testid: "dash-card-news",
    },
    {
      to: "/admin/stundas",
      label: "Stundas",
      desc: "Stundu saraksts",
      count: stats.schedule,
      icon: CalendarClock,
      color: "from-secondary to-secondary/60",
      testid: "dash-card-schedule",
    },
    {
      to: "/admin/lapas",
      label: "Lapas",
      desc: "Vēsture, info lapas",
      count: 4,
      icon: FileText,
      color: "from-primary/80 to-secondary",
      testid: "dash-card-pages",
    },
    {
      to: "/admin/lietotaji",
      label: "Lietotāji",
      desc: "Administratoru konti",
      count: stats.users,
      icon: Users,
      color: "from-secondary/80 to-primary",
      testid: "dash-card-users",
    },
    {
      to: "/admin/stundas",
      label: "Konflikti",
      desc: "Stundu pārklāšanās",
      count: stats.conflicts,
      icon: AlertTriangle,
      color:
        stats.conflicts > 0
          ? "from-destructive to-destructive/60"
          : "from-primary to-secondary",
      testid: "dash-card-conflicts",
    },
  ];

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      <div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tight mb-2">
          Pārskats
        </h1>
        <p className="text-muted-foreground">
          Pārvaldi skolas vietnes saturu un pārbaudi jaunākās aktualitātes.
        </p>
      </div>

      {stats.conflicts > 0 && (
        <Link
          to="/admin/stundas"
          data-testid="dash-conflict-warning"
          className="block bg-destructive/10 border border-destructive/30 rounded-2xl p-5 hover:bg-destructive/15 transition-colors"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-destructive">
                Atrasti {stats.conflicts} stundu konflikti
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Stundu saraksta sadaļā ir konflikti starp skolotājiem vai klasēm. Spied, lai apskatītu.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-destructive shrink-0 mt-1" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            data-testid={c.testid}
            className="card-hover group bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
          >
            <div
              className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`}
            />
            <div
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md mb-4`}
            >
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">
              {c.desc}
            </p>
            <div className="flex items-end justify-between">
              <h3 className="font-heading font-black text-2xl">{c.label}</h3>
              <p className="font-heading font-black text-3xl text-primary">{c.count}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-7">
          <h3 className="font-heading font-bold text-lg mb-4">Ātrās darbības</h3>
          <div className="space-y-2">
            <Link
              to="/admin/jaunumi"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              data-testid="dash-action-add-news"
            >
              <span className="text-sm font-medium">Pievienot jaunu ziņu</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/admin/stundas"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              data-testid="dash-action-add-schedule"
            >
              <span className="text-sm font-medium">Pievienot jaunu stundu</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/admin/lapas"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              data-testid="dash-action-edit-pages"
            >
              <span className="text-sm font-medium">Rediģēt vēsture lapu</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h3 className="font-heading font-bold text-lg mb-2">Padoms</h3>
            <p className="text-sm text-white/85 leading-relaxed mb-4">
              Pievieno bildes saviem ziņu rakstiem — vizuāls saturs piesaista vairāk uzmanības un palīdz
              skolēniem un vecākiem labāk uztvert informāciju.
            </p>
            <Link
              to="/admin/jaunumi"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-white/15 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/25 transition-colors"
            >
              Doties uz jaunumiem <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
