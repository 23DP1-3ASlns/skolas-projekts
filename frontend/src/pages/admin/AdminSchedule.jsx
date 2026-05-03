import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const DAYS = ["Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena"];

const empty = {
  group: "",
  subject: "",
  teacher: "",
  day: "Pirmdiena",
  start_time: "08:30",
  end_time: "09:15",
  room: "",
};

export default function AdminSchedule() {
  const [entries, setEntries] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [filterGroup, setFilterGroup] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [s, c] = await Promise.all([api.get("/schedule"), api.get("/schedule/conflicts")]);
    setEntries(s.data);
    setConflicts(c.data);
  };

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => Array.from(new Set(entries.map((e) => e.group))).sort(), [entries]);

  const filtered = useMemo(
    () => (filterGroup === "all" ? entries : entries.filter((e) => e.group === filterGroup)),
    [entries, filterGroup]
  );

  const conflictSet = useMemo(() => new Set(conflicts), [conflicts]);

  const openNew = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (e) => {
    setEditingId(e.id);
    setForm({
      group: e.group,
      subject: e.subject,
      teacher: e.teacher,
      day: e.day,
      start_time: e.start_time,
      end_time: e.end_time,
      room: e.room || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.start_time >= form.end_time) {
      toast.error("Beigu laikam jābūt pēc sākuma laika");
      return;
    }
    setSaving(true);
    try {
      const res = editingId
        ? await api.put(`/schedule/${editingId}`, form)
        : await api.post("/schedule", form);
      const conflictsResp = res.data.conflicts || [];
      if (conflictsResp.length > 0) {
        toast.warning(
          `Uzmanību: konflikts ar ${conflictsResp.length} stundu(ām). Tās izceltas sarakstā.`
        );
      } else {
        toast.success(editingId ? "Stunda atjaunināta" : "Stunda pievienota");
      }
      setOpen(false);
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Saglabāšana neizdevās");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/schedule/${confirmDelete.id}`);
      toast.success("Stunda dzēsta");
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Dzēšana neizdevās");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-schedule-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl tracking-tight">Stundu saraksts</h1>
          <p className="text-muted-foreground text-sm">
            Pārvaldi stundas un automātiski pamani konfliktus.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="rounded-full h-11 px-5 active:scale-95 transition-transform"
          data-testid="schedule-create-btn"
        >
          <Plus className="h-4 w-4 mr-2" /> Pievienot stundu
        </Button>
      </div>

      {conflicts.length > 0 && (
        <div
          className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-start gap-3"
          data-testid="schedule-conflict-banner"
        >
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive text-sm">
              {conflicts.length} stundas ir konfliktā
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Konflikti rodas, ja viens skolotājs vai klase vienlaikus pārklājas. Konfliktīgās rindas ir izceltas zemāk.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
          Filtrēt pēc klases
        </Label>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-48" data-testid="schedule-filter-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visas klases</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarClock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="schedule-empty">
              Vēl nav pievienotu stundu.
            </p>
          </div>
        ) : (
          <Table data-testid="schedule-table">
            <TableHeader>
              <TableRow>
                <TableHead>Klase</TableHead>
                <TableHead>Diena</TableHead>
                <TableHead>Laiks</TableHead>
                <TableHead>Priekšmets</TableHead>
                <TableHead>Skolotājs</TableHead>
                <TableHead>Telpa</TableHead>
                <TableHead className="text-right">Darbības</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow
                  key={e.id}
                  className={conflictSet.has(e.id) ? "conflict-row" : undefined}
                  data-testid={`schedule-row-${e.id}`}
                  data-conflict={conflictSet.has(e.id) ? "true" : "false"}
                >
                  <TableCell className="font-bold">{e.group}</TableCell>
                  <TableCell>{e.day}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {e.start_time} – {e.end_time}
                  </TableCell>
                  <TableCell>{e.subject}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {conflictSet.has(e.id) && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    {e.teacher}
                  </TableCell>
                  <TableCell>{e.room || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(e)}
                      data-testid={`schedule-edit-${e.id}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(e)}
                      data-testid={`schedule-delete-${e.id}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Rediģēt stundu" : "Jauna stunda"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="schedule-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group">Klase</Label>
                <Input
                  id="group"
                  required
                  value={form.group}
                  onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                  placeholder="5.a"
                  data-testid="schedule-group-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="day">Diena</Label>
                <Select
                  value={form.day}
                  onValueChange={(v) => setForm((f) => ({ ...f, day: v }))}
                >
                  <SelectTrigger id="day" data-testid="schedule-day-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Priekšmets</Label>
              <Input
                id="subject"
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Matemātika"
                data-testid="schedule-subject-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Skolotājs</Label>
              <Input
                id="teacher"
                required
                value={form.teacher}
                onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                placeholder="Anna Bērziņa"
                data-testid="schedule-teacher-input"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Sākums</Label>
                <Input
                  id="start"
                  type="time"
                  required
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  data-testid="schedule-start-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Beigas</Label>
                <Input
                  id="end"
                  type="time"
                  required
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  data-testid="schedule-end-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Telpa</Label>
                <Input
                  id="room"
                  value={form.room}
                  onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                  placeholder="204"
                  data-testid="schedule-room-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-full"
              >
                Atcelt
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full"
                data-testid="schedule-submit-btn"
              >
                {saving ? "Saglabā..." : editingId ? "Saglabāt" : "Pievienot"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dzēst stundu?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.subject} ({confirmDelete?.group}, {confirmDelete?.day})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="schedule-delete-cancel">Atcelt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-testid="schedule-delete-confirm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Dzēst
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
