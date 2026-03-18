import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, AlertTriangle, ArrowUpRight } from "lucide-react";

interface Props {
  subscriptions: any[];
  payments: any[];
  leads: any[];
  fetchAll: () => void;
}

const COLORS = {
  primary: "hsl(265, 89%, 60%)",
  visibility: "hsl(158, 60%, 48%)",
  conversion: "hsl(35, 85%, 56%)",
  destructive: "hsl(0, 84%, 60%)",
  muted: "hsl(215, 20%, 55%)",
};

const OFFER_COLORS: Record<string, string> = {
  "Visibilité": COLORS.visibility,
  "Autorité": COLORS.primary,
  "Conversion": COLORS.conversion,
};

const AdminFinanceTab = ({ subscriptions, payments, leads, fetchAll }: Props) => {
  // Current MRR
  const activeSubs = subscriptions.filter(s => s.payment_type === "abonnement" && s.payment_status !== "suspendu");
  const currentMRR = activeSubs.reduce((acc, s) => acc + (Number(s.monthly_amount) || 0), 0);
  const ARR = currentMRR * 12;

  // Total revenue collected
  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  // One-time revenue
  const oneTimeRevenue = subscriptions
    .filter(s => s.payment_type === "achat_unique")
    .reduce((acc, s) => acc + (Number(s.monthly_amount) || 0), 0);

  // Churn: suspended / total abonnements
  const totalAbonnements = subscriptions.filter(s => s.payment_type === "abonnement").length;
  const suspendedCount = subscriptions.filter(s => s.payment_status === "suspendu").length;
  const churnRate = totalAbonnements > 0 ? Math.round((suspendedCount / totalAbonnements) * 100) : 0;

  // LTV: average monthly amount * average client duration (simplified)
  const avgMonthly = activeSubs.length > 0 ? activeSubs.reduce((acc, s) => acc + (Number(s.monthly_amount) || 0), 0) / activeSubs.length : 0;
  const avgLTV = avgMonthly * 12; // Assuming avg 12 months

  // Payment alerts
  const retards = subscriptions.filter(s => s.payment_status === "retard" || s.payment_status === "impaye").length;
  const retardsAmount = subscriptions
    .filter(s => s.payment_status === "retard" || s.payment_status === "impaye")
    .reduce((acc, s) => acc + (Number(s.monthly_amount) || 0), 0);

  // Revenue over time (last 12 months from payments)
  const revenueOverTime = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    payments.forEach((p: any) => {
      const d = new Date(p.payment_date);
      const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      if (key in months) months[key] += Number(p.amount) || 0;
    });
    // Add projected MRR for future months
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
  }, [payments]);

  // Revenue by offer
  const revenueByOffer = useMemo(() => {
    const map: Record<string, number> = {};
    subscriptions
      .filter(s => s.payment_type === "abonnement" && s.payment_status !== "suspendu")
      .forEach(s => { map[s.offer_level] = (map[s.offer_level] || 0) + (Number(s.monthly_amount) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  // Recent payments
  const recentPayments = useMemo(() => {
    return payments.slice(0, 10).map((p: any) => {
      const lead = leads.find(l => l.id === p.lead_id);
      return { ...p, lead };
    });
  }, [payments, leads]);

  return (
    <div className="space-y-6">
      {/* KPIs Row 1: Revenue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "MRR (Mensuel Récurrent)", value: `${currentMRR.toLocaleString("fr-FR")}€`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { label: "ARR (Annuel Projeté)", value: `${ARR.toLocaleString("fr-FR")}€`, icon: TrendingUp, color: "text-visibility", bg: "bg-visibility/10" },
          { label: "Total encaissé", value: `${totalCollected.toLocaleString("fr-FR")}€`, icon: CreditCard, color: "text-conversion", bg: "bg-conversion/10" },
          { label: "Achats uniques", value: `${oneTimeRevenue.toLocaleString("fr-FR")}€`, icon: DollarSign, color: "text-muted-foreground", bg: "bg-secondary" },
        ].map(k => (
          <div key={k.label} className="card-surface p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl ${k.bg} flex items-center justify-center`}>
                <k.icon className={`size-4 ${k.color}`} />
              </div>
              <span className="text-[11px] text-muted-foreground">{k.label}</span>
            </div>
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* KPIs Row 2: Health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Taux de churn", value: `${churnRate}%`, icon: TrendingDown, color: churnRate > 10 ? "text-destructive" : "text-visibility", bg: churnRate > 10 ? "bg-destructive/10" : "bg-visibility/10" },
          { label: "LTV moyenne", value: `${Math.round(avgLTV).toLocaleString("fr-FR")}€`, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Impayés en cours", value: retards, icon: AlertTriangle, color: retards > 0 ? "text-destructive" : "text-muted-foreground", bg: retards > 0 ? "bg-destructive/10" : "bg-secondary" },
          { label: "Montant à risque", value: `${retardsAmount.toLocaleString("fr-FR")}€`, icon: AlertTriangle, color: retardsAmount > 0 ? "text-destructive" : "text-muted-foreground", bg: retardsAmount > 0 ? "bg-destructive/10" : "bg-secondary" },
        ].map(k => (
          <div key={k.label} className="card-surface p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl ${k.bg} flex items-center justify-center`}>
                <k.icon className={`size-4 ${k.color}`} />
              </div>
              <span className="text-[11px] text-muted-foreground">{k.label}</span>
            </div>
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Revenus encaissés — 12 derniers mois</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueOverTime}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.visibility} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.visibility} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }}
                formatter={(value: any) => [`${Number(value).toLocaleString("fr-FR")}€`, "Revenus"]} />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.visibility} fill="url(#gradRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">MRR par offre</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByOffer}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }}
                formatter={(value: any) => [`${Number(value).toLocaleString("fr-FR")}€/mois`, "MRR"]} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {revenueByOffer.map((entry, i) => <Cell key={i} fill={OFFER_COLORS[entry.name] || COLORS.muted} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent payments table */}
      <div className="card-surface overflow-hidden">
        <div className="p-5 border-b border-border/20">
          <h3 className="font-semibold text-sm">Derniers paiements enregistrés</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              <th className="p-4 text-left text-[11px] text-muted-foreground font-medium">Date</th>
              <th className="p-4 text-left text-[11px] text-muted-foreground font-medium">Client</th>
              <th className="p-4 text-left text-[11px] text-muted-foreground font-medium">Montant</th>
              <th className="p-4 text-left text-[11px] text-muted-foreground font-medium">Méthode</th>
              <th className="p-4 text-left text-[11px] text-muted-foreground font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Aucun paiement enregistré</td></tr>
            ) : recentPayments.map((p: any) => (
              <tr key={p.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                <td className="p-4 text-xs text-muted-foreground">{new Date(p.payment_date).toLocaleDateString("fr-FR")}</td>
                <td className="p-4">
                  <p className="font-medium text-[13px]">{p.lead?.prenom} {p.lead?.nom}</p>
                  <p className="text-[11px] text-muted-foreground">{p.lead?.email}</p>
                </td>
                <td className="p-4 font-semibold text-visibility">{Number(p.amount).toLocaleString("fr-FR")}€</td>
                <td className="p-4 text-xs text-muted-foreground capitalize">{p.payment_method}</td>
                <td className="p-4 text-xs text-muted-foreground">{p.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Répartition contrats</h3>
          <div className="space-y-2">
            {["Visibilité", "Autorité", "Conversion"].map(offer => {
              const count = subscriptions.filter(s => s.offer_level === offer).length;
              const total = subscriptions.length || 1;
              return (
                <div key={offer} className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, backgroundColor: OFFER_COLORS[offer] }} />
                  </div>
                  <span className="text-[11px] font-medium w-20">{offer}</span>
                  <span className="text-[11px] font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Type de contrat</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Abonnements</span>
                <span className="text-sm font-bold text-primary">{subscriptions.filter(s => s.payment_type === "abonnement").length}</span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${totalAbonnements > 0 ? (subscriptions.filter(s => s.payment_type === "abonnement").length / (subscriptions.length || 1)) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Achats uniques</span>
                <span className="text-sm font-bold text-conversion">{subscriptions.filter(s => s.payment_type === "achat_unique").length}</span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div className="h-full bg-conversion rounded-full" style={{ width: `${(subscriptions.filter(s => s.payment_type === "achat_unique").length / (subscriptions.length || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Santé financière</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Clients à jour</span>
              <span className="text-sm font-bold text-visibility">{subscriptions.filter(s => s.payment_status === "a_jour").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">En retard</span>
              <span className="text-sm font-bold text-conversion">{subscriptions.filter(s => s.payment_status === "retard").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Impayés</span>
              <span className="text-sm font-bold text-destructive">{subscriptions.filter(s => s.payment_status === "impaye").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Suspendus</span>
              <span className="text-sm font-bold text-muted-foreground">{suspendedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceTab;
