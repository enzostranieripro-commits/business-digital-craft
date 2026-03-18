import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Server, AlertTriangle, CheckCircle, XCircle, CreditCard, Globe,
  Search, Bell, TrendingUp, Clock, ChevronRight, X, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface AdminHostingTabProps {
  subscriptions: any[];
  leads: any[];
  payments?: any[];
  fetchAll: () => void;
}

const PAYMENT_STATUSES = [
  { value: "a_jour", label: "À jour", color: "bg-visibility/15 text-visibility", icon: CheckCircle },
  { value: "retard", label: "En retard", color: "bg-conversion/15 text-conversion", icon: Clock },
  { value: "impaye", label: "Impayé", color: "bg-destructive/15 text-destructive", icon: XCircle },
  { value: "suspendu", label: "Suspendu", color: "bg-muted/50 text-muted-foreground", icon: EyeOff },
];

const OFFER_COLORS: Record<string, string> = {
  "Visibilité": "hsl(158, 60%, 48%)",
  "Autorité": "hsl(265, 89%, 60%)",
  "Conversion": "hsl(35, 85%, 56%)",
};

const PIE_COLORS = ["hsl(158, 60%, 48%)", "hsl(265, 89%, 60%)", "hsl(35, 85%, 56%)", "hsl(215, 20%, 55%)"];
const STATUS_PIE_COLORS = ["hsl(158, 60%, 48%)", "hsl(35, 85%, 56%)", "hsl(0, 84%, 60%)", "hsl(215, 20%, 55%)"];

