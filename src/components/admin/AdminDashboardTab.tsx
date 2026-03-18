import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, FunnelChart, Funnel, LabelList } from "recharts";
import { Clock, Phone, Mail, MessageSquare, ArrowRight } from "lucide-react";

interface AdminDashboardTabProps {
  leads: any[];
  bookings: any[];
  products: any[];
  diagnostics: any[];
  subscriptions?: any[];
}

const COLORS = {
  primary: "hsl(265, 89%, 60%)",
  visibility: "hsl(158, 60%, 48%)",
  conversion: "hsl(35, 85%, 56%)",
  destructive: "hsl(0, 84%, 60%)",
  muted: "hsl(215, 20%, 55%)",
};

const STATUS_COLORS: Record<string, string> = {
  nouveau: "#3b82f6",
  "contacté": "#f59e0b",
  "qualifié": COLORS.primary,
  converti: COLORS.visibility,
  perdu: COLORS.destructive,
};

const FUNNEL_COLORS = ["#3b82f6", "#f59e0b", COLORS.primary, COLORS.visibility];

const AdminDashboardTab = ({ leads, bookings, products, diagnostics, subscriptions = [] }: AdminDashboardTabProps) => {
  const [followUps, setFollowUps] = useState<any[]>([]);

  useEffect(() => {
    const fetchFollowUps = async () => {
      const { data } = await supabase
        .from("follow_ups" as any)
        .select("*, audit_requests!inner(prenom, nom, email)" as any)
        .eq("status", "pending")
        .order("scheduled_at", { ascending: true })
        .limit(10);
      if (data) setFollowUps(data as any[]);
    };
    fetchFollowUps();
  }, [leads]);

  const leadsOverTime = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })] = 0;
    }
    leads.forEach((l: any) => {
      const key = new Date(l.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, leads: count }));
  }, [leads]);

  const bySector = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l: any) => { map[l.secteur] = (map[l.secteur] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [leads]);

  const pipeline = useMemo(() => {
    const map: Record<string, number> = { nouveau: 0, "contacté": 0, "qualifié": 0, converti: 0, perdu: 0 };
    leads.forEach((l: any) => { const s = l.status || "nouveau"; if (s in map) map[s]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Conversion funnel (excluding "perdu")
  const funnelData = useMemo(() => {
    const stages = ["nouveau", "contacté", "qualifié", "converti"];
    const counts: Record<string, number> = { nouveau: 0, "contacté": 0, "qualifié": 0, converti: 0 };
    leads.forEach((l: any) => {
      const s = l.status || "nouveau";
      const idx = stages.indexOf(s);
      if (idx >= 0) {
        for (let i = 0; i <= idx; i++) counts[stages[i]]++;
      }
    });
    return stages.map((s, i) => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value: counts[s],
      fill: FUNNEL_COLORS[i],
    }));
  }, [leads]);

  const convRate = leads.length > 0 ? Math.round((leads.filter((l: any) => l.status === "converti").length / leads.length) * 100) : 0;
  const confirmedBookings = bookings.filter((b: any) => b.status === "confirmed").length;
  const todayLeads = leads.filter((l: any) => new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const PIE_COLORS = [COLORS.primary, COLORS.visibility, COLORS.conversion, "#3b82f6", COLORS.muted, "#ec4899", "#8b5cf6", "#06b6d4"];

  const totalMRR = subscriptions
    .filter((s: any) => s.payment_type === "abonnement" && s.payment_status !== "suspendu")
    .reduce((acc: number, s: any) => acc + (Number(s.monthly_amount) || 0), 0);
  const hostingCount = subscriptions.filter((s: any) => s.hosting_included).length;
  const paymentAlerts = subscriptions.filter((s: any) => s.payment_status === "retard" || s.payment_status === "impaye").length;

  const typeIcon = (t: string) => t === "email" ? <Mail className="size-3.5" /> : t === "call" ? <Phone className="size-3.5" /> : <MessageSquare className="size-3.5" />;

  const isOverdue = (date: string) => new Date(date) < new Date();
  const isToday = (date: string) => new Date(date).toDateString() === new Date().toDateString();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        {todayLeads > 0 && <span className="text-visibility font-medium"> • {todayLeads} nouveau{todayLeads > 1 ? "x" : ""} lead{todayLeads > 1 ? "s" : ""} aujourd'hui</span>}
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
        {[
          { label: "Total Leads", value: leads.length, color: "text-primary" },
          { label: "Taux conversion", value: `${convRate}%`, color: "text-conversion" },
          { label: "RDV confirmés", value: confirmedBookings, color: "text-visibility" },
          { label: "MRR", value: `${totalMRR.toLocaleString("fr-FR")}€`, color: "text-primary" },
          { label: "Hébergés", value: hostingCount, color: "text-visibility" },
          { label: "Relances", value: followUps.filter((f: any) => isOverdue(f.scheduled_at) || isToday(f.scheduled_at)).length, color: "text-destructive" },
          { label: "Alertes paiement", value: paymentAlerts, color: paymentAlerts > 0 ? "text-destructive" : "text-muted-foreground" },
        ].map(k => (
          <div key={k.label} className="card-surface p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Leads — 30 derniers jours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={leadsOverTime}>
              <defs>
                <linearGradient id="gradLead" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="leads" stroke={COLORS.primary} fill="url(#gradLead)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Entonnoir de conversion</h3>
          <div className="space-y-3">
            {funnelData.map((stage, i) => {
              const maxVal = funnelData[0]?.value || 1;
              const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0;
              const dropOff = i > 0 && funnelData[i - 1].value > 0
                ? Math.round(((funnelData[i - 1].value - stage.value) / funnelData[i - 1].value) * 100)
                : 0;
              return (
                <div key={stage.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{stage.value}</span>
                      {i > 0 && dropOff > 0 && (
                        <span className="text-[10px] text-destructive">-{dropOff}%</span>
                      )}
                    </div>
                  </div>
                  <div className="h-6 bg-secondary/50 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: stage.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Répartition par secteur</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={bySector} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {bySector.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Pipeline commercial</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipeline} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }} width={80} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {pipeline.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS.muted} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Follow-ups calendar + Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming follow-ups */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Relances à venir</h3>
            <Clock className="size-4 text-muted-foreground" />
          </div>
          {followUps.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Aucune relance programmée</p>
          ) : (
            <div className="space-y-2">
              {followUps.map((f: any) => {
                const lead = (f as any).audit_requests;
                const overdue = isOverdue(f.scheduled_at);
                const today = isToday(f.scheduled_at);
                return (
                  <div key={f.id} className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${overdue ? "bg-destructive/10 border border-destructive/20" : today ? "bg-conversion/10 border border-conversion/20" : "bg-secondary/30"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? "bg-destructive/20 text-destructive" : today ? "bg-conversion/20 text-conversion" : "bg-primary/20 text-primary"}`}>
                      {typeIcon(f.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {lead?.prenom} {lead?.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(f.scheduled_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} à {new Date(f.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {overdue && <span className="text-[10px] font-semibold text-destructive px-2 py-0.5 rounded-full bg-destructive/20">En retard</span>}
                      {today && !overdue && <span className="text-[10px] font-semibold text-conversion px-2 py-0.5 rounded-full bg-conversion/20">Aujourd'hui</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Activité récente</h3>
          <div className="space-y-1">
            {leads.slice(0, 8).map((l: any) => (
              <div key={l.id} className="flex justify-between py-2 text-sm border-b border-border/10 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[l.status || "nouveau"] || "#3b82f6" }} />
                  <span>{l.prenom} {l.nom}</span>
                  <span className="text-xs text-muted-foreground">— {l.secteur}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTab;
