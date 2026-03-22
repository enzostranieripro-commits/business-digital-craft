import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Edit2, X, Check, Package, AlertCircle, CheckCircle2 } from "lucide-react";

interface Pack {
  id: string;
  name: string;
  price: string;
  description: string;
  includes: string[];
  notIncludes: string[];
  delay: string;
  revisions: string;
  extras: string;
}

const DEFAULT_PACKS: Pack[] = [
  {
    id: "essentiel",
    name: "Pack Essentiel",
    price: "1 800 €",
    description: "Site vitrine clé en main pour lancer votre présence en ligne.",
    includes: [
      "Site vitrine 4 à 5 pages",
      "Copywriting complet (tous les textes rédigés par ASC&D)",
      "Design responsive (mobile + desktop)",
      "Formulaire de contact",
      "SEO on-page de base (balises, titres, méta-descriptions)",
      "Hébergement + nom de domaine — 1ère année incluse",
      "Mise en ligne",
    ],
    notIncludes: ["Photos professionnelles", "Création de logo", "Google Business Profile"],
    delay: "3 à 4 semaines",
    revisions: "1 incluse",
    extras: "",
  },
  {
    id: "pro",
    name: "Pack Pro",
    price: "3 000 €",
    description: "Site complet avec copywriting optimisé et référencement poussé.",
    includes: [
      "Site vitrine 6 à 8 pages",
      "Copywriting complet + optimisation des accroches",
      "Design responsive (mobile + desktop)",
      "Formulaire de contact / réservation",
      "SEO on-page complet",
      "Google Business Profile configuré et optimisé",
      "Hébergement + nom de domaine — 1ère année incluse",
      "Mise en ligne",
    ],
    notIncludes: ["Photos professionnelles", "Création de logo"],
    delay: "4 semaines",
    revisions: "2 incluses",
    extras: "",
  },
  {
    id: "commerce",
    name: "Pack Commerce",
    price: "4 500 €",
    description: "Boutique e-commerce complète avec paiement en ligne.",
    includes: [
      "Boutique e-commerce jusqu'à 30 produits",
      "Copywriting des pages principales (accueil, à propos, contact)",
      "Textes des fiches produits — jusqu'à 10 incluses",
      "Design responsive (mobile + desktop)",
      "Paiement en ligne configuré (Stripe ou PayPal)",
      "SEO on-page complet",
      "Hébergement + nom de domaine — 1ère année incluse",
      "Mise en ligne",
    ],
    notIncludes: ["Photos professionnelles", "Création de logo", "Fiches produits supplémentaires au-delà de 10"],
    delay: "5 à 6 semaines",
    revisions: "2 incluses",
    extras: "Fiches supplémentaires : 25 €/fiche",
  },
];

const SETTINGS_KEY = "offres_packs";

const AdminOffresPacksTab = () => {
  const [packs, setPacks] = useState<Pack[]>(DEFAULT_PACKS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Pack | null>(null);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle() as any;
      if (data?.value && Array.isArray(data.value)) {
        setPacks(data.value);
      }
    };
    load();
  }, []);

  const startEdit = (pack: Pack) => {
    setEditingId(pack.id);
    setEditForm({ ...pack });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    setPacks(prev => prev.map(p => p.id === editForm.id ? editForm : p));
    setEditingId(null);
    setEditForm(null);
    setSynced(false);
    toast.success("Pack modifié (non publié)");
  };

  const publish = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", SETTINGS_KEY).maybeSingle();
    if (existing) {
      await supabase.from("admin_settings").update({ value: packs as any, updated_at: new Date().toISOString() }).eq("key", SETTINGS_KEY);
    } else {
      await supabase.from("admin_settings").insert({ key: SETTINGS_KEY, value: packs as any } as any);
    }
    setSynced(true);
    setSaving(false);
    toast.success("Offres publiées sur le site ✅");
  };

  return (
    <div className="space-y-6">
      {/* Sync status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {synced ? (
            <><CheckCircle2 className="size-4 text-visibility" /><span className="text-sm text-visibility font-medium">Site à jour ✅</span></>
          ) : (
            <><AlertCircle className="size-4 text-conversion" /><span className="text-sm text-conversion font-medium">Modifications non publiées 🟡</span></>
          )}
        </div>
        {!synced && (
          <Button onClick={publish} disabled={saving} size="sm">
            <Save className="size-3.5 mr-1.5" />{saving ? "Publication..." : "Publier les modifications"}
          </Button>
        )}
      </div>

      {/* Pack cards */}
      <div className="grid gap-6">
        {packs.map(pack => {
          const isEditing = editingId === pack.id;
          const data = isEditing && editForm ? editForm : pack;

          return (
            <div key={pack.id} className="card-surface rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-b border-border/20">
                <div className="flex items-center gap-3">
                  <Package className="size-5 text-primary" />
                  {isEditing ? (
                    <Input value={editForm!.name} onChange={e => setEditForm({ ...editForm!, name: e.target.value })} className="text-lg font-bold w-64" />
                  ) : (
                    <h3 className="text-lg font-bold">{data.name}</h3>
                  )}
                  {isEditing ? (
                    <Input value={editForm!.price} onChange={e => setEditForm({ ...editForm!, price: e.target.value })} className="w-32 font-bold" />
                  ) : (
                    <span className="text-lg font-extrabold text-primary">{data.price}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="size-3.5 mr-1" />Annuler</Button>
                      <Button size="sm" onClick={saveEdit}><Check className="size-3.5 mr-1" />Valider</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(pack)}><Edit2 className="size-3.5 mr-1" />Modifier</Button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {isEditing ? (
                  <Textarea value={editForm!.description} onChange={e => setEditForm({ ...editForm!, description: e.target.value })} rows={2} placeholder="Description du pack" />
                ) : (
                  <p className="text-sm text-muted-foreground">{data.description}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-visibility uppercase tracking-wider">Inclus</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm!.includes.join("\n")}
                        onChange={e => setEditForm({ ...editForm!, includes: e.target.value.split("\n") })}
                        rows={6} className="mt-2 text-sm"
                        placeholder="Un élément par ligne"
                      />
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {data.includes.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Check className="size-3.5 text-visibility mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-destructive uppercase tracking-wider">Non inclus</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm!.notIncludes.join("\n")}
                        onChange={e => setEditForm({ ...editForm!, notIncludes: e.target.value.split("\n") })}
                        rows={4} className="mt-2 text-sm"
                        placeholder="Un élément par ligne"
                      />
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {data.notIncludes.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <X className="size-3.5 text-destructive mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border/20 pt-3">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Délai :</Label>
                        <Input value={editForm!.delay} onChange={e => setEditForm({ ...editForm!, delay: e.target.value })} className="w-40 h-7 text-xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Révisions :</Label>
                        <Input value={editForm!.revisions} onChange={e => setEditForm({ ...editForm!, revisions: e.target.value })} className="w-32 h-7 text-xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Extras :</Label>
                        <Input value={editForm!.extras} onChange={e => setEditForm({ ...editForm!, extras: e.target.value })} className="w-60 h-7 text-xs" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span>⏱ Délai : {data.delay}</span>
                      <span>🔄 Révisions : {data.revisions}</span>
                      {data.extras && <span>➕ {data.extras}</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOffresPacksTab;
