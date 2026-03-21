import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Plus, Trash2, Building2, FileText, Package, GripVertical, Upload, Image } from "lucide-react";

interface CompanyInfo {
  name: string;
  subtitle: string;
  siret: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  legal_form: string;
  logo_url: string;
  brand_color: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  unit_price: number;
  category: string;
}

interface InvoiceLegal {
  tva_mention: string;
  penalty_clause: string;
  custom_footer: string;
  default_payment_terms: string;
  default_validity_days: number;
}

const DEFAULT_COMPANY: CompanyInfo = {
  name: "AS C&D",
  subtitle: "Création de sites web & Copywriting",
  siret: "",
  address: "Rodez, France",
  email: "contact@ascnd.fr",
  phone: "",
  website: "",
  legal_form: "Micro-entreprise",
  logo_url: "",
  brand_color: "#7c3aed",
};

const DEFAULT_LEGAL: InvoiceLegal = {
  tva_mention: "TVA non applicable, article 293 B du Code Général des Impôts",
  penalty_clause: "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.",
  custom_footer: "AS C&D — Rodez, France",
  default_payment_terms: "50% à la commande, 50% à la livraison",
  default_validity_days: 15,
};

const CATEGORIES = ["Site web", "SEO", "Maintenance", "Design", "Automatisation", "Copywriting", "Autre"];

