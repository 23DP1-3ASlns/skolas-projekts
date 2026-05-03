import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Clock, MapPin, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

const DAYS = ["Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena"];

export default function Schedule() {
  const [entries, setEntries] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/schedule"), api.get("/schedule/groups")])
      .then(([s, g]) => {
        setEntries(s.data);
        setGroups(g.data);
        if (g.data.length > 0) setSelectedGroup(g.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredByGroup = useMemo(
    () => (selectedGroup ? entries.filter((e) => e.group === selectedGroup) : entries),
    [entries, selectedGroup]
  );

  const byDay = useMemo(() => {
    const map = Object.fromEntries(DAYS.map((d) => [d, []]));
    for (const e of filteredByGroup) {
      if (!map[e.day]) map[e.day] = [];
      map[e.day].push(e);
    }
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.start_time.localeCompare(b.start_time))
    );
    return map;
  }, [filteredByGroup]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" data-testid="schedule-page">
      <div className="flex flex-wrap gap-6 items-end justify-between mb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
            <CalendarClock className="h-4 w-4" /> Stundu saraksts
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4">
            Stundas <span className="text-primary">saraksts</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Izvēlies klasi, lai apskatītu nedēļas stundu sarakstu.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2 block">
            Klase
          </label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger
              className="h-12 rounded-xl bg-card border-border"
              data-testid="schedule-group-select"
            >
              <SelectValue placeholder="Izvēlies klasi" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g} value={g} data-testid={`schedule-group-option-${g}`}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-5 gap-4">
          {DAYS.map((d) => (
            <div key={d} className="bg-card border border-border rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed border-border">
          <CalendarClock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Šobrīd nav publicēts neviens stundu saraksts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="schedule-grid">
          {DAYS.map((day, idx) => (
            <div
              key={day}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
              data-testid={`schedule-day-${day}`}
            >
              <div
                className={`px-5 py-4 border-b border-border ${
                  idx % 2 === 0 ? "bg-primary/10" : "bg-secondary/10"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-0.5">
                  Diena
                </p>
                <h3 className="font-heading font-bold text-lg">{day}</h3>
              </div>
              <div className="p-3 space-y-2 flex-1">
                {byDay[day].length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    Nav stundu
                  </div>
                ) : (
                  byDay[day].map((e) => (
                    <div
                      key={e.id}
                      data-testid={`schedule-entry-${e.id}`}
                      className="border border-border rounded-xl p-3 hover:border-primary/50 hover:bg-muted/40 transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-1.5">
                        <Clock className="h-3 w-3" />
                        {e.start_time} – {e.end_time}
                      </div>
                      <p className="font-bold text-sm leading-tight mb-1.5">{e.subject}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {e.teacher}
                      </div>
                      {e.room && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {e.room}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
