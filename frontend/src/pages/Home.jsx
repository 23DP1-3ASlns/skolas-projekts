import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, BookOpenCheck, CalendarClock, Heart, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const HERO_IMG =
  "https://images.unsplash.com/photo-1769430886896-dc30842be5a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBzY2hvb2wlMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzc3ODMwMjM5fDA&ixlib=rb-4.1.0&q=85";
const ABOUT_IMG =
  "https://images.unsplash.com/photo-1758270705639-9727f350f026?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHxoYXBweSUyMGRpdmVyc2UlMjBzdHVkZW50cyUyMG1vZGVybiUyMGNsYXNzcm9vbXxlbnwwfHx8fDE3Nzc4MzAyNDB8MA&ixlib=rb-4.1.0&q=85";

const QUICK_LINKS = [
  {
    to: "/jaunumi",
    title: "Jaunumi",
    desc: "Sekot līdzi jaunākajām aktualitātēm un pasākumiem mūsu skolā.",
    icon: Newspaper,
    color: "from-primary to-primary/60",
  },
  {
    to: "/stundas",
    title: "Stundu saraksts",
    desc: "Apskatīt stundu sarakstu pa klasēm un dienām.",
    icon: CalendarClock,
    color: "from-secondary to-secondary/60",
  },
  {
    to: "/vesture",
    title: "Vēsture",
    desc: "Iepazīsti mūsu skolas bagāto vēsturi un tradīcijas.",
    icon: BookOpenCheck,
    color: "from-primary/80 to-secondary",
  },
  {
    to: "/skoleniem",
    title: "Skolēniem",
    desc: "Noderīga informācija skolēniem un viņu vecākiem.",
    icon: Heart,
    color: "from-secondary/80 to-primary",
  },
];

export default function Home() {
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    api.get("/news").then(({ data }) => setLatestNews(data.slice(0, 3))).catch(() => setLatestNews([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden" data-testid="home-hero">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Skola" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-xs uppercase tracking-[0.2em] mb-6 border border-white/20 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" /> Mācies. Aug. Sapņo.
            </div>
            <h1
              className="text-white font-heading font-black text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[1.05] mb-6 animate-fade-in-up"
              data-testid="hero-title"
            >
              Zālītes <br />
              <span className="bg-gradient-to-r from-secondary via-secondary to-white bg-clip-text text-transparent">
                pamatskola
              </span>
            </h1>
            <p
              className="text-white/85 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              Vieta, kur sākas atklājumi, draudzība un ceļš uz nākotni. Pievienojies mūsu mācību kopienai, kur katrs skolēns ir vērtīgs.
            </p>
            <div
              className="flex flex-wrap items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-7 h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 active:scale-95 transition-all"
                data-testid="hero-cta-news"
              >
                <Link to="/jaunumi">
                  Apskatīt jaunumus <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 text-base font-semibold bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-foreground active:scale-95 transition-all"
                data-testid="hero-cta-schedule"
              >
                <Link to="/stundas">Stundu saraksts</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex gap-8 px-8 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white">
          {[
            { n: "120+", l: "gadu vēsture" },
            { n: "320", l: "skolēni" },
            { n: "28", l: "skolotāji" },
            { n: "15", l: "interešu pulciņi" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-heading font-black text-2xl">{s.n}</div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" data-testid="home-intro">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
              Par mums
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6">
              Mācīšanās caur <span className="text-primary">ziņkārību</span>,
              <br />
              augšana caur <span className="text-secondary">kopā darīšanu</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-4">
              Zālītes pamatskola ir vairāk nekā tikai mācību iestāde — tā ir kopiena, kur katrs skolēns var atklāt savas spējas un sapņot lielus sapņus. Mēs apvienojam tradicionālas vērtības ar mūsdienīgu pieeju mācībām.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Mūsu pedagogi ir aizrautīgi savā darbā, bibliotēka piepildīta ar grāmatām, sporta zāle vienmēr atvērta enerģijas izlādei, un klases — vietas, kur dzimst draudzības uz mūžu.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Bibliotēka", "Sporta klubs", "Interešu pulciņi", "Mākslas studija"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-muted text-sm font-medium border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-2xl">
              <img src={ABOUT_IMG} alt="Skolēni klasē" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-5 shadow-xl max-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-5 w-5 text-secondary" />
                <span className="font-heading font-bold text-sm">Mūsu solījums</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Katrs skolēns saņems individuālu uzmanību un atbalstu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" data-testid="home-quicklinks">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-secondary font-bold mb-3">
              Ātrās saites
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight">
              Iepazīsti mūsu skolu
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              data-testid={`quicklink-${q.to.replace("/", "")}`}
              className="card-hover group block bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
            >
              <div
                className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${q.color} opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40`}
              />
              <div
                className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${q.color} text-white shadow-lg mb-5`}
              >
                <q.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                {q.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{q.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                Uzzināt vairāk <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest news preview */}
      {latestNews.length > 0 && (
        <section className="bg-muted/40 border-y border-border" data-testid="home-news-preview">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold mb-3">
                  Jaunumi
                </div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight">
                  Jaunākās ziņas
                </h2>
              </div>
              <Link
                to="/jaunumi"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                data-testid="home-news-see-all"
              >
                Visi jaunumi <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map((n) => (
                <Link
                  to="/jaunumi"
                  key={n.id}
                  data-testid={`home-news-${n.id}`}
                  className="card-hover bg-card border border-border rounded-2xl overflow-hidden"
                >
                  {n.image ? (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      {new Date(n.created_at).toLocaleDateString("lv-LV", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="font-heading font-bold text-lg mb-2 line-clamp-2">{n.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
