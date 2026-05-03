import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export default function Students() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get("/pages/students").then(({ data }) => setPage(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" data-testid="students-page">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-6">
        <Sparkles className="h-3.5 w-3.5" /> Mīļiem skolēniem
      </div>
      <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-8">
        {page?.title || "Skolēniem"}
      </h1>
      <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {(page?.body || "").split("\n").map((para, i) =>
            para.trim() === "" ? (
              <div key={i} className="h-3" />
            ) : (
              <p
                key={i}
                className="text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-line"
              >
                {para}
              </p>
            )
          )}
        </div>
        <div className="mt-10 pt-8 border-t border-border flex items-center gap-3">
          <Heart className="h-5 w-5 text-secondary fill-secondary/30" />
          <p className="text-sm text-muted-foreground italic">
            "Katrs sapnis sākas ar pirmo soli — sper to drosmīgi."
          </p>
        </div>
      </div>
    </div>
  );
}