const AdminInvoiceSettingsTab = () => {
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [legal, setLegal] = useState<InvoiceLegal>(DEFAULT_LEGAL);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"identity" | "company" | "legal" | "catalog">("identity");
  const [uploading, setUploading] = useState(false);

  const [newService, setNewService] = useState<Omit<ServiceItem, "id">>({
    name: "", description: "", unit_price: 0, category: "Site web"
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("*") as any;
      if (data) {
        const c = data.find((d: any) => d.key === "company_info");
        const l = data.find((d: any) => d.key === "invoice_legal");
        const s = data.find((d: any) => d.key === "service_catalog");
        if (c?.value) setCompany({ ...DEFAULT_COMPANY, ...c.value });
        if (l?.value) setLegal({ ...DEFAULT_LEGAL, ...l.value });
        if (s?.value) setServices(s.value);
      }
    };
    load();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis (PNG, JPG)"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Fichier trop volumineux (max 2 Mo)"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logo.${ext}`;

    const { error } = await supabase.storage.from("company-assets").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erreur upload : " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("company-assets").getPublicUrl(path);
    const logoUrl = urlData.publicUrl + "?t=" + Date.now();
    setCompany(prev => ({ ...prev, logo_url: logoUrl }));
    setUploading(false);
    toast.success("Logo uploadé ✅");
  };

  const saveAll = async () => {
    setSaving(true);
    const upsert = async (key: string, value: any) => {
      const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", key).maybeSingle();
      if (existing) {
        await supabase.from("admin_settings").update({ value, updated_at: new Date().toISOString() } as any).eq("key", key);
      } else {
        await supabase.from("admin_settings").insert({ key, value } as any);
      }
    };
    await Promise.all([
      upsert("company_info", company),
      upsert("invoice_legal", legal),
      upsert("service_catalog", services),
    ]);
    setSaving(false);
    toast.success("Paramètres de facturation sauvegardés ✓");
  };

  const addService = () => {
    if (!newService.name.trim()) { toast.error("Nom du service requis"); return; }
    setServices(prev => [...prev, { ...newService, id: crypto.randomUUID() }]);
    setNewService({ name: "", description: "", unit_price: 0, category: "Site web" });
    toast.success("Service ajouté");
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const tabs = [
    { id: "identity" as const, label: "Identité visuelle", icon: Image },
    { id: "company" as const, label: "Entreprise", icon: Building2 },
    { id: "legal" as const, label: "Mentions légales", icon: FileText },
    { id: "catalog" as const, label: "Catalogue services", icon: Package },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveSection(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeSection === t.id ? "bg-primary/10 text-primary shadow-sm" : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}>
            <t.icon className="size-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Visual identity */}
      {activeSection === "identity" && (
        <div className="card-surface p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold mb-1">Identité visuelle des documents</h3>
            <p className="text-xs text-muted-foreground">Logo et couleur utilisés sur vos devis et factures PDF.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-xs">Logo entreprise (PNG/JPG, max 2 Mo)</Label>
              <div className="flex items-center gap-4">
                {company.logo_url ? (
                  <div className="w-24 h-24 rounded-xl border border-border/30 bg-white flex items-center justify-center overflow-hidden">
                    <img src={company.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border/40 flex items-center justify-center">
                    <Upload className="size-6 text-muted-foreground/40" />
                  </div>
                )}
                <div>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleLogoUpload} className="hidden" />
                    <Button variant="outline" size="sm" disabled={uploading} asChild>
                      <span>{uploading ? "Upload..." : company.logo_url ? "Remplacer" : "Uploader"}</span>
                    </Button>
                  </label>
                  {company.logo_url && (
                    <Button variant="ghost" size="sm" className="text-destructive ml-2" onClick={() => setCompany({ ...company, logo_url: "" })}>
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs">Couleur principale du document</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={company.brand_color} onChange={e => setCompany({ ...company, brand_color: e.target.value })}
                  className="w-12 h-10 rounded-lg border border-border/30 cursor-pointer" />
                <Input value={company.brand_color} onChange={e => setCompany({ ...company, brand_color: e.target.value })} className="w-32" placeholder="#7c3aed" />
                <div className="w-24 h-10 rounded-lg" style={{ backgroundColor: company.brand_color }} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border border-border/20 rounded-xl p-6 bg-white">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Aperçu en-tête</p>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {company.logo_url && <img src={company.logo_url} alt="" className="w-12 h-12 object-contain" />}
                <div>
                  <p className="text-lg font-bold text-slate-900">{company.name}</p>
                  <p className="text-sm font-medium" style={{ color: company.brand_color }}>{company.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold" style={{ color: company.brand_color }}>DEVIS</p>
                <p className="text-xs text-slate-500 mt-1">DEV-2026-0001</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company info */}
      {activeSection === "company" && (
        <div className="card-surface p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold mb-1">Informations de l'entreprise</h3>
            <p className="text-xs text-muted-foreground">Ces informations apparaîtront sur vos devis et factures.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom de l'entreprise</Label>
              <Input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sous-titre / Activité</Label>
              <Input value={company.subtitle} onChange={e => setCompany({ ...company, subtitle: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Forme juridique</Label>
              <Input value={company.legal_form} onChange={e => setCompany({ ...company, legal_form: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">SIRET</Label>
              <Input value={company.siret} onChange={e => setCompany({ ...company, siret: e.target.value })} placeholder="XXX XXX XXX XXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Téléphone</Label>
              <Input value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Site web</Label>
              <Input value={company.website} onChange={e => setCompany({ ...company, website: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Adresse complète</Label>
            <Textarea value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} rows={2} placeholder="Adresse, Code postal, Ville" />
          </div>
        </div>
      )}

      {/* Legal mentions */}
      {activeSection === "legal" && (
        <div className="card-surface p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold mb-1">Mentions légales des devis & factures</h3>
            <p className="text-xs text-muted-foreground">Personnalisez les mentions affichées en pied de document.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Mention TVA</Label>
              <Input value={legal.tva_mention} onChange={e => setLegal({ ...legal, tva_mention: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Clause de pénalité de retard</Label>
              <Textarea value={legal.penalty_clause} onChange={e => setLegal({ ...legal, penalty_clause: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Conditions de paiement par défaut</Label>
              <Input value={legal.default_payment_terms} onChange={e => setLegal({ ...legal, default_payment_terms: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Validité des devis (jours)</Label>
              <Input type="number" value={legal.default_validity_days} onChange={e => setLegal({ ...legal, default_validity_days: Number(e.target.value) })} className="w-32" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pied de page personnalisé</Label>
              <Textarea value={legal.custom_footer} onChange={e => setLegal({ ...legal, custom_footer: e.target.value })} rows={2} placeholder="AS C&D — Rodez, France" />
            </div>
          </div>
        </div>
      )}

      {/* Service catalog */}
      {activeSection === "catalog" && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-1">Catalogue de services</h3>
              <p className="text-xs text-muted-foreground">Services pré-définis pour remplir rapidement vos devis.</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/20 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ajouter un service</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} placeholder="Nom du service *" />
                <select value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })}
                  className="bg-background rounded-xl px-3 py-2 text-sm border border-border/20 outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-[1fr_120px] gap-3 mb-3">
                <Input value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} placeholder="Description (optionnel)" />
                <Input type="number" value={newService.unit_price} onChange={e => setNewService({ ...newService, unit_price: Number(e.target.value) })} placeholder="Prix €" />
              </div>
              <Button size="sm" onClick={addService}><Plus className="size-3.5 mr-1.5" />Ajouter au catalogue</Button>
            </div>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun service dans le catalogue.</p>
            ) : (
              <div className="space-y-2">
                {CATEGORIES.filter(cat => services.some(s => s.category === cat)).map(cat => (
                  <div key={cat}>
                    <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-2 mt-4">{cat}</p>
                    {services.filter(s => s.category === cat).map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors mb-1.5">
                        <GripVertical className="size-3.5 text-muted-foreground/30 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{s.name}</p>
                          {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                        </div>
                        <span className="text-sm font-semibold text-primary whitespace-nowrap">{s.unit_price.toLocaleString("fr-FR")}€</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => removeService(s.id)}>
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={saveAll} disabled={saving} className="min-w-[200px]">
          <Save className="size-4 mr-2" />{saving ? "Sauvegarde..." : "Sauvegarder tout"}
        </Button>
      </div>
    </div>
  );
};

export default AdminInvoiceSettingsTab;
