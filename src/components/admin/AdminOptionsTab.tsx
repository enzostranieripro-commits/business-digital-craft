import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

interface Option {
  id: string;
  name: string;
  description: string;
  price: string;
  visible: boolean;
}

const DEFAULT_OPTIONS: Option[] = [
  { id: crypto.randomUUID(), name: "Refonte de site existant", description: "Reprise et modernisation d'un site déjà en ligne", price: "À partir de 800 €", visible: true },
  { id: crypto.randomUUID(), name: "Page supplémentaire", description: "Au-delà du nombre de pages incluses dans le pack", price: "150 € / page", visible: true },
  { id: crypto.randomUUID(), name: "Boutique au-delà de 30 produits", description: "Extension du catalogue e-commerce", price: "+500 €", visible: true },
  { id: crypto.randomUUID(), name: "Rédaction de fiches produits", description: "Textes optimisés SEO pour boutique e-commerce", price: "25 € / fiche", visible: true },
  { id: crypto.randomUUID(), name: "Audit SEO", description: "Analyse complète du référencement + recommandations", price: "250 – 500 €", visible: true },
  { id: crypto.randomUUID(), name: "Mentions légales + Politique de confidentialité", description: "Rédaction des pages légales obligatoires", price: "150 €", visible: true },
  { id: crypto.randomUUID(), name: "Configuration Google Business Profile", description: "Création et optimisation de la fiche Google", price: "150 €", visible: true },
  { id: crypto.randomUUID(), name: "Rapport mensuel détaillé", description: "Analyse approfondie + recommandations stratégiques", price: "+30 € / mois", visible: true },
  { id: crypto.randomUUID(), name: "Modifications hors périmètre", description: "Toute évolution hors révisions incluses", price: "60 € / heure", visible: true },
];

const SETTINGS_KEY = "options_tarifs";

const AdminOptionsTab = () => {
  const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
  const [newOption, setNewOption] = useState({ name: "", description: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle() as any;
      if (data?.value && Array.isArray(data.value)) setOptions(data.value);
    };
    load();
  }, []);

  const addOption = () => {
    if (!newOption.name.trim()) { toast.error("Nom requis"); return; }
    setOptions(prev => [...prev, { ...newOption, id: crypto.randomUUID(), visible: true }]);
    setNewOption({ name: "", description: "", price: "" });
    setSynced(false);
    toast.success("Option ajoutée (non publiée)");
  };

  const removeOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
    setSynced(false);
  };

  const toggleVisible = (id: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, visible: !o.visible } : o));
    setSynced(false);
  };

  const publish = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", SETTINGS_KEY).maybeSingle();
    if (existing) {
      await supabase.from("admin_settings").update({ value: options as any, updated_at: new Date().toISOString() }).eq("key", SETTINGS_KEY);
    } else {
      await supabase.from("admin_settings").insert({ key: SETTINGS_KEY, value: options as any } as any);
    }
    setSynced(true);
    setSaving(false);
    toast.success("Options publiées sur le site ✅");
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

      {/* Add new option */}
      <div className="card-surface p-4 rounded-xl">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ajouter une option</p>
        <div className="grid grid-cols-[1fr_1fr_160px_auto] gap-3 items-end">
          <Input value={newOption.name} onChange={e => setNewOption({ ...newOption, name: e.target.value })} placeholder="Nom de l'option *" />
          <Input value={newOption.description} onChange={e => setNewOption({ ...newOption, description: e.target.value })} placeholder="Description" />
          <Input value={newOption.price} onChange={e => setNewOption({ ...newOption, price: e.target.value })} placeholder="Prix HT" />
          <Button size="sm" onClick={addOption}><Plus className="size-3.5 mr-1" />Ajouter</Button>
        </div>
      </div>

      {/* Options table */}
      <div className="card-surface rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/20 bg-secondary/30">
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Nom</th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Description</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Prix HT</th>
              <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Visible</th>
              <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {options.map(opt => (
              <tr key={opt.id} className={`border-b border-border/10 hover:bg-secondary/20 transition-colors ${!opt.visible ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 text-sm font-medium">{opt.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{opt.description}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary text-right">{opt.price}</td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={opt.visible} onCheckedChange={() => toggleVisible(opt.id)} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeOption(opt.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune option configurée.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOptionsTab;
