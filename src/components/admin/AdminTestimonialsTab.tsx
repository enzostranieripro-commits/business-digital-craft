import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Plus, Trash2, AlertCircle, CheckCircle2, Edit2, X, Check, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  job: string;
  city: string;
  quote: string;
  before: string;
  after: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: "1", name: "Marc D.",   job: "Plombier",      city: "Rodez",    quote: "En 3 semaines, je suis passé de 0 contact en ligne à 10 demandes par semaine.", before: "0 contact/sem.",      after: "10 contacts/sem." },
  { id: "2", name: "Claire L.", job: "Photographe",   city: "Albi",     quote: "Mon nouveau site reflète enfin la qualité de mon travail. Les réservations ont doublé.", before: "4 réservations/mois", after: "9 réservations/mois" },
  { id: "3", name: "Sophie M.", job: "Restauratrice", city: "Millau",   quote: "De invisible sur Google à Top 3 Google Maps en 2 mois.", before: "Invisible", after: "Top 3 Google Maps" },
  { id: "4", name: "Pierre V.", job: "Kiné",          city: "Cahors",   quote: "La prise de RDV en ligne m'a fait gagner un temps fou.", before: "2h/jour au tél.", after: "15 min/jour" },
  { id: "5", name: "Léa B.",    job: "Fleuriste",     city: "Figeac",   quote: "Ma boutique en ligne représente maintenant 30% de mon chiffre d'affaires.", before: "0€ en ligne", after: "30% du CA" },
  { id: "6", name: "Thomas R.", job: "Agent immo",    city: "Montauban",quote: "Le site génère des mandats qualifiés chaque semaine.", before: "2 mandats/mois", after: "7 mandats/mois" },
];

const SETTINGS_KEY = "testimonials";

const EMPTY: Omit<Testimonial, "id"> = { name: "", job: "", city: "", quote: "", before: "", after: "" };

