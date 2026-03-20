import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical, Package, Layers, Globe, ShoppingCart, Settings2, Eye } from "lucide-react";

interface OfferOption {
  id: string;
  name: string;
  setup: number;
  monthly: number;
}

interface OfferData {
  name: string;
  tagline: string;
  icon: string;
  color: string;
  monthly: number;
  oneTime: number;
  users: number;
  includes: string[];
  options: OfferOption[];
}

const DEFAULT_OFFERS: OfferData[] = [
  {
    name: "Visibilité", tagline: "Landing page", icon: "Globe", color: "visibility", monthly: 59, oneTime: 1200, users: 18,
    includes: ["Page unique optimisée SEO", "Formulaire de contact", "Design responsive", "Hébergement inclus", "Certificat SSL", "Support email"],
    options: [
      { id: crypto.randomUUID(), name: "Google Calendar", setup: 49, monthly: 9 },
      { id: crypto.randomUUID(), name: "Widget WhatsApp", setup: 29, monthly: 5 },
      { id: crypto.randomUUID(), name: "Analytics", setup: 39, monthly: 9 },
      { id: crypto.randomUUID(), name: "Blog SEO", setup: 99, monthly: 19 },
    ],
  },
  {
    name: "Autorité", tagline: "Site vitrine", icon: "Layers", color: "authority", monthly: 119, oneTime: 2400, users: 22,
    includes: ["Jusqu'à 5 pages", "Blog intégré", "Google My Business", "Hébergement inclus", "Certificat SSL", "Support prioritaire"],
    options: [
      { id: crypto.randomUUID(), name: "CRM leads", setup: 99, monthly: 19 },
      { id: crypto.randomUUID(), name: "Prise de RDV", setup: 79, monthly: 15 },
      { id: crypto.randomUUID(), name: "Avis automatisés", setup: 59, monthly: 12 },
      { id: crypto.randomUUID(), name: "Blog + rédaction SEO", setup: 149, monthly: 29 },
    ],
  },
  {
    name: "Conversion", tagline: "E-commerce", icon: "ShoppingCart", color: "conversion", monthly: 199, oneTime: 3400, users: 7,
    includes: ["Boutique en ligne", "Paiement sécurisé", "Gestion des stocks", "Hébergement inclus", "Certificat SSL", "Support dédié"],
    options: [
      { id: crypto.randomUUID(), name: "Codes promo", setup: 49, monthly: 9 },
      { id: crypto.randomUUID(), name: "Abonnements récurrents", setup: 99, monthly: 19 },
      { id: crypto.randomUUID(), name: "Analytics avancé", setup: 79, monthly: 15 },
      { id: crypto.randomUUID(), name: "SMS auto", setup: 69, monthly: 12 },
    ],
  },
];

const ICON_MAP: Record<string, any> = { Globe, Layers, ShoppingCart };