const AdminHostingTab = ({ subscriptions, leads, payments = [], fetchAll }: AdminHostingTabProps) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  const enriched = useMemo(() => {
    return subscriptions.map((s: any) => {
      const lead = leads.find((l: any) => l.id === s.lead_id);
      return { ...s, lead };
    });
  }, [subscriptions, leads]);

  const filtered = enriched.filter((s: any) => {
    const matchSearch = !search || `${s.lead?.prenom} ${s.lead?.nom} ${s.lead?.email} ${s.hosting_domain || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || s.payment_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalHosted = enriched.filter((s: any) => s.hosting_included).length;
  const totalAbonnements = enriched.filter((s: any) => s.payment_type === "abonnement").length;
  const totalMRR = enriched
    .filter((s: any) => s.payment_type === "abonnement" && s.payment_status !== "suspendu")
    .reduce((acc: number, s: any) => acc + (Number(s.monthly_amount) || 0), 0);
  const retards = enriched.filter((s: any) => s.payment_status === "retard" || s.payment_status === "impaye").length;
  const suspendus = enriched.filter((s: any) => s.payment_status === "suspendu").length;

  const byOffer = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach((s: any) => { map[s.offer_level] = (map[s.offer_level] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const byPaymentStatus = useMemo(() => {
    return PAYMENT_STATUSES.map(ps => ({
      name: ps.label,
      value: enriched.filter((s: any) => s.payment_status === ps.value).length,
    })).filter(d => d.value > 0);
  }, [enriched]);

  const revenueByOffer = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.filter((s: any) => s.payment_type === "abonnement")
      .forEach((s: any) => { map[s.offer_level] = (map[s.offer_level] || 0) + (Number(s.monthly_amount) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const updatePaymentStatus = async (id: string, status: string) => {
    const sub = enriched.find((s: any) => s.id === id);
    const updateData: any = { payment_status: status, updated_at: new Date().toISOString() };
    if (status === "a_jour") {
      const now = new Date();
      const nextPayment = new Date(now);
      nextPayment.setMonth(nextPayment.getMonth() + 1);
      updateData.last_payment_at = now.toISOString();
      updateData.next_payment_at = nextPayment.toISOString();
      // Log payment in history
      if (sub) {
        await supabase.from("payment_history").insert({
          subscription_id: id,
          lead_id: sub.lead_id,
          amount: Number(sub.monthly_amount) || 0,
          payment_method: "virement",
          payment_date: now.toISOString(),
        } as any);
      }
    }
    await supabase.from("client_subscriptions").update(updateData).eq("id", id);
    fetchAll();
    if (selectedSub?.id === id) setSelectedSub({ ...selectedSub, ...updateData });
    if (status === "a_jour") toast("✅ Paiement enregistré dans l'historique");
    else if (status === "suspendu") toast("⚠️ Accès suspendu");
    else toast(`Statut → ${PAYMENT_STATUSES.find(p => p.value === status)?.label}`);
  };

  const alertClients = enriched.filter((s: any) => s.payment_status === "retard" || s.payment_status === "impaye");

  const statusBadge = (status: string) => {
    const ps = PAYMENT_STATUSES.find(p => p.value === status);
    if (!ps) return null;
    const Icon = ps.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${ps.color}`}>
        <Icon className="size-3" />{ps.label}
      </span>
    );
  };

  const offerBadge = (offer: string) => (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
      offer === "Visibilité" ? "bg-visibility/15 text-visibility" :
      offer === "Autorité" ? "bg-primary/15 text-primary" :
      "bg-conversion/15 text-conversion"
    }`}>{offer}</span>
  );

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      {alertClients.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/15 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="size-4 text-destructive animate-pulse" />
            <h3 className="font-semibold text-destructive text-sm">
              {alertClients.length} client{alertClients.length > 1 ? "s" : ""} en retard de paiement
            </h3>
          </div>
          <div className="space-y-2">
            {alertClients.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between bg-background/50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="size-4 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{s.lead?.prenom} {s.lead?.nom}</p>
                    <p className="text-[11px] text-muted-foreground">{s.hosting_domain || s.lead?.email} • {s.monthly_amount}€/mois</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(s.payment_status)}
                  <Button size="sm" variant="outline" className="border-visibility/20 text-visibility hover:bg-visibility/10 text-[11px] h-7" onClick={() => updatePaymentStatus(s.id, "a_jour")}>
                    <CheckCircle className="size-3 mr-1" />Payé
                  </Button>
                  <Button size="sm" variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10 text-[11px] h-7" onClick={() => updatePaymentStatus(s.id, "suspendu")}>
                    <EyeOff className="size-3 mr-1" />Suspendre
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Clients hébergés", value: totalHosted, icon: Server, color: "text-visibility", bg: "bg-visibility/10" },
          { label: "Abonnements", value: totalAbonnements, icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
          { label: "MRR", value: `${totalMRR.toLocaleString("fr-FR")}€`, icon: TrendingUp, color: "text-conversion", bg: "bg-conversion/10" },
          { label: "Retards", value: retards, icon: AlertTriangle, color: retards > 0 ? "text-destructive" : "text-muted-foreground", bg: retards > 0 ? "bg-destructive/10" : "bg-secondary" },
          { label: "Suspendus", value: suspendus, icon: EyeOff, color: suspendus > 0 ? "text-destructive" : "text-muted-foreground", bg: suspendus > 0 ? "bg-destructive/10" : "bg-secondary" },
        ].map(k => (
          <div key={k.label} className="card-surface p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>
              <k.icon className={`size-4 ${k.color}`} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
              <p className={`text-lg font-extrabold ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Par offre</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={byOffer} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {byOffer.map((entry, i) => <Cell key={i} fill={OFFER_COLORS[entry.name] || PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Statuts paiement</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={byPaymentStatus} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {byPaymentStatus.map((_, i) => <Cell key={i} fill={STATUS_PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Revenus par offre</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueByOffer}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {revenueByOffer.map((entry, i) => <Cell key={i} fill={OFFER_COLORS[entry.name] || PIE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="flex gap-6">
        <div className={`${selectedSub ? "w-1/2" : "w-full"} flex flex-col gap-4 transition-all`}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client, domaine..."
                className="w-full bg-secondary/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-border/20 focus:border-primary/30 transition-colors" />
            </div>
            <div className="flex gap-1">
              <button onClick={() => setFilterStatus(null)}
                className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${!filterStatus ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground"}`}>
                Tous
              </button>
              {PAYMENT_STATUSES.map(ps => (
                <button key={ps.value} onClick={() => setFilterStatus(filterStatus === ps.value ? null : ps.value)}
                  className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${filterStatus === ps.value ? ps.color : "bg-secondary/50 text-muted-foreground"}`}>
                  {ps.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card-surface overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border/20 text-left">
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Client</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Offre</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Type</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Montant</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Hébergement</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Paiement</th>
                  <th className="p-3.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-muted-foreground text-sm">Aucun contrat trouvé</td></tr>
                ) : filtered.map((s: any) => (
                  <tr key={s.id} onClick={() => setSelectedSub(s)}
                    className={`border-b border-border/10 cursor-pointer transition-colors ${selectedSub?.id === s.id ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                    <td className="p-3.5">
                      <p className="font-medium text-[13px]">{s.lead?.prenom} {s.lead?.nom}</p>
                      <p className="text-[11px] text-muted-foreground">{s.lead?.email}</p>
                    </td>
                    <td className="p-3.5">{offerBadge(s.offer_level)}</td>
                    <td className="p-3.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${s.payment_type === "abonnement" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {s.payment_type === "abonnement" ? "Abo." : "Unique"}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold">{s.monthly_amount}€{s.payment_type === "abonnement" ? "/m" : ""}</td>
                    <td className="p-3.5">
                      {s.hosting_included ? (
                        <span className="flex items-center gap-1 text-visibility text-[11px] font-medium">
                          <Globe className="size-3" />{s.hosting_domain || "Oui"}
                        </span>
                      ) : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3.5">{statusBadge(s.payment_status)}</td>
                    <td className="p-3.5"><ChevronRight className="size-4 text-muted-foreground/40" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail */}
        {selectedSub && (
          <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedSub.lead?.prenom} {selectedSub.lead?.nom}</h2>
              <button onClick={() => setSelectedSub(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary"><X className="size-4" /></button>
            </div>

            <div className="card-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Détails du contrat</h3>
                {statusBadge(selectedSub.payment_status)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-[11px] text-muted-foreground mb-1">Offre</p>{offerBadge(selectedSub.offer_level)}</div>
                <div><p className="text-[11px] text-muted-foreground mb-1">Type</p><p className="font-medium">{selectedSub.payment_type === "abonnement" ? "Abonnement" : "Achat unique"}</p></div>
                <div><p className="text-[11px] text-muted-foreground mb-1">Montant</p><p className="font-extrabold text-lg">{selectedSub.monthly_amount}€{selectedSub.payment_type === "abonnement" ? "/mois" : ""}</p></div>
                <div><p className="text-[11px] text-muted-foreground mb-1">Hébergement</p>
                  {selectedSub.hosting_included ? (
                    <div className="flex items-center gap-1 text-visibility font-medium"><Globe className="size-3.5" />{selectedSub.hosting_domain || "Inclus"}</div>
                  ) : <p className="text-muted-foreground">Non inclus</p>}
                </div>
                {selectedSub.last_payment_at && (
                  <div><p className="text-[11px] text-muted-foreground mb-1">Dernier paiement</p><p className="font-medium">{new Date(selectedSub.last_payment_at).toLocaleDateString("fr-FR")}</p></div>
                )}
                {selectedSub.next_payment_at && (
                  <div><p className="text-[11px] text-muted-foreground mb-1">Prochain paiement</p>
                    <p className={`font-medium ${new Date(selectedSub.next_payment_at) < new Date() ? "text-destructive" : ""}`}>
                      {new Date(selectedSub.next_payment_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedSub.options?.length > 0 && (
              <div className="card-surface p-5">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Options souscrites</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSub.options.map((opt: string) => (
                    <span key={opt} className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full">{opt}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="card-surface p-5">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Statut paiement</h3>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_STATUSES.map(ps => (
                  <button key={ps.value} onClick={() => updatePaymentStatus(selectedSub.id, ps.value)}
                    className={`text-[11px] px-3 py-2 rounded-xl font-medium transition-all ${selectedSub.payment_status === ps.value ? ps.color + " ring-2 ring-offset-2 ring-offset-background ring-current" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedSub.notes && (
              <div className="card-surface p-5">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{selectedSub.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHostingTab;