const AdminTestimonialsTab = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Testimonial | null>(null);
  const [adding, setAdding] = useState(false);
  const [newT, setNewT] = useState<Omit<Testimonial, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle() as any;
      if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
        setTestimonials(data.value);
      }
    };
    load();
  }, []);

  const publish = async (data: Testimonial[]) => {
    setSaving(true);
    const { data: existing } = await supabase
      .from("admin_settings").select("id").eq("key", SETTINGS_KEY).maybeSingle();
    if (existing) {
      await supabase.from("admin_settings")
        .update({ value: data as any, updated_at: new Date().toISOString() })
        .eq("key", SETTINGS_KEY);
    } else {
      await supabase.from("admin_settings")
        .insert({ key: SETTINGS_KEY, value: data as any } as any);
    }
    setSynced(true);
    setSaving(false);
    toast.success("Témoignages publiés sur le site ✅");
  };

  const saveEdit = () => {
    if (!editForm) return;
    setTestimonials((prev) => prev.map((t) => (t.id === editForm.id ? editForm : t)));
    setEditingId(null);
    setEditForm(null);
    setSynced(false);
    toast.success("Témoignage modifié (non publié)");
  };

  const deleteT = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    setSynced(false);
  };

  const addT = () => {
    if (!newT.name.trim() || !newT.quote.trim()) {
      toast.error("Nom et citation requis");
      return;
    }
    setTestimonials((prev) => [...prev, { ...newT, id: crypto.randomUUID() }]);
    setNewT(EMPTY);
    setAdding(false);
    setSynced(false);
    toast.success("Témoignage ajouté (non publié)");
  };

  return (
    <div className="space-y-6">
      {/* Sync status */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {synced ? (
            <><CheckCircle2 className="size-4 text-visibility" /><span className="text-sm text-visibility font-medium">Site à jour ✅</span></>
          ) : (
            <><AlertCircle className="size-4 text-conversion" /><span className="text-sm text-conversion font-medium">Modifications non publiées 🟡</span></>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
            <Plus className="size-3.5 mr-1" />{adding ? "Annuler" : "Ajouter un témoignage"}
          </Button>
          {!synced && (
            <Button onClick={() => publish(testimonials)} disabled={saving} size="sm">
              <Save className="size-3.5 mr-1.5" />{saving ? "Publication..." : "Publier les modifications"}
            </Button>
          )}
        </div>
      </div>

      {/* Formulaire ajout */}
      {adding && (
        <div className="card-surface p-6 rounded-xl space-y-4 border border-primary/20">
          <p className="text-sm font-bold text-primary">Nouveau témoignage</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Nom *</Label>
              <Input value={newT.name} onChange={(e) => setNewT({ ...newT, name: e.target.value })} placeholder="Ex: Marc D." className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Métier</Label>
              <Input value={newT.job} onChange={(e) => setNewT({ ...newT, job: e.target.value })} placeholder="Ex: Plombier" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Ville</Label>
              <Input value={newT.city} onChange={(e) => setNewT({ ...newT, city: e.target.value })} placeholder="Ex: Rodez" className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Citation * (sans guillemets)</Label>
            <Textarea value={newT.quote} onChange={(e) => setNewT({ ...newT, quote: e.target.value })} rows={2} placeholder="En 3 semaines, j'ai..." className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Avant</Label>
              <Input value={newT.before} onChange={(e) => setNewT({ ...newT, before: e.target.value })} placeholder="Ex: 0 contact/sem." className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Après</Label>
              <Input value={newT.after} onChange={(e) => setNewT({ ...newT, after: e.target.value })} placeholder="Ex: 10 contacts/sem." className="mt-1" />
            </div>
          </div>
          <Button onClick={addT} className="w-full">
            <Plus className="size-4 mr-2" />Ajouter ce témoignage
          </Button>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {testimonials.map((t) => {
          const isEditing = editingId === t.id;
          const data = isEditing && editForm ? editForm : t;

          return (
            <div key={t.id} className="card-surface rounded-xl p-5">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Nom</Label>
                      <Input value={editForm!.name} onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })} className="h-8 text-sm mt-0.5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Métier</Label>
                      <Input value={editForm!.job} onChange={(e) => setEditForm({ ...editForm!, job: e.target.value })} className="h-8 text-sm mt-0.5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Ville</Label>
                      <Input value={editForm!.city} onChange={(e) => setEditForm({ ...editForm!, city: e.target.value })} className="h-8 text-sm mt-0.5" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Citation</Label>
                    <Textarea value={editForm!.quote} onChange={(e) => setEditForm({ ...editForm!, quote: e.target.value })} rows={2} className="text-sm mt-0.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Avant</Label>
                      <Input value={editForm!.before} onChange={(e) => setEditForm({ ...editForm!, before: e.target.value })} className="h-8 text-sm mt-0.5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Après</Label>
                      <Input value={editForm!.after} onChange={(e) => setEditForm({ ...editForm!, after: e.target.value })} className="h-8 text-sm mt-0.5" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditForm(null); }}>
                      <X className="size-3.5 mr-1" />Annuler
                    </Button>
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="size-3.5 mr-1" />Valider
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="size-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2 line-clamp-2">"{data.quote}"</p>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold">{data.name}</p>
                      <p className="text-xs text-muted-foreground">{data.job}, {data.city}</p>
                      {(data.before || data.after) && (
                        <div className="ml-auto text-right">
                          {data.before && <p className="text-xs text-muted-foreground line-through">{data.before}</p>}
                          {data.after && <p className="text-xs font-semibold text-primary">{data.after}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(t.id); setEditForm({ ...t }); }}>
                      <Edit2 className="size-3.5 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteT(t.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {testimonials.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">
          Aucun témoignage. Ajoutez-en un ci-dessus.
        </p>
      )}
    </div>
  );
};

export default AdminTestimonialsTab;