const offerColor = (color: string) =>
  color === "visibility" ? { bg: "bg-visibility/10", text: "text-visibility", border: "border-visibility/20" } :
  color === "authority" ? { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" } :
  { bg: "bg-conversion/10", text: "text-conversion", border: "border-conversion/20" };

const AdminCatalogTab = () => {
  const [offers, setOffers] = useState<OfferData[]>(DEFAULT_OFFERS);
  const [selectedOfferIdx, setSelectedOfferIdx] = useState(0);
  const [activeSection, setActiveSection] = useState<"offers" | "options" | "includes">("offers");
  const [saving, setSaving] = useState(false);
  const [newInclude, setNewInclude] = useState("");
  const [newOption, setNewOption] = useState({ name: "", setup: 0, monthly: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", "pricing_catalog").maybeSingle() as any;
      if (data?.value && Array.isArray(data.value) && data.value.length === 3) {
        setOffers(data.value);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", "pricing_catalog").maybeSingle();
    if (existing) {
      await supabase.from("admin_settings").update({ value: offers as any, updated_at: new Date().toISOString() } as any).eq("key", "pricing_catalog");
    } else {
      await supabase.from("admin_settings").insert({ key: "pricing_catalog", value: offers as any } as any);
    }
    // Also update offer_pricing for backward compatibility
    const pricing: Record<string, number> = {};
    offers.forEach(o => { pricing[o.name] = o.monthly; });
    const { data: pricingExists } = await supabase.from("admin_settings").select("id").eq("key", "offer_pricing").maybeSingle();
    if (pricingExists) {
      await supabase.from("admin_settings").update({ value: pricing as any, updated_at: new Date().toISOString() } as any).eq("key", "offer_pricing");
    } else {
      await supabase.from("admin_settings").insert({ key: "offer_pricing", value: pricing as any } as any);
    }
    setSaving(false);
    setHasChanges(false);
    toast.success("Catalogue mis à jour ✓ — Les prix sont maintenant à jour sur le site");
  };

  const updateOffer = (idx: number, field: keyof OfferData, value: any) => {
    setOffers(prev => {
      const updated = [...prev];
      (updated[idx] as any)[field] = value;
      return updated;
    });
    setHasChanges(true);
  };

  const addInclude = () => {
    if (!newInclude.trim()) return;
    setOffers(prev => {
      const updated = [...prev];
      updated[selectedOfferIdx] = { ...updated[selectedOfferIdx], includes: [...updated[selectedOfferIdx].includes, newInclude.trim()] };
      return updated;
    });
    setNewInclude("");
    setHasChanges(true);
  };

  const removeInclude = (includeIdx: number) => {
    setOffers(prev => {
      const updated = [...prev];
      updated[selectedOfferIdx] = { ...updated[selectedOfferIdx], includes: updated[selectedOfferIdx].includes.filter((_, i) => i !== includeIdx) };
      return updated;
    });
    setHasChanges(true);
  };

  const addOption = () => {
    if (!newOption.name.trim()) { toast.error("Nom de l'option requis"); return; }
    setOffers(prev => {
      const updated = [...prev];
      updated[selectedOfferIdx] = {
        ...updated[selectedOfferIdx],
        options: [...updated[selectedOfferIdx].options, { id: crypto.randomUUID(), ...newOption }],
      };
      return updated;
    });
    setNewOption({ name: "", setup: 0, monthly: 0 });
    setHasChanges(true);
    toast.success("Option ajoutée");
  };

  const removeOption = (optionId: string) => {
    setOffers(prev => {
      const updated = [...prev];
      updated[selectedOfferIdx] = {
        ...updated[selectedOfferIdx],
        options: updated[selectedOfferIdx].options.filter(o => o.id !== optionId),
      };
      return updated;
    });
    setHasChanges(true);
  };

  const updateOption = (optionId: string, field: keyof OfferOption, value: string | number) => {
    setOffers(prev => {
      const updated = [...prev];
      updated[selectedOfferIdx] = {
        ...updated[selectedOfferIdx],
        options: updated[selectedOfferIdx].options.map(o =>
          o.id === optionId ? { ...o, [field]: value } : o
        ),
      };
      return updated;
    });
    setHasChanges(true);
  };

  const offer = offers[selectedOfferIdx];
  const colors = offerColor(offer.color);
  const OfferIcon = ICON_MAP[offer.icon] || Globe;

  return (
    <div className="space-y-6">
      {/* Offer selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {offers.map((o, i) => {
            const c = offerColor(o.color);
            const Icon = ICON_MAP[o.icon] || Globe;
            return (
              <button key={o.name} onClick={() => setSelectedOfferIdx(i)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 transition-all ${
                  selectedOfferIdx === i ? `${c.bg} ${c.text} ${c.border} shadow-sm` : "border-border/20 text-muted-foreground hover:border-border"
                }`}>
                <Icon className="size-5" />
                <div className="text-left">
                  <p className="text-sm font-bold">{o.name}</p>
                  <p className="text-[10px] opacity-70">{o.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
        <Button onClick={save} disabled={saving || !hasChanges} className="min-w-[180px]">
          <Save className="size-4 mr-2" />{saving ? "Sauvegarde..." : hasChanges ? "Sauvegarder tout" : "À jour ✓"}
        </Button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2">
        {[
          { id: "offers" as const, label: "Tarifs & Infos", icon: Settings2 },
          { id: "includes" as const, label: "Contenu inclus", icon: Package },
          { id: "options" as const, label: "Options", icon: Layers },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveSection(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeSection === t.id ? `${colors.bg} ${colors.text} shadow-sm` : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}>
            <t.icon className="size-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Tarifs & Infos */}
      {activeSection === "offers" && (
        <div className="card-surface p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold mb-1">Tarification — {offer.name}</h3>
            <p className="text-xs text-muted-foreground">Ces prix sont affichés sur le calculateur public et utilisés lors de la classification client.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Nom de l'offre</label>
              <Input value={offer.name} onChange={e => updateOffer(selectedOfferIdx, "name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Sous-titre</label>
              <Input value={offer.tagline} onChange={e => updateOffer(selectedOfferIdx, "tagline", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Prix mensuel (€/mois TTC)</label>
              <div className="relative">
                <Input type="number" value={offer.monthly} onChange={e => updateOffer(selectedOfferIdx, "monthly", Number(e.target.value))} className="pr-16" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€/mois</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Prix achat unique (€ TTC)</label>
              <div className="relative">
                <Input type="number" value={offer.oneTime} onChange={e => updateOffer(selectedOfferIdx, "oneTime", Number(e.target.value))} className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Nombre de clients actifs (affiché sur le site)</label>
              <Input type="number" value={offer.users} onChange={e => updateOffer(selectedOfferIdx, "users", Number(e.target.value))} />
            </div>
          </div>

          {/* Preview */}
          <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Aperçu sur le site</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold">{offer.name}</span>
              <span className={`text-sm ${colors.text}`}>{offer.tagline}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">À partir de <strong>{offer.monthly}€/mois</strong> TTC · ou à partir de <strong>{offer.oneTime.toLocaleString("fr-FR")}€</strong> achat unique TTC</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{offer.users} clients actifs</p>
          </div>
        </div>
      )}

      {/* Contenu inclus */}
      {activeSection === "includes" && (
        <div className="card-surface p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold mb-1">Contenu inclus — {offer.name}</h3>
            <p className="text-xs text-muted-foreground">Ces éléments s'affichent dans l'étape "Contenu" du configurateur public.</p>
          </div>
          <div className="space-y-1.5">
            {offer.includes.map((inc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors group">
                <GripVertical className="size-3.5 text-muted-foreground/30 flex-shrink-0" />
                <span className="flex-1 text-sm">{inc}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeInclude(i)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newInclude} onChange={e => setNewInclude(e.target.value)} placeholder="Nouvelle fonctionnalité incluse..."
              onKeyDown={e => e.key === "Enter" && addInclude()} className="flex-1" />
            <Button size="sm" onClick={addInclude}><Plus className="size-3.5 mr-1.5" />Ajouter</Button>
          </div>
        </div>
      )}

      {/* Options */}
      {activeSection === "options" && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-1">Options — {offer.name}</h3>
              <p className="text-xs text-muted-foreground">Ces options apparaissent dans l'étape "Options" du calculateur. Le prix total se met à jour automatiquement.</p>
            </div>

            {/* Add new option */}
            <div className={`${colors.bg} rounded-xl p-4 border ${colors.border} mb-4`}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ajouter une option</p>
              <div className="grid grid-cols-[1fr_100px_100px_auto] gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Nom</label>
                  <Input value={newOption.name} onChange={e => setNewOption({ ...newOption, name: e.target.value })} placeholder="Ex: Analytics avancé" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Setup (€)</label>
                  <Input type="number" value={newOption.setup} onChange={e => setNewOption({ ...newOption, setup: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Mensuel (€)</label>
                  <Input type="number" value={newOption.monthly} onChange={e => setNewOption({ ...newOption, monthly: Number(e.target.value) })} />
                </div>
                <Button size="sm" onClick={addOption} className="h-10"><Plus className="size-3.5 mr-1.5" />Ajouter</Button>
              </div>
            </div>

            {/* Existing options */}
            {offer.options.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune option pour cette offre</p>
            ) : (
              <div className="space-y-2">
                {offer.options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors group">
                    <GripVertical className="size-3.5 text-muted-foreground/30 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input value={opt.name} onChange={e => updateOption(opt.id, "name", e.target.value)}
                        className="text-sm font-medium bg-transparent outline-none w-full border-b border-transparent focus:border-primary/30 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Setup</span>
                        <input type="number" value={opt.setup} onChange={e => updateOption(opt.id, "setup", Number(e.target.value))}
                          className="w-16 bg-secondary/50 rounded-lg px-2 py-1 text-xs text-center outline-none border border-border/20 focus:border-primary/30" />
                        <span className="text-[10px] text-muted-foreground">€</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">+</span>
                        <input type="number" value={opt.monthly} onChange={e => updateOption(opt.id, "monthly", Number(e.target.value))}
                          className="w-16 bg-secondary/50 rounded-lg px-2 py-1 text-xs text-center outline-none border border-border/20 focus:border-primary/30" />
                        <span className="text-[10px] text-muted-foreground">€/m</span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeOption(opt.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Aperçu calculateur — {offer.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Base: {offer.monthly}€/mois • Avec toutes les options: {offer.monthly + offer.options.reduce((s, o) => s + o.monthly, 0)}€/mois</p>
            <div className="space-y-2">
              {offer.options.map(opt => (
                <div key={opt.id} className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-secondary/10">
                  <span className="text-sm font-medium">{opt.name}</span>
                  <span className="text-xs text-muted-foreground">Setup {opt.setup}€ + {opt.monthly}€/mois</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCatalogTab;
