import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

interface AdminDashboardTabProps {
  leads: any[];
  bookings: any[];
  products: any[];
  diagnostics: any[];
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

const AdminDashboardTab = ({ leads, bookings, products, diagnostics }: AdminDashboardTabProps) => {
  // Leads over last 30 days
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

  // Leads by sector
  const bySector = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l: any) => { map[l.secteur] = (map[l.secteur] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [leads]);

  // Pipeline breakdown
  const pipeline = useMemo(() => {
    const map: Record<string, number> = { nouveau: 0, "contacté": 0, "qualifié": 0, converti: 0, perdu: 0 };
    leads.forEach((l: any) => { const s = l.status || "nouveau"; if (s in map) map[s]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const convRate = leads.length > 0 ? Math.round((leads.filter((l: any) => l.status === "converti").length / leads.length) * 100) : 0;
  const confirmedBookings = bookings.filter((b: any) => b.status === "confirmed").length;
  const todayLeads = leads.filter((l: any) => new Date(l.created_at).toDateString() === new Date().toDateString()).length;

  const PIE_COLORS = [COLORS.primary, COLORS.visibility, COLORS.conversion, "#3b82f6", COLORS.muted, "#ec4899", "#8b5cf6", "#06b6d4"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        {todayLeads > 0 && <span className="text-visibility font-medium"> • {todayLeads} nouveau{todayLeads > 1 ? "x" : ""} lead{todayLeads > 1 ? "s" : ""} aujourd'hui</span>}
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Leads", value: leads.length, color: "text-primary" },
          { label: "Pipeline actif", value: leads.filter((l: any) => !["converti", "perdu"].includes(l.status || "nouveau")).length, color: "text-blue-400" },
          { label: "Taux conversion", value: `${convRate}%`, color: "text-conversion" },
          { label: "RDV confirmés", value: confirmedBookings, color: "text-visibility" },
          { label: "Demandes produits", value: products.length, color: "text-primary" },
        ].map(k => (
          <div key={k.label} className="card-surface p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Leads over time */}
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

        {/* By sector */}
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
      </div>

      {/* Pipeline + Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
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

        {/* Recent activity */}
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Activité récente</h3>
          <div className="space-y-1">
            {leads.slice(0, 8).map((l: any) => (
              <div key={l.id} className="flex justify-between py-2 text-sm border-b border-border/10 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[l.status || "nouveau"] ? "" : "bg-blue-500"}`}
                    style={{ backgroundColor: STATUS_COLORS[l.status || "nouveau"] }} />
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
