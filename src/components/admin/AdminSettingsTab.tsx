import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, RefreshCw, Trash2, AlertTriangle } from "lucide-react";

const AdminSettingsTab = ({
  leads, bookings, diagnostics, products, fetchAll
}: {
  leads: any[]; bookings: any[]; diagnostics: any[]; products: any[];
  fetchAll: () => void;
}) => {
  const [pricing, setPricing] = useState<Record<string, number>>({ "Visibilité": 297, "Autorité": 497, "Conversion": 797 });
  const [suspension, setSuspension] = useState({ enabled: true, delay_days: 15 });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("*") as any;
      if (data) {
        const p = data.find((d: any) => d.key === "offer_pricing");
        const s = data.find((d: any) => d.key === "auto_suspension");
        if (p) setPricing(p.value);
        if (s) setSuspension(s.value);
      }
    };
    load();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    await Promise.all([
      supabase.from("admin_settings").update({ value: pricing, updated_at: new Date().toISOString() } as any).eq("key", "offer_pricing"),
      supabase.from("admin_settings").update({ value: suspension, updated_at: new Date().toISOString() } as any).eq("key", "auto_suspension"),
    ]);
    setSaving(false);
    toast("Paramètres sauvegardés ✓");
  };

  const runPaymentCheck = async () => {
    setChecking(true);
    try {
      const res = await supabase.functions.invoke("check-payments");
      if (res.error) throw res.error;
      toast("✅ Vérification des paiements effectuée");
      fetchAll();
    } catch (e: any) {
      toast.error("Erreur: " + (e.message || "Échec"));
    }
    setChecking(false);
  };

  const offerColor = (o: string) =>
    o === "Visibilité" ? "text-visibility border-visibility/20" :
    o === "Autorité" ? "text-primary border-primary/20" :
    "text-conversion border-conversion/20";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Pricing */}
      <div className="card-surface p-6">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tarifs par offre</h3>
        <p className="text-xs text-muted-foreground mb-4">Ces tarifs sont pré-remplis automatiquement lors de la classification d'un client.</p>
        <div className="grid grid-cols-3 gap-4">
          {(["Visibilité", "Autorité", "Conversion"] as const).map(offer => (
            <div key={offer} className={`border rounded-xl p-4 ${offerColor(offer)}`}>
              <p className="text-sm font-semibold mb-2">{offer}</p>
              <div className="flex items-center gap-1">
                <input type="number" value={pricing[offer] || 0}
                  onChange={e => setPricing(prev => ({ ...prev, [offer]: Number(e.target.value) }))}
                  className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-lg font-extrabold outline-none border border-border/20" />
                <span className="text-sm font-medium">€/mois</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-suspension */}
      <div className="card-surface p-6">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Suspension automatique</h3>
        <p className="text-xs text-muted-foreground mb-4">Suspend l'accès automatiquement après un retard de paiement prolongé.</p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={suspension.enabled}
              onChange={e => setSuspension(prev => ({ ...prev, enabled: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm">Activer la suspension automatique</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">après</span>
            <input type="number" value={suspension.delay_days}
              onChange={e => setSuspension(prev => ({ ...prev, delay_days: Number(e.target.value) }))}
              className="w-16 bg-secondary/50 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none text-center border border-border/20" />
            <span className="text-sm text-muted-foreground">jours</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="size-4 mr-2" />{saving ? "Enregistrement..." : "Sauvegarder"}
        </Button>
        <Button variant="outline" onClick={runPaymentCheck} disabled={checking}>
          <RefreshCw className={`size-4 mr-2 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Vérification..." : "Vérifier les paiements"}
        </Button>
      </div>

      {/* Danger zone */}
      <div className="card-surface p-6 border-destructive/20">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="size-4 text-destructive" />
          <h3 className="text-[11px] font-semibold text-destructive uppercase tracking-wider">Zone dangereuse</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { table: "audit_requests", label: "leads" },
            { table: "bookings", label: "rendez-vous" },
            { table: "product_requests", label: "demandes produits" },
            { table: "diagnostics", label: "diagnostics" },
          ].map(t => (
            <Button key={t.table} variant="outline" size="sm"
              className="border-destructive/20 text-destructive hover:bg-destructive/10 text-xs"
              onClick={async () => {
                if (confirm(`Supprimer tous les ${t.label} ?`)) {
                  await supabase.from(t.table as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");
                  fetchAll();
                  toast(`${t.label} supprimés`);
                }
              }}>
              <Trash2 className="size-3 mr-1.5" />Supprimer {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="card-surface p-6">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Statistiques globales</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          {[
            { label: "Leads", value: leads.length },
            { label: "RDV", value: bookings.length },
            { label: "Diagnostics", value: diagnostics.length },
            { label: "Demandes produits", value: products.length },
          ].map(s => (
            <div key={s.label}>
              <p className="text-muted-foreground text-xs">{s.label}</p>
              <p className="font-bold text-lg">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
