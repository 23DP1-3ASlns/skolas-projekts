import { useEffect, useState } from "react";
import { BookOpenCheck, Clock } from "lucide-react";
import { api } from "@/lib/api";

const HISTORY_IMG =
  "https://images.unsplash.com/photo-1770134233415-de8146868a24?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzY2hvb2wlMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzc3ODMwMjM5fDA&ixlib=rb-4.1.0&q=85";

export default function History() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get("/pages/history").then(({ data }) => setPage(data));
  }, []);

  return (
    <div data-testid="history-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-secondary font-bold mb-4">
                <BookOpenCheck className="h-4 w-4" /> Mūsu mantojums
              </div>
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
                {page?.title || "Skolas vēsture"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {page?.updated_at &&
                  `Atjaunots: ${new Date(page.updated_at).toLocaleDateString("lv-LV")}`}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border shadow-2xl">
                <img src={HISTORY_IMG} alt="Skolas ēka" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-card border border-border rounded-2xl p-4 shadow-xl">
                <p className="font-heading font-black text-3xl text-secondary leading-none">120+</p>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">
                  gadu mantojums
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="history-content">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {(page?.body || "").split("\n").map((para, i) =>
            para.trim() === "" ? null : (
              <p
                key={i}
                className="text-base sm:text-lg leading-relaxed text-foreground/90 mb-5 whitespace-pre-line"
              >
                {para}
              </p>
            )
          )}
        </div>

        {/* Timeline-like accents */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          {[
            { year: "1900", title: "Dibināšana", desc: "Pirmā skola lauku kopienā" },
            { year: "1985", title: "Paplašināšana", desc: "Jaunā ēka un sporta zāle" },
            { year: "2024", title: "Mūsdienas", desc: "Modernizēta mācību vide" },
          ].map((m) => (
            <div
              key={m.year}
              className="bg-card border border-border rounded-2xl p-6 card-hover"
            >
              <p className="font-heading font-black text-3xl text-primary mb-2">{m.year}</p>
              <p className="font-bold mb-1">{m.title}</p>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
