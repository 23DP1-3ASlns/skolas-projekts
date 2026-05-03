import { useEffect, useState } from "react";
import { Briefcase, Award } from "lucide-react";
import { api } from "@/lib/api";

export default function Teachers() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get("/pages/teachers").then(({ data }) => setPage(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" data-testid="teachers-page">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-[0.2em] font-bold mb-6">
        <Briefcase className="h-3.5 w-3.5" /> Pedagogu sadaļa
      </div>
      <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-8">
        {page?.title || "Skolotājiem"}
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
          <Award className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground italic">
            "Skolotāji atver durvis, bet tev jāieiet pašam." — Ķīniešu sakāmvārds
          </p>
        </div>
      </div>
    </div>
  );
}
