import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Clock, Phone, Mail, MessageSquare, TrendingUp, Users, Calendar, CreditCard, AlertTriangle, ArrowUpRight, ArrowDownRight, ExternalLink, FileText, Send } from "lucide-react";

interface AdminDashboardTabProps {
  leads: any[];
  bookings: any[];
  products: any[];
  diagnostics: any[];
  subscriptions?: any[];
  payments?: any[];
  onNavigate?: (tab: string) => void;
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

const AdminDashboardTab = ({ leads, bookings, products, diagnostics, subscriptions = [], payments = [], onNavigate }: AdminDashboardTabProps) => {
  const [followUps, setFollowUps] = useState<any[]>([]);

  useEffect(() => {
    const fetchFollowUps = async () => {
      const { data } = await supabase
        .from("follow_ups")
        .select("*, audit_requests!inner(prenom, nom, email)")
        .eq("status", "pending")
        .order("scheduled_at", { ascending: true })
        .limit(8);
      if (data) setFollowUps(data);
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

  const pipeline = useMemo(() => {
    const map: Record<string, number> = { nouveau: 0, "contacté": 0, "qualifié": 0, converti: 0, perdu: 0 };
    leads.forEach((l: any) => { const s = l.status || "nouveau"; if (s in map) map[s]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

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

  const bySector = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l: any) => { map[l.secteur] = (map[l.secteur] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
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

  const isOverdue = (date: string) => new Date(date) < new Date();
  const isToday = (date: string) => new Date(date).toDateString() === new Date().toDateString();
  const typeIcon = (t: string) => t === "email" ? <Mail className="size-3.5" /> : t === "call" ? <Phone className="size-3.5" /> : <MessageSquare className="size-3.5" />;
  const urgentFollowUps = followUps.filter((f: any) => isOverdue(f.scheduled_at) || isToday(f.scheduled_at)).length;

  const overdueFollowUps = followUps.filter((f: any) => isOverdue(f.scheduled_at));
  const todayFollowUps = followUps.filter((f: any) => isToday(f.scheduled_at) && !isOverdue(f.scheduled_at));
  const newLeadsRecent = leads.filter((l: any) => {
    const h = (Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60);
    return h < 24 && (l.status || "nouveau") === "nouveau";
  });
  const pendingBookings = bookings.filter((b: any) => b.status === "pending");

  const notifications = [
    ...overdueFollowUps.map((f: any) => ({
      type: "danger" as const,
      icon: <AlertTriangle className="size-4" />,
      title: `Relance en retard — ${(f as any).audit_requests?.prenom} ${(f as any).audit_requests?.nom}`,
      sub: `Prévue le ${new Date(f.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${new Date(f.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      id: f.id,
      action: () => onNavigate?.("leads"),
      actionLabel: "Voir le lead",
    })),
    ...newLeadsRecent.map((l: any) => ({
      type: "info" as const,
      icon: <Users className="size-4" />,
      title: `Nouveau lead — ${l.prenom} ${l.nom}`,
      sub: `${l.secteur} • ${l.email}`,
      id: l.id,
      action: () => onNavigate?.("leads"),
      actionLabel: "Ouvrir le pipeline",
    })),
    ...todayFollowUps.map((f: any) => ({
      type: "warning" as const,
      icon: <Clock className="size-4" />,
      title: `Relance aujourd'hui — ${(f as any).audit_requests?.prenom} ${(f as any).audit_requests?.nom}`,
      sub: `À ${new Date(f.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} • ${f.type}`,
      id: f.id,
      action: () => onNavigate?.("leads"),
      actionLabel: "Voir le lead",
    })),
    ...pendingBookings.slice(0, 3).map((b: any) => ({
      type: "warning" as const,
      icon: <Calendar className="size-4" />,
      title: `RDV en attente — ${b.prenom} ${b.nom}`,
      sub: `${b.date} à ${b.time}`,
      id: b.id,
      action: () => onNavigate?.("bookings"),
      actionLabel: "Voir les RDV",
    })),
  ];

  const notifStyles = {
    danger: { bg: "bg-destructive/5", border: "border-destructive/20", iconBg: "bg-destructive/15", iconText: "text-destructive", badge: "bg-destructive/15 text-destructive" },
    warning: { bg: "bg-conversion/5", border: "border-conversion/20", iconBg: "bg-conversion/15", iconText: "text-conversion", badge: "bg-conversion/15 text-conversion" },
    info: { bg: "bg-blue-500/5", border: "border-blue-500/20", iconBg: "bg-blue-500/15", iconText: "text-blue-400", badge: "bg-blue-500/15 text-blue-400" },
  };

  return (
    <div className="space-y-6">
      {/* Notification Center */}
      {notifications.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Centre de notifications — {notifications.length} action{notifications.length > 1 ? "s" : ""} requise{notifications.length > 1 ? "s" : ""}
            </h3>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {notifications.slice(0, 6).map((n) => {
              const s = notifStyles[n.type];
              return (
                <button key={n.id} onClick={n.action}
                  className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:scale-[1.01] cursor-pointer text-left w-full group`}>
                  <div className={`w-9 h-9 rounded-lg ${s.iconBg} ${s.iconText} flex items-center justify-center flex-shrink-0`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{n.sub}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${s.badge}`}>
                      {n.type === "danger" ? "Urgent" : n.type === "warning" ? "À traiter" : "Nouveau"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 group-hover:text-foreground flex items-center gap-0.5 transition-colors">
                      {n.actionLabel} <ExternalLink className="size-2.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Welcome + today highlight */}
      {todayLeads > 0 && notifications.length === 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-3 flex items-center gap-3 animate-fade-in">
          <ArrowUpRight className="size-5 text-primary" />
          <p className="text-sm"><span className="font-semibold text-primary">{todayLeads} nouveau{todayLeads > 1 ? "x" : ""} lead{todayLeads > 1 ? "s" : ""}</span> aujourd'hui</p>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Leads", value: leads.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Conversion", value: `${convRate}%`, icon: TrendingUp, color: "text-conversion", bg: "bg-conversion/10" },
          { label: "RDV confirmés", value: confirmedBookings, icon: Calendar, color: "text-visibility", bg: "bg-visibility/10" },
          { label: "MRR", value: `${totalMRR.toLocaleString("fr-FR")}€`, icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
          { label: "Hébergés", value: hostingCount, icon: TrendingUp, color: "text-visibility", bg: "bg-visibility/10" },
          { label: "Relances", value: urgentFollowUps, icon: Clock, color: urgentFollowUps > 0 ? "text-conversion" : "text-muted-foreground", bg: urgentFollowUps > 0 ? "bg-conversion/10" : "bg-secondary" },
          { label: "Alertes paie.", value: paymentAlerts, icon: AlertTriangle, color: paymentAlerts > 0 ? "text-destructive" : "text-muted-foreground", bg: paymentAlerts > 0 ? "bg-destructive/10" : "bg-secondary" },
        ].map(k => (
          <div key={k.label} className="card-surface p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center`}>
                <k.icon className={`size-3.5 ${k.color}`} />
              </div>
              <span className="text-[11px] text-muted-foreground leading-tight">{k.label}</span>
            </div>
            <p className={`text-xl font-extrabold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
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
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: COLORS.muted }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="leads" stroke={COLORS.primary} fill="url(#gradLead)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Entonnoir de conversion</h3>
          <div className="space-y-2.5">
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
                        <span className="text-[10px] text-destructive flex items-center gap-0.5"><ArrowDownRight className="size-2.5" />-{dropOff}%</span>
                      )}
                    </div>
                  </div>
                  <div className="h-5 bg-secondary/50 rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: stage.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Répartition par secteur</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={bySector} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
              <XAxis type="number" tick={{ fontSize: 10, fill: COLORS.muted }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} width={80} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {pipeline.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS.muted} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Follow-ups + Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Relances à venir</h3>
            <span className="text-[10px] text-muted-foreground">{followUps.length} programmée{followUps.length > 1 ? "s" : ""}</span>
          </div>
          {followUps.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Aucune relance programmée</p>
          ) : (
            <div className="space-y-2">
              {followUps.map((f: any) => {
                const lead = (f as any).audit_requests;
                const overdue = isOverdue(f.scheduled_at);
                const today = isToday(f.scheduled_at);
                return (
                  <div key={f.id} className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${overdue ? "bg-destructive/5 border border-destructive/15" : today ? "bg-conversion/5 border border-conversion/15" : "bg-secondary/30"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? "bg-destructive/15 text-destructive" : today ? "bg-conversion/15 text-conversion" : "bg-primary/15 text-primary"}`}>
                      {typeIcon(f.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lead?.prenom} {lead?.nom}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(f.scheduled_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} à {new Date(f.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {overdue && <span className="text-[10px] font-semibold text-destructive px-2 py-0.5 rounded-full bg-destructive/15">En retard</span>}
                    {today && !overdue && <span className="text-[10px] font-semibold text-conversion px-2 py-0.5 rounded-full bg-conversion/15">Aujourd'hui</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Activité récente</h3>
          <div className="space-y-0.5">
            {leads.slice(0, 8).map((l: any) => (
              <div key={l.id} className="flex justify-between items-center py-2.5 text-sm border-b border-border/10 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[l.status || "nouveau"] || "#3b82f6" }} />
                  <span className="font-medium">{l.prenom} {l.nom}</span>
                  <span className="text-[11px] text-muted-foreground">— {l.secteur}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{new Date(l.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTab;
