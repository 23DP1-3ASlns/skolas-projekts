import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, GraduationCap, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="w-full mt-24 bg-foreground text-background"
      data-testid="public-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-heading font-black text-lg">Zālītes pamatskola</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed max-w-sm">
              Mēs ticam, ka katrs bērns ir unikāls. Mūsu skola apvieno bagātu mantojumu ar
              mūsdienīgu mācību pieeju, lai sagatavotu skolēnus rītdienas pasaulei.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-secondary">
              Kontakti
            </h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                <span>Skolas iela 1, Zālīte, LV-3995</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-secondary shrink-0" />
                <a href="tel:+37163123456" className="hover:text-secondary transition-colors">
                  +371 6312 3456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-secondary shrink-0" />
                <a
                  href="mailto:info@zalitespamatskola.lv"
                  className="hover:text-secondary transition-colors"
                >
                  info@zalitespamatskola.lv
                </a>
              </li>
            </ul>
          </div>

          {/* Library */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-secondary">
              Bibliotēkas darba laiks
            </h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-secondary shrink-0" />
                <span>Pirmdiena – Piektdiena: 9:00 – 16:00</span>
              </li>
              <li className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-secondary shrink-0" />
                <span>Sestdiena: 10:00 – 13:00</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-secondary shrink-0" />
                <span>Svētdiena: slēgts</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                to="/admin/login"
                data-testid="footer-admin-link"
                className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-background/60 hover:text-secondary transition-colors"
              >
                Administrācija →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-background/50">
          <p>© {new Date().getFullYear()} Zālītes pamatskola. Visas tiesības aizsargātas.</p>
          <p className="flex items-center gap-2">
            Veidots ar mīlestību mūsu skolēniem
          </p>
        </div>
      </div>
    </footer>
  );
}
