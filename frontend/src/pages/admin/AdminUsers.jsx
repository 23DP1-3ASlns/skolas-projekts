import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldCheck, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const empty = { name: "", email: "", password: "" };

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/users").then(({ data }) => setUsers(data));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Parolei jābūt vismaz 6 simbolu garai");
      return;
    }
    setSaving(true);
    try {
      await api.post("/users", form);
      toast.success("Lietotājs izveidots");
      setOpen(false);
      setForm(empty);
      await load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Izveidošana neizdevās");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/users/${confirmDelete.id}`);
      toast.success("Lietotājs dzēsts");
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Dzēšana neizdevās");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-users-page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl tracking-tight">Lietotāji</h1>
          <p className="text-muted-foreground text-sm">
            Pārvaldi administratoru kontus, kas var pieslēgties admin panelim.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(empty);
            setOpen(true);
          }}
          className="rounded-full h-11 px-5"
          data-testid="user-create-btn"
        >
          <Plus className="h-4 w-4 mr-2" /> Pievienot administratoru
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-list">
        {users.map((u) => {
          const isMe = me?.id === u.id;
          return (
            <div
              key={u.id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col"
              data-testid={`user-card-${u.id}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3" /> {u.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-bold text-primary">
                  <ShieldCheck className="h-3 w-3" /> {u.role}
                </span>
                {isMe ? (
                  <span className="text-xs text-muted-foreground">Tu</span>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(u)}
                    data-testid={`user-delete-${u.id}`}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jauns administrators</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="user-form">
            <div className="space-y-2">
              <Label htmlFor="name">Vārds</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                data-testid="user-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-pasts</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                data-testid="user-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parole</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                data-testid="user-password-input"
              />
              <p className="text-xs text-muted-foreground">Vismaz 6 simboli</p>
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
                data-testid="user-submit-btn"
              >
                {saving ? "Veido..." : "Izveidot"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dzēst lietotāju?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.name} ({confirmDelete?.email}) zaudēs piekļuvi admin panelim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="user-delete-cancel">Atcelt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-testid="user-delete-confirm"
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
