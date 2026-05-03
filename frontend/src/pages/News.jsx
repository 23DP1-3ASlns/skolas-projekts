import { useEffect, useState } from "react";
import { Newspaper, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function News() {
  const [news, setNews] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/news")
      .then(({ data }) => setNews(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = news.filter(
    (n) =>
      n.title.toLowerCase().includes(q.toLowerCase()) ||
      n.content.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" data-testid="news-page">
      {/* Header */}
      <div className="mb-12 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
          Aktualitātes
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
          Skolas <span className="text-primary">jaunumi</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Visa jaunākā informācija par notikumiem, sasniegumiem un aktualitātēm Zālītes pamatskolā.
        </p>
      </div>

      {/* Search */}
      <div className="mb-10 max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Meklēt ziņas..."
          data-testid="news-search-input"
          className="pl-11 h-12 rounded-full bg-muted/50 border-border focus:bg-background"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed border-border">
          <Newspaper className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground" data-testid="news-empty">
            {q ? "Nav atrastas ziņas pēc šī meklēšanas." : "Šobrīd nav publicētu ziņu."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="news-grid">
          {filtered.map((n) => (
            <article
              key={n.id}
              data-testid={`news-card-${n.id}`}
              className="card-hover bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
            >
              {n.image ? (
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={n.image}
                    alt={n.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Newspaper className="h-14 w-14 text-primary/40" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  {new Date(n.created_at).toLocaleDateString("lv-LV", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 leading-snug">{n.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {n.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
