import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Search, User, Mail, Phone, MapPin, Calendar, FileText, TrendingUp,
  ChevronRight, X, Save, Globe, CreditCard, Package
} from "lucide-react";

interface AdminClientsTabProps {
  leads: any[];
  bookings: any[];
  products: any[];
  subscriptions: any[];
  fetchAll: () => void;
}

const OFFER_LEVELS = ["Visibilité", "Autorité", "Conversion"];
const OPTIONS_LIST = [
  "Maintenance mensuelle",
  "SEO avancé",
  "Rédaction de contenu",
  "Gestion réseaux sociaux",
  "Campagnes publicitaires",
  "Chatbot IA",
  "Reporting analytique",
  "Support prioritaire",
];
const PAYMENT_TYPES = [
  { value: "abonnement", label: "Abonnement + Hébergement" },
  { value: "achat_unique", label: "Achat unique" },
];

const offerColor = (o: string) =>
  o === "Visibilité" ? "bg-visibility/20 text-visibility border-visibility/30" :
  o === "Autorité" ? "bg-primary/20 text-primary border-primary/30" :
  o === "Conversion" ? "bg-conversion/20 text-conversion border-conversion/30" :
  "bg-secondary text-muted-foreground border-border";

const AdminClientsTab = ({ leads, bookings, products, subscriptions, fetchAll }: AdminClientsTabProps) => {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [editingSub, setEditingSub] = useState(false);
  const [offerPricing, setOfferPricing] = useState<Record<string, number>>({ "Visibilité": 297, "Autorité": 497, "Conversion": 797 });
  const [subForm, setSubForm] = useState({
    offer_level: "Visibilité",
    options: [] as string[],
    payment_type: "abonnement",
    monthly_amount: 0,
    hosting_included: false,
    hosting_domain: "",
    notes: "",
  });

  // Load pricing config
  useEffect(() => {
    const loadPricing = async () => {
      const { data } = await supabase.from("admin_settings" as any).select("value").eq("key", "offer_pricing").single();
      if (data) setOfferPricing(data.value as any);
    };
    loadPricing();
  }, []);

  // Auto-fill price when offer level changes
  const handleOfferChange = (offer: string) => {
    setSubForm(prev => ({
      ...prev,
      offer_level: offer,
      monthly_amount: offerPricing[offer] || prev.monthly_amount,
    }));
  };

  const clients = useMemo(() => {
    return leads
      .filter((l: any) => l.status === "converti")
      .map((l: any) => {
        const clientBookings = bookings.filter((b: any) => b.email === l.email);
        const clientProducts = products.filter((p: any) => p.email === l.email);
        const sub = subscriptions.find((s: any) => s.lead_id === l.id);
        return {
          ...l,
          bookings: clientBookings,
          products: clientProducts,
          subscription: sub || null,
          totalBookings: clientBookings.length,
          productsList: clientProducts.map((p: any) => p.product),
        };
      });
  }, [leads, bookings, products, subscriptions]);

  const filteredClients = clients.filter((c: any) =>
    `${c.prenom} ${c.nom} ${c.email} ${c.secteur} ${c.subscription?.offer_level || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const openClient = async (client: any) => {
    setSelectedClient(client);
    setEditingSub(false);
    if (client.subscription) {
      setSubForm({
        offer_level: client.subscription.offer_level,
        options: client.subscription.options || [],
        payment_type: client.subscription.payment_type,
        monthly_amount: client.subscription.monthly_amount,
        hosting_included: client.subscription.hosting_included,
        hosting_domain: client.subscription.hosting_domain || "",
        notes: client.subscription.notes || "",
      });
    } else {
      setSubForm({ offer_level: "Visibilité", options: [], payment_type: "abonnement", monthly_amount: 0, hosting_included: false, hosting_domain: "", notes: "" });
    }
    const [n, f] = await Promise.all([
      supabase.from("lead_notes" as any).select("*").eq("lead_id", client.id).order("created_at", { ascending: false }),
      supabase.from("follow_ups" as any).select("*").eq("lead_id", client.id).order("scheduled_at", { ascending: false }),
    ]);
    if (n.data) setNotes(n.data as any[]);
    if (f.data) setFollowUps(f.data as any[]);
  };

  const toggleOption = (opt: string) => {
    setSubForm(prev => ({
      ...prev,
      options: prev.options.includes(opt) ? prev.options.filter(o => o !== opt) : [...prev.options, opt],
    }));
  };

  const saveSub = async () => {
    if (!selectedClient) return;
    const payload = {
      lead_id: selectedClient.id,
      offer_level: subForm.offer_level,
      options: subForm.options,
      payment_type: subForm.payment_type,
      monthly_amount: subForm.monthly_amount,
      hosting_included: subForm.hosting_included,
      hosting_domain: subForm.hosting_domain || null,
      notes: subForm.notes || null,
      updated_at: new Date().toISOString(),
    };

    if (selectedClient.subscription) {
      await supabase.from("client_subscriptions" as any).update(payload as any).eq("id", selectedClient.subscription.id);
    } else {
      await supabase.from("client_subscriptions" as any).insert(payload as any);
    }
    toast("Contrat client mis à jour ✓");
    setEditingSub(false);
    fetchAll();
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Client list */}
      <div className={`${selectedClient ? "w-1/2" : "w-full"} flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Portefeuille Clients</h1>
            <p className="text-sm text-muted-foreground">{clients.length} client{clients.length > 1 ? "s" : ""} converti{clients.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..."
            className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2 text-sm outline-none" />
        </div>

        {filteredClients.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <User className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aucun client converti pour le moment</p>
            <p className="text-xs text-muted-foreground mt-1">Les leads passés au statut "Converti" apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid gap-3 overflow-y-auto flex-1">
            {filteredClients.map((c: any) => (
              <div key={c.id} onClick={() => openClient(c)}
                className={`card-surface p-4 cursor-pointer transition-all hover:border-primary/30 ${selectedClient?.id === c.id ? "border-primary/50 bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.subscription ? offerColor(c.subscription.offer_level).split(" ").slice(0, 1).join(" ") : "bg-secondary"}`}>
                      <User className={`size-5 ${c.subscription ? offerColor(c.subscription.offer_level).split(" ")[1] : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{c.prenom} {c.nom}</p>
                      <p className="text-xs text-muted-foreground">{c.secteur} • {c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.subscription && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${offerColor(c.subscription.offer_level)}`}>
                        {c.subscription.offer_level}
                      </span>
                    )}
                    {c.subscription?.hosting_included && <Globe className="size-3.5 text-visibility" />}
                    {c.subscription?.payment_type === "abonnement" && <CreditCard className="size-3.5 text-primary" />}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="size-3" />{c.totalBookings} RDV</span>
                  {c.subscription && <span className="flex items-center gap-1"><Package className="size-3" />{c.subscription.options?.length || 0} option{(c.subscription.options?.length || 0) > 1 ? "s" : ""}</span>}
                  <span className="flex items-center gap-1"><TrendingUp className="size-3" />Depuis {new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client detail panel */}
      {selectedClient && (
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedClient.prenom} {selectedClient.nom}</h2>
            <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>

          {/* Contact card */}
          <div className="card-surface p-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3.5" />{selectedClient.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5" />{selectedClient.telephone || "—"}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-3.5" />{selectedClient.secteur}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-3.5" />Depuis {new Date(selectedClient.created_at).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>

          {/* Classification / Subscription Form */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Classification & Contrat</h3>
              {!editingSub ? (
                <Button size="sm" variant="ghost" onClick={() => setEditingSub(true)}>Modifier</Button>
              ) : (
                <Button size="sm" onClick={saveSub}><Save className="size-3.5 mr-1" />Enregistrer</Button>
              )}
            </div>

            {!editingSub && selectedClient.subscription ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold px-4 py-2 rounded-xl border ${offerColor(selectedClient.subscription.offer_level)}`}>
                    {selectedClient.subscription.offer_level}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-full ${selectedClient.subscription.payment_type === "abonnement" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {selectedClient.subscription.payment_type === "abonnement" ? "Abonnement" : "Achat unique"}
                  </span>
                  <span className="text-sm font-extrabold">{selectedClient.subscription.monthly_amount}€{selectedClient.subscription.payment_type === "abonnement" ? "/mois" : ""}</span>
                </div>
                {selectedClient.subscription.hosting_included && (
                  <div className="flex items-center gap-2 text-visibility text-sm">
                    <Globe className="size-4" />
                    <span>Hébergement inclus{selectedClient.subscription.hosting_domain ? ` — ${selectedClient.subscription.hosting_domain}` : ""}</span>
                  </div>
                )}
                {selectedClient.subscription.options?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.subscription.options.map((opt: string) => (
                      <span key={opt} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">{opt}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : !editingSub ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Aucun contrat configuré</p>
                <Button size="sm" variant="outline" onClick={() => setEditingSub(true)}>Classifier ce client</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Offer level */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Niveau d'offre</p>
                  <div className="flex gap-2">
                    {OFFER_LEVELS.map(o => (
                      <button key={o} onClick={() => setSubForm(prev => ({ ...prev, offer_level: o }))}
                        className={`flex-1 text-sm font-semibold py-3 rounded-xl border-2 transition-all ${subForm.offer_level === o ? offerColor(o) : "border-border/30 text-muted-foreground hover:border-border"}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment type */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Type de contrat</p>
                  <div className="flex gap-2">
                    {PAYMENT_TYPES.map(pt => (
                      <button key={pt.value} onClick={() => setSubForm(prev => ({
                        ...prev,
                        payment_type: pt.value,
                        hosting_included: pt.value === "abonnement" ? prev.hosting_included : false,
                      }))}
                        className={`flex-1 text-xs font-medium py-2.5 rounded-xl border transition-all ${subForm.payment_type === pt.value ? "border-primary bg-primary/10 text-primary" : "border-border/30 text-muted-foreground"}`}>
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Montant (€{subForm.payment_type === "abonnement" ? "/mois" : ""})</p>
                  <input type="number" value={subForm.monthly_amount} onChange={e => setSubForm(prev => ({ ...prev, monthly_amount: Number(e.target.value) }))}
                    className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none font-semibold" />
                </div>

                {/* Hosting */}
                {subForm.payment_type === "abonnement" && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={subForm.hosting_included} onCheckedChange={(v) => setSubForm(prev => ({ ...prev, hosting_included: !!v }))} />
                      <span className="text-sm">Hébergement inclus</span>
                    </label>
                    {subForm.hosting_included && (
                      <input value={subForm.hosting_domain} onChange={e => setSubForm(prev => ({ ...prev, hosting_domain: e.target.value }))}
                        placeholder="ex: monsite.fr" className="w-full bg-secondary rounded-xl px-4 py-2 text-sm outline-none mt-1" />
                    )}
                  </div>
                )}

                {/* Options */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Options</p>
                  <div className="grid grid-cols-2 gap-2">
                    {OPTIONS_LIST.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                        <Checkbox checked={subForm.options.includes(opt)} onCheckedChange={() => toggleOption(opt)} />
                        <span className="text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Notes contrat</p>
                  <textarea value={subForm.notes} onChange={e => setSubForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes sur le contrat..." className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none resize-none h-16" />
                </div>
              </div>
            )}
          </div>

          {/* Bookings history */}
          {selectedClient.bookings.length > 0 && (
            <div className="card-surface p-4">
              <h3 className="font-semibold text-sm mb-3">Historique RDV</h3>
              <div className="space-y-2">
                {selectedClient.bookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl text-sm">
                    <div>
                      <p>📅 {b.date} à {b.time}</p>
                      {b.besoin && <p className="text-xs text-muted-foreground mt-0.5">{b.besoin}</p>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-visibility/20 text-visibility" : b.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-conversion/20 text-conversion"}`}>
                      {b.status === "confirmed" ? "Confirmé" : b.status === "cancelled" ? "Annulé" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes history */}
          <div className="card-surface p-4">
            <h3 className="font-semibold text-sm mb-3">Notes ({notes.length})</h3>
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune note</p>
            ) : (
              <div className="space-y-2">
                {notes.map((n: any) => (
                  <div key={n.id} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm">{n.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientsTab;
