import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Building2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Contacts() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get("/pages/contacts").then(({ data }) => setPage(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" data-testid="contacts-page">
      <div className="max-w-2xl mb-16">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
          <Phone className="h-4 w-4" /> Sazinies ar mums
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
          Kontakti
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Mēs esam priecīgi atbildēt uz tavu jautājumu. Izmanto kontaktinformāciju zemāk vai apciemo
          mūs personīgi.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: MapPin,
            title: "Adrese",
            lines: ["Skolas iela 1", "Zālīte, LV-3995", "Latvija"],
            color: "from-primary to-primary/60",
          },
          {
            icon: Phone,
            title: "Tālrunis",
            lines: ["+371 6312 3456", "Direktors: +371 2912 3456"],
            color: "from-secondary to-secondary/60",
          },
          {
            icon: Mail,
            title: "E-pasts",
            lines: ["info@zalitespamatskola.lv", "direktors@zalitespamatskola.lv"],
            color: "from-primary/80 to-secondary",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="card-hover bg-card border border-border rounded-2xl p-7 relative overflow-hidden"
            data-testid={`contact-card-${c.title.toLowerCase()}`}
          >
            <div
              className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`}
            />
            <div
              className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg mb-5`}
            >
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-3">{c.title}</h3>
            <div className="space-y-1">
              {c.lines.map((l) => (
                <p key={l} className="text-sm text-muted-foreground">
                  {l}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Working hours */}
      <div className="grid lg:grid-cols-2 gap-6 mb-16">
        <div className="bg-card border border-border rounded-2xl p-7" data-testid="contact-hours">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-bold text-xl">Skolas darba laiks</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              ["Pirmdiena – Piektdiena", "8:00 – 17:00"],
              ["Sestdiena", "9:00 – 13:00"],
              ["Svētdiena", "Slēgts"],
            ].map(([d, h]) => (
              <li key={d} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground">{d}</span>
                <span className="font-medium">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-secondary" />
            <h3 className="font-heading font-bold text-xl">Bibliotēka</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              ["Pirmdiena – Piektdiena", "9:00 – 16:00"],
              ["Sestdiena", "10:00 – 13:00"],
              ["Svētdiena", "Slēgts"],
            ].map(([d, h]) => (
              <li key={d} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground">{d}</span>
                <span className="font-medium">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="rounded-2xl overflow-hidden border border-border h-80 bg-muted relative">
        <iframe
          title="Skolas atrašanās vieta"
          src="https://www.openstreetmap.org/export/embed.html?bbox=24.1052%2C56.9496%2C24.1052%2C56.9496&layer=mapnik"
          className="w-full h-full"
          loading="lazy"
        />
      </div>

      {/* Editable body content */}
      {page?.body && (
        <div className="mt-16 max-w-3xl">
          <h2 className="font-heading font-bold text-2xl mb-4">Papildu informācija</h2>
          <div className="bg-card border border-border rounded-2xl p-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {page.body}
          </div>
        </div>
      )}
    </div>
  );
}
