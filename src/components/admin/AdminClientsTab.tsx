import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Search, User, Mail, Phone, MapPin, Calendar, TrendingUp, Pencil,
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
  "Maintenance mensuelle", "SEO avancé", "Rédaction de contenu", "Gestion réseaux sociaux",
  "Campagnes publicitaires", "Chatbot IA", "Reporting analytique", "Support prioritaire",
];
const PAYMENT_TYPES = [
  { value: "abonnement", label: "Abonnement + Hébergement" },
  { value: "achat_unique", label: "Achat unique" },
];

const offerColor = (o: string) =>
  o === "Visibilité" ? "bg-visibility/15 text-visibility border-visibility/20" :
  o === "Autorité" ? "bg-primary/15 text-primary border-primary/20" :
  o === "Conversion" ? "bg-conversion/15 text-conversion border-conversion/20" :
  "bg-secondary text-muted-foreground border-border";

const AdminClientsTab = ({ leads, bookings, products, subscriptions, fetchAll }: AdminClientsTabProps) => {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [editingSub, setEditingSub] = useState(false);
  const [offerPricing, setOfferPricing] = useState<Record<string, number>>({ "Visibilité": 297, "Autorité": 497, "Conversion": 797 });
  const [subForm, setSubForm] = useState({
    offer_level: "Visibilité", options: [] as string[], payment_type: "abonnement",
    monthly_amount: 0, hosting_included: false, hosting_domain: "", notes: "",
  });

  useEffect(() => {
    const loadPricing = async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", "offer_pricing").single() as any;
      if (data?.value) setOfferPricing(data.value as any);
    };
    loadPricing();
  }, []);

  const handleOfferChange = (offer: string) => {
    setSubForm(prev => ({ ...prev, offer_level: offer, monthly_amount: offerPricing[offer] || prev.monthly_amount }));
  };

  const clients = useMemo(() => {
    return leads
      .filter((l: any) => l.status === "converti")
      .map((l: any) => {
        const sub = subscriptions.find((s: any) => s.lead_id === l.id);
        return { ...l, subscription: sub || null, bookings: bookings.filter((b: any) => b.email === l.email), products: products.filter((p: any) => p.email === l.email) };
      });
  }, [leads, bookings, products, subscriptions]);

  const filteredClients = clients.filter((c: any) =>
    `${c.prenom} ${c.nom} ${c.email} ${c.secteur} ${c.subscription?.offer_level || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  // KPIs
  const withSub = clients.filter(c => c.subscription).length;
  const withHosting = clients.filter(c => c.subscription?.hosting_included).length;
  const totalValue = clients.reduce((acc, c) => acc + (Number(c.subscription?.monthly_amount) || 0), 0);

  const openClient = async (client: any) => {
    setSelectedClient(client);
    setEditingSub(false);
    if (client.subscription) {
      setSubForm({
        offer_level: client.subscription.offer_level, options: client.subscription.options || [],
        payment_type: client.subscription.payment_type, monthly_amount: client.subscription.monthly_amount,
        hosting_included: client.subscription.hosting_included, hosting_domain: client.subscription.hosting_domain || "",
        notes: client.subscription.notes || "",
      });
    } else {
      setSubForm({ offer_level: "Visibilité", options: [], payment_type: "abonnement", monthly_amount: 0, hosting_included: false, hosting_domain: "", notes: "" });
    }
    const [n, f] = await Promise.all([
      supabase.from("lead_notes").select("*").eq("lead_id", client.id).order("created_at", { ascending: false }),
      supabase.from("follow_ups").select("*").eq("lead_id", client.id).order("scheduled_at", { ascending: false }),
    ]);
    if (n.data) setNotes(n.data);
    if (f.data) setFollowUps(f.data);
  };

  const toggleOption = (opt: string) => {
    setSubForm(prev => ({ ...prev, options: prev.options.includes(opt) ? prev.options.filter(o => o !== opt) : [...prev.options, opt] }));
  };

  const saveSub = async () => {
    if (!selectedClient) return;
    const now = new Date();
    const nextPayment = new Date(now);
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    const payload: any = {
      lead_id: selectedClient.id, offer_level: subForm.offer_level, options: subForm.options,
      payment_type: subForm.payment_type, monthly_amount: subForm.monthly_amount,
      hosting_included: subForm.hosting_included, hosting_domain: subForm.hosting_domain || null,
      notes: subForm.notes || null, updated_at: now.toISOString(),
    };
    if (subForm.payment_type === "abonnement" && !selectedClient.subscription) {
      payload.last_payment_at = now.toISOString();
      payload.next_payment_at = nextPayment.toISOString();
      payload.payment_status = "a_jour";
    }
    if (selectedClient.subscription) {
      await supabase.from("client_subscriptions").update(payload).eq("id", selectedClient.subscription.id);
    } else {
      await supabase.from("client_subscriptions").insert(payload);
    }
    toast("Contrat mis à jour ✓");
    setEditingSub(false);
    fetchAll();
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className={`${selectedClient ? "w-1/2" : "w-full"} flex flex-col transition-all`}>
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Clients convertis", value: clients.length, color: "text-visibility", icon: User },
            { label: "Contrats actifs", value: withSub, color: "text-primary", icon: CreditCard },
            { label: "Valeur totale", value: `${totalValue.toLocaleString("fr-FR")}€`, color: "text-conversion", icon: TrendingUp },
          ].map(k => (
            <div key={k.label} className="card-surface p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${k.color === "text-visibility" ? "bg-visibility/10" : k.color === "text-primary" ? "bg-primary/10" : "bg-conversion/10"} flex items-center justify-center`}>
                <k.icon className={`size-4 ${k.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{k.label}</p>
                <p className={`text-lg font-extrabold ${k.color}`}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..."
            className="w-full bg-secondary/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-border/20 focus:border-primary/30 transition-colors" />
        </div>

        {filteredClients.length === 0 ? (
          <div className="card-surface p-12 text-center flex-1 flex flex-col items-center justify-center">
            <User className="size-12 text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground text-sm">Aucun client converti</p>
            <p className="text-xs text-muted-foreground mt-1">Les leads "Converti" apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1">
            {filteredClients.map((c: any) => (
              <div key={c.id} onClick={() => openClient(c)}
                className={`card-surface p-4 cursor-pointer transition-all hover:border-primary/20 ${selectedClient?.id === c.id ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.subscription ? offerColor(c.subscription.offer_level).split(" ")[0] : "bg-secondary"}`}>
                      <User className={`size-4 ${c.subscription ? offerColor(c.subscription.offer_level).split(" ")[1] : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-[13px]">{c.prenom} {c.nom}</p>
                      <p className="text-[11px] text-muted-foreground">{c.secteur} • {c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.subscription && (
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${offerColor(c.subscription.offer_level)}`}>
                        {c.subscription.offer_level}
                      </span>
                    )}
                    {c.subscription?.hosting_included && <Globe className="size-3.5 text-visibility" />}
                    <ChevronRight className="size-4 text-muted-foreground/40" />
                  </div>
                </div>
                {c.subscription && (
                  <div className="flex gap-3 mt-2.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><CreditCard className="size-2.5" />{c.subscription.monthly_amount}€{c.subscription.payment_type === "abonnement" ? "/mois" : ""}</span>
                    <span className="flex items-center gap-1"><Package className="size-2.5" />{c.subscription.options?.length || 0} option{(c.subscription.options?.length || 0) > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedClient && (
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">{selectedClient.prenom} {selectedClient.nom}</h2>
                <p className="text-xs text-muted-foreground">{selectedClient.secteur}</p>
              </div>
            </div>
            <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary"><X className="size-4" /></button>
          </div>

          {/* Contact */}
          <div className="card-surface p-5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3.5" />{selectedClient.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5" />{selectedClient.telephone || "—"}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-3.5" />{selectedClient.secteur}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-3.5" />Depuis {new Date(selectedClient.created_at).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>

          {/* Contract */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Classification & Contrat</h3>
              {!editingSub ? (
                <Button size="sm" variant="ghost" onClick={() => setEditingSub(true)} className="text-xs h-7">Modifier</Button>
              ) : (
                <Button size="sm" onClick={saveSub} className="text-xs h-7"><Save className="size-3 mr-1" />Enregistrer</Button>
              )}
            </div>

            {!editingSub && selectedClient.subscription ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
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
                    <Globe className="size-4" />Hébergement inclus{selectedClient.subscription.hosting_domain ? ` — ${selectedClient.subscription.hosting_domain}` : ""}
                  </div>
                )}
                {selectedClient.subscription.options?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClient.subscription.options.map((opt: string) => (
                      <span key={opt} className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full">{opt}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : !editingSub ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">Aucun contrat configuré</p>
                <Button size="sm" variant="outline" onClick={() => setEditingSub(true)} className="text-xs">Classifier ce client</Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">Niveau d'offre</p>
                  <div className="flex gap-2">
                    {OFFER_LEVELS.map(o => (
                      <button key={o} onClick={() => handleOfferChange(o)}
                        className={`flex-1 text-sm font-semibold py-3 rounded-xl border-2 transition-all ${subForm.offer_level === o ? offerColor(o) : "border-border/20 text-muted-foreground hover:border-border"}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">Type de contrat</p>
                  <div className="flex gap-2">
                    {PAYMENT_TYPES.map(pt => (
                      <button key={pt.value} onClick={() => setSubForm(prev => ({ ...prev, payment_type: pt.value, hosting_included: pt.value === "abonnement" ? prev.hosting_included : false }))}
                        className={`flex-1 text-xs font-medium py-2.5 rounded-xl border transition-all ${subForm.payment_type === pt.value ? "border-primary bg-primary/10 text-primary" : "border-border/20 text-muted-foreground"}`}>
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">Montant (€{subForm.payment_type === "abonnement" ? "/mois" : ""})</p>
                  <input type="number" value={subForm.monthly_amount} onChange={e => setSubForm(prev => ({ ...prev, monthly_amount: Number(e.target.value) }))}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm outline-none font-semibold border border-border/20" />
                </div>
                {subForm.payment_type === "abonnement" && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={subForm.hosting_included} onCheckedChange={(v) => setSubForm(prev => ({ ...prev, hosting_included: !!v }))} />
                      <span className="text-sm">Hébergement inclus</span>
                    </label>
                    {subForm.hosting_included && (
                      <input value={subForm.hosting_domain} onChange={e => setSubForm(prev => ({ ...prev, hosting_domain: e.target.value }))}
                        placeholder="ex: monsite.fr" className="w-full bg-secondary/50 rounded-xl px-4 py-2 text-sm outline-none border border-border/20" />
                    )}
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">Options</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {OPTIONS_LIST.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Checkbox checked={subForm.options.includes(opt)} onCheckedChange={() => toggleOption(opt)} />
                        <span className="text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-medium">Notes contrat</p>
                  <textarea value={subForm.notes} onChange={e => setSubForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes..." className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm outline-none resize-none h-14 border border-border/20" />
                </div>
              </div>
            )}
          </div>

          {/* Bookings history */}
          {selectedClient.bookings.length > 0 && (
            <div className="card-surface p-5">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Historique RDV</h3>
              <div className="space-y-1.5">
                {selectedClient.bookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl text-sm">
                    <div>
                      <p className="text-xs">📅 {b.date} à {b.time}</p>
                      {b.besoin && <p className="text-[11px] text-muted-foreground mt-0.5">{b.besoin}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-visibility/15 text-visibility" : b.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-conversion/15 text-conversion"}`}>
                      {b.status === "confirmed" ? "Confirmé" : b.status === "cancelled" ? "Annulé" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card-surface p-5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notes ({notes.length})</h3>
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Aucune note</p>
            ) : (
              <div className="space-y-1.5">
                {notes.map((n: any) => (
                  <div key={n.id} className="bg-secondary/20 rounded-lg p-3 border border-border/10">
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
