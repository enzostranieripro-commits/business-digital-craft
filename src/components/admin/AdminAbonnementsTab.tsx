import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

interface Formule {
  id: string;
  name: string;
  price: string;
  includes: string;
}

interface AbonnementData {
  maintenance: Formule[];
  maintenanceMention: string;
  newsletter: Formule[];
}

const DEFAULT_DATA: AbonnementData = {
  maintenance: [
    { id: crypto.randomUUID(), name: "Essentiel", price: "59 €/mois", includes: "MAJ CMS + plugins, sauvegarde mensuelle, surveillance uptime, rapport mensuel" },
    { id: crypto.randomUUID(), name: "Sérénité", price: "89 €/mois", includes: "MAJ CMS + plugins, sauvegardes hebdo, surveillance uptime, 1h modif/mois, rapport mensuel" },
    { id: crypto.randomUUID(), name: "Premium", price: "119 €/mois", includes: "MAJ CMS + plugins, sauvegardes quotidiennes, uptime 24/7, 2h modif/mois, rapport mensuel" },
  ],
  maintenanceMention: "Modifications au-delà du forfait : 60 €/h",
  newsletter: [
    { id: crypto.randomUUID(), name: "Starter", price: "150 €/mois", includes: "1 email/mois, rédaction, mise en page, envoi, statistiques de base" },
    { id: crypto.randomUUID(), name: "Régulier", price: "280 €/mois", includes: "2 emails/mois, mise en page couleurs client, statistiques détaillées, rapport mensuel" },
    { id: crypto.randomUUID(), name: "Intensif", price: "500 €/mois", includes: "4 emails/mois, statistiques + optimisation, rapport mensuel complet" },
  ],
};

const SETTINGS_KEY = "abonnements_recurrents";

const AdminAbonnementsTab = () => {
  const [data, setData] = useState<AbonnementData>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: row } = await supabase.from("admin_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle() as any;
      if (row?.value) setData({ ...DEFAULT_DATA, ...row.value });
    };
    load();
  }, []);

  const publish = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", SETTINGS_KEY).maybeSingle();
    if (existing) {
      await supabase.from("admin_settings").update({ value: data as any, updated_at: new Date().toISOString() }).eq("key", SETTINGS_KEY);
    } else {
      await supabase.from("admin_settings").insert({ key: SETTINGS_KEY, value: data as any } as any);
    }
    setSynced(true);
    setSaving(false);
    toast.success("Abonnements publiés sur le site ✅");
  };

  const addFormule = (type: "maintenance" | "newsletter") => {
    setData(prev => ({
      ...prev,
      [type]: [...prev[type], { id: crypto.randomUUID(), name: "", price: "", includes: "" }],
    }));
    setSynced(false);
  };

  const removeFormule = (type: "maintenance" | "newsletter", id: string) => {
    setData(prev => ({ ...prev, [type]: prev[type].filter(f => f.id !== id) }));
    setSynced(false);
  };

  const updateFormule = (type: "maintenance" | "newsletter", id: string, field: keyof Formule, value: string) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].map(f => f.id === id ? { ...f, [field]: value } : f),
    }));
    setSynced(false);
  };

  const renderTable = (type: "maintenance" | "newsletter", title: string) => (
    <div className="card-surface rounded-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-border/20 bg-secondary/30">
        <h3 className="text-sm font-bold">{title}</h3>
        <Button size="sm" variant="outline" onClick={() => addFormule(type)}>
          <Plus className="size-3.5 mr-1" />Ajouter une formule
        </Button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/20">
            <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Formule</th>
            <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 w-40">Prix</th>
            <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Inclus</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {data[type].map(f => (
            <tr key={f.id} className="border-b border-border/10">
              <td className="px-4 py-3">
                <Input value={f.name} onChange={e => updateFormule(type, f.id, "name", e.target.value)} placeholder="Nom" className="h-8 text-sm" />
              </td>
              <td className="px-4 py-3">
                <Input value={f.price} onChange={e => updateFormule(type, f.id, "price", e.target.value)} placeholder="Prix" className="h-8 text-sm" />
              </td>
              <td className="px-4 py-3">
                <Input value={f.includes} onChange={e => updateFormule(type, f.id, "includes", e.target.value)} placeholder="Inclus (séparé par virgule)" className="h-8 text-sm" />
              </td>
              <td className="px-4 py-3">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeFormule(type, f.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data[type].length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">Aucune formule.</p>
      )}
    </div>
  );

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

      {renderTable("maintenance", "Maintenance Mensuelle")}

      <div className="card-surface p-4 rounded-xl">
        <label className="text-xs font-semibold text-muted-foreground">Mention sous le tableau maintenance :</label>
        <Input
          value={data.maintenanceMention}
          onChange={e => { setData(prev => ({ ...prev, maintenanceMention: e.target.value })); setSynced(false); }}
          className="mt-2"
        />
      </div>

      {renderTable("newsletter", "Newsletter")}
    </div>
  );
};

export default AdminAbonnementsTab;
