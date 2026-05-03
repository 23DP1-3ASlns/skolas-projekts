import { useEffect, useState } from "react";
import { Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const PAGES = [
  { slug: "history", label: "Vēsture" },
  { slug: "students", label: "Skolēniem" },
  { slug: "teachers", label: "Skolotājiem" },
  { slug: "contacts", label: "Kontakti" },
];

function PageEditor({ slug }) {
  const [page, setPage] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/pages/${slug}`)
      .then(({ data }) => setPage({ title: data.title || "", body: data.body || "" }))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/pages/${slug}`, page);
      toast.success("Saturs atjaunināts");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Saglabāšana neizdevās");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-muted/50 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-5" data-testid={`content-editor-${slug}`}>
      <div className="space-y-2">
        <Label htmlFor={`title-${slug}`}>Virsraksts</Label>
        <Input
          id={`title-${slug}`}
          value={page.title}
          onChange={(e) => setPage((p) => ({ ...p, title: e.target.value }))}
          data-testid={`content-title-${slug}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`body-${slug}`}>Saturs</Label>
        <Textarea
          id={`body-${slug}`}
          rows={14}
          value={page.body}
          onChange={(e) => setPage((p) => ({ ...p, body: e.target.value }))}
          className="font-mono text-sm"
          data-testid={`content-body-${slug}`}
        />
        <p className="text-xs text-muted-foreground">
          Tukšas rindas tiek pārvērstas par jaunām rindkopām.
        </p>
      </div>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full"
        data-testid={`content-save-${slug}`}
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Saglabā..." : "Saglabāt izmaiņas"}
      </Button>
    </div>
  );
}

export default function AdminContent() {
  return (
    <div className="space-y-6" data-testid="admin-content-page">
      <div>
        <h1 className="font-heading font-black text-3xl tracking-tight flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" /> Lapu saturs
        </h1>
        <p className="text-muted-foreground text-sm">
          Rediģē tekstu, kas redzams publiskās vietnes informatīvajās lapās.
        </p>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="bg-card border border-border rounded-full p-1 h-auto flex-wrap">
          {PAGES.map((p) => (
            <TabsTrigger
              key={p.slug}
              value={p.slug}
              className="rounded-full px-5 py-2"
              data-testid={`content-tab-${p.slug}`}
            >
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {PAGES.map((p) => (
          <TabsContent key={p.slug} value={p.slug} className="mt-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <PageEditor slug={p.slug} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
