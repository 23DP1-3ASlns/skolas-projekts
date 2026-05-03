import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Newspaper, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const empty = { title: "", content: "", image: null };

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);

  const load = () => api.get("/news").then(({ data }) => setItems(data));

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title, content: item.content, image: item.image || null });
    setOpen(true);
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bilde nedrīkst būt lielāka par 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/news/${editingId}`, form);
        toast.success("Ziņa atjaunināta");
      } else {
        await api.post("/news", form);
        toast.success("Ziņa publicēta");
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
      await api.delete(`/news/${confirmDelete.id}`);
      toast.success("Ziņa dzēsta");
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Dzēšana neizdevās");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-news-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl tracking-tight">Jaunumi</h1>
          <p className="text-muted-foreground text-sm">
            Pārvaldi ziņu rakstus, kas redzami publiskajā vietnē.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="rounded-full h-11 px-5 active:scale-95 transition-transform"
          data-testid="news-create-btn"
        >
          <Plus className="h-4 w-4 mr-2" /> Pievienot ziņu
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl py-16 text-center">
          <Newspaper className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground" data-testid="news-list-empty">
            Vēl nav publicētu ziņu. Spied "Pievienot ziņu", lai sāktu.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="news-list">
          {items.map((n) => (
            <div
              key={n.id}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
              data-testid={`admin-news-${n.id}`}
            >
              {n.image ? (
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(n.created_at).toLocaleDateString("lv-LV")}
                </div>
                <h3 className="font-heading font-bold text-lg mb-2 line-clamp-2">{n.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                  {n.content}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(n)}
                    data-testid={`news-edit-${n.id}`}
                    className="rounded-full"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Rediģēt
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(n)}
                    data-testid={`news-delete-${n.id}`}
                    className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Dzēst
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Rediģēt ziņu" : "Jauna ziņa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="news-form">
            <div className="space-y-2">
              <Label htmlFor="title">Virsraksts</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Piem., Mācību gada svinīgais sākums"
                data-testid="news-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Saturs</Label>
              <Textarea
                id="content"
                required
                rows={6}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Apraksti notikumu, datumus, vietu..."
                data-testid="news-content-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Bilde (neobligāti)</Label>
              {form.image ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={form.image} alt="" className="w-full max-h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: null }))}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    data-testid="news-image-remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                  data-testid="news-image-upload"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Augšupielādēt bildi</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG (līdz 5 MB)</p>
                </button>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />
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
                data-testid="news-submit-btn"
              >
                {saving ? "Saglabā..." : editingId ? "Saglabāt izmaiņas" : "Publicēt"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dzēst ziņu?</AlertDialogTitle>
            <AlertDialogDescription>
              Šī darbība neatgriezeniski dzēsīs ziņu "{confirmDelete?.title}". Vai vēlies turpināt?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="news-delete-cancel">Atcelt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-testid="news-delete-confirm"
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
