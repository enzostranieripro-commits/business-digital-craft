import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Save, Plus, Trash2, AlertCircle, CheckCircle2, Edit2, X, Check, Image as ImageIcon,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  sector: string;
  image: string;
  result: string;
  offer: string;
  color: string;
  description: string;
}

const OFFER_OPTIONS = [
  { label: "Visibilité", value: "Visibilité", color: "visibility" },
  { label: "Autorité",   value: "Autorité",   color: "authority"  },
  { label: "Conversion", value: "Conversion", color: "conversion" },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: "1", name: "Durand Plomberie",  sector: "Artisan BTP",      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop", result: "+320% de demandes de devis",       offer: "Visibilité", color: "visibility", description: "" },
  { id: "2", name: "Le Petit Comptoir", sector: "Restauration",     image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop", result: "Top 3 Google Maps en 2 mois",      offer: "Autorité",   color: "authority",  description: "" },
  { id: "3", name: "Studio Lumière",    sector: "Photographe",      image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop", result: "9 réservations/mois (vs 4 avant)", offer: "Autorité",   color: "authority",  description: "" },
  { id: "4", name: "Maison Fleurie",    sector: "Fleuriste",        image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop", result: "30% du CA en ligne",               offer: "Conversion", color: "conversion", description: "" },
  { id: "5", name: "Cabinet Vidal",     sector: "Kinésithérapeute", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop", result: "2h/jour économisées",              offer: "Autorité",   color: "authority",  description: "" },
  { id: "6", name: "Immo Sud",          sector: "Immobilier",       image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop", result: "+250% de mandats en 3 mois",       offer: "Conversion", color: "conversion", description: "" },
];

const SETTINGS_KEY = "portfolio";

const EMPTY_PROJECT: Omit<Project, "id"> = {
  name: "", sector: "", image: "", result: "", offer: "Autorité", color: "authority", description: "",
};

const AdminPortfolioTab = () => {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, "id">>(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle() as any;
      if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
        setProjects(data.value);
      }
    };
    load();
  }, []);

  const publish = async (data: Project[]) => {
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
    toast.success("Portfolio publié sur le site ✅");
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditForm({ ...p });
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = projects.map((p) => (p.id === editForm.id ? editForm : p));
    setProjects(updated);
    setEditingId(null);
    setEditForm(null);
    setSynced(false);
    toast.success("Projet modifié (non publié)");
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setSynced(false);
    toast.success("Projet supprimé (non publié)");
  };

  const addProject = () => {
    if (!newProject.name.trim()) { toast.error("Nom du projet requis"); return; }
    const created: Project = { ...newProject, id: crypto.randomUUID() };
    setProjects((prev) => [...prev, created]);
    setNewProject(EMPTY_PROJECT);
    setAdding(false);
    setSynced(false);
    toast.success("Projet ajouté (non publié)");
  };

  const offerColor = (offer: string) =>
    OFFER_OPTIONS.find((o) => o.value === offer)?.color || "authority";

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
            <Plus className="size-3.5 mr-1" />{adding ? "Annuler" : "Ajouter un projet"}
          </Button>
          {!synced && (
            <Button onClick={() => publish(projects)} disabled={saving} size="sm">
              <Save className="size-3.5 mr-1.5" />{saving ? "Publication..." : "Publier les modifications"}
            </Button>
          )}
        </div>
      </div>

      {/* Formulaire ajout */}
      {adding && (
        <div className="card-surface p-6 rounded-xl space-y-4 border border-primary/20">
          <p className="text-sm font-bold text-primary">Nouveau projet</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Nom du projet *</Label>
              <Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="Ex: Durand Plomberie" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Secteur</Label>
              <Input value={newProject.sector} onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })} placeholder="Ex: Artisan BTP" className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">URL de la photo</Label>
            <Input value={newProject.image} onChange={(e) => setNewProject({ ...newProject, image: e.target.value })} placeholder="https://..." className="mt-1" />
            <p className="text-[10px] text-muted-foreground mt-1">Utilisez une URL d'image (Unsplash, votre hébergeur, etc.)</p>
          </div>
          <div>
            <Label className="text-xs">Résultat client</Label>
            <Input value={newProject.result} onChange={(e) => setNewProject({ ...newProject, result: e.target.value })} placeholder="Ex: +320% de demandes de devis" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description courte (optionnel)</Label>
            <Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Quelques mots sur ce projet..." rows={2} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Offre associée</Label>
            <div className="flex gap-2 mt-1">
              {OFFER_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setNewProject({ ...newProject, offer: o.value, color: o.color })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    newProject.offer === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={addProject} className="w-full">
            <Plus className="size-4 mr-2" />Ajouter ce projet
          </Button>
        </div>
      )}

      {/* Liste des projets */}
      <div className="grid gap-4">
        {projects.map((p) => {
          const isEditing = editingId === p.id;
          const data = isEditing && editForm ? editForm : p;

          return (
            <div key={p.id} className="card-surface rounded-xl overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {/* Image preview */}
                <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary/50">
                  {data.image ? (
                    <img
                      src={data.image}
                      alt={data.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="size-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Nom</Label>
                          <Input value={editForm!.name} onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })} className="h-8 text-sm mt-0.5" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Secteur</Label>
                          <Input value={editForm!.sector} onChange={(e) => setEditForm({ ...editForm!, sector: e.target.value })} className="h-8 text-sm mt-0.5" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">URL photo</Label>
                        <Input value={editForm!.image} onChange={(e) => setEditForm({ ...editForm!, image: e.target.value })} className="h-8 text-sm mt-0.5" placeholder="https://..." />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Résultat</Label>
                        <Input value={editForm!.result} onChange={(e) => setEditForm({ ...editForm!, result: e.target.value })} className="h-8 text-sm mt-0.5" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Description</Label>
                        <Textarea value={editForm!.description} onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })} rows={2} className="text-sm mt-0.5" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Offre</Label>
                        <div className="flex gap-2 mt-1">
                          {OFFER_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              onClick={() => setEditForm({ ...editForm!, offer: o.value, color: o.color })}
                              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                                editForm!.offer === o.value
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{data.name}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          data.color === "visibility" ? "bg-visibility/20 text-visibility" :
                          data.color === "conversion" ? "bg-conversion/20 text-conversion" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {data.offer}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{data.sector}</p>
                      <p className="text-xs font-semibold text-visibility mt-1">📈 {data.result}</p>
                      {data.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{data.description}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(null); setEditForm(null); }}>
                        <X className="size-3.5 text-muted-foreground" />
                      </Button>
                      <Button size="icon" className="h-8 w-8" onClick={saveEdit}>
                        <Check className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(p)}>
                        <Edit2 className="size-3.5 text-muted-foreground" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteProject(p.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">
          Aucun projet. Ajoutez votre premier projet ci-dessus.
        </p>
      )}
    </div>
  );
};

export default AdminPortfolioTab;
