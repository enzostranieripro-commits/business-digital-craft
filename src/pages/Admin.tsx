import { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft, Phone, ClipboardList, BarChart3, Users, TrendingUp,
  Clock, Eye, MousePointerClick, ChevronLeft, Package, Globe,
  Camera, Zap, ArrowUpRight, Activity, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/* ─────────── Types ─────────── */
interface DiagnosticEntry { answers: string[]; date: string }
interface AuditRequest { nom: string; prenom: string; email: string; telephone: string; secteur: string; besoin: string; createdAt: string }
interface ProductRequest { nom: string; prenom: string; email: string; telephone: string; secteur: string; product: string; createdAt: string }
type TabId = "overview" | "audit_requests" | "diagnostics" | "product_requests";

/* ─────────── Animated counter ─────────── */
const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    setDisplay(0);
    let start = 0;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    ref.current = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); if (ref.current) clearInterval(ref.current); }
      else setDisplay(Math.floor(start));
    }, duration / steps);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [value]);
  return <span>{display}{suffix}</span>;
};

/* ─────────── Animated bar ─────────── */
const Bar = ({ pct, color = "bg-primary" }: { pct: number; color?: string }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="h-2 bg-border rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${width}%` }} />
    </div>
  );
};

/* ─────────── Product family card ─────────── */
const productFamilies = [
  { key: "Site internet", label: "Création Web", icon: Globe, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { key: "Contenu marketing", label: "Contenu Marketing", icon: Camera, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { key: "Automatisation", label: "Automatisation", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
];

/* ─────────── Donut chart ─────────── */
const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (total === 0) return <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>;
  let cumAngle = -90;
  const r = 72; const cx = 90; const cy = 90;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
    cumAngle += angle;
    const x1 = cx + r * Math.cos(startRad); const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad); const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    const path = data.length === 1
      ? `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`
      : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
    return { ...d, path };
  });
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {slices.map((s) => <path key={s.label} d={s.path} fill={s.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r="42" fill="hsl(var(--background))" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="22" fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">demandes</text>
      </svg>
      <div className="flex flex-wrap gap-3 justify-center">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-bold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Main component ─────────── */
const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("overview");
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditRequest | null>(null);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticEntry | null>(null);
  const [productFilter, setProductFilter] = useState<string>("all");

  useEffect(() => {
    setDiagnostics(JSON.parse(localStorage.getItem("diagnostics") || "[]"));
    setAuditRequests(JSON.parse(localStorage.getItem("audit_requests") || "[]"));
    setProductRequests(JSON.parse(localStorage.getItem("product_requests") || "[]"));
  }, []);

  const tabs = [
    { id: "overview" as const, label: "Vue d'ensemble", icon: BarChart3 },
    { id: "audit_requests" as const, label: "Demandes Audits", icon: ClipboardList },
    { id: "diagnostics" as const, label: "Diagnostics", icon: Users },
    { id: "product_requests" as const, label: "Demandes Produits", icon: Package },
  ];

  const totalLeads = auditRequests.length + diagnostics.length;
  const conversionRate = totalLeads > 0 ? Math.round((auditRequests.length / totalLeads) * 100) : 0;
  const todayLeads = auditRequests.filter((r) => new Date(r.createdAt).toDateString() === new Date().toDateString()).length;

  const sectorCounts: Record<string, number> = {};
  [...auditRequests].forEach((item) => {
    const s = item.secteur || "Inconnu";
    sectorCounts[s] = (sectorCounts[s] || 0) + 1;
  });

  const productCountsForDonut = useMemo(() => {
    const filtered = productFilter === "all" ? productRequests : productRequests.filter((p) => p.product === productFilter);
    const counts: Record<string, number> = {};
    filtered.forEach((p) => { counts[p.product] = (counts[p.product] || 0) + 1; });
    return counts;
  }, [productRequests, productFilter]);

  const donutData = productFamilies.map((f, i) => ({
    label: f.label,
    value: productCountsForDonut[f.key] || 0,
    color: ["hsl(210,70%,55%)", "hsl(270,60%,60%)", "hsl(45,90%,55%)"][i],
  }));

  const diagQuestions = ["Secteur d'activité", "Site internet", "Demandes clients", "Réseaux sociaux", "Tâches répétitives"];

  const recentActivity = [...auditRequests.map((a) => ({ type: "Audit", name: `${a.prenom} ${a.nom}`, detail: a.secteur, date: a.createdAt, color: "bg-blue-500/20 text-blue-400" })),
    ...productRequests.map((p) => ({ type: p.product, name: `${p.prenom} ${p.nom}`, detail: p.secteur, date: p.createdAt, color: "bg-primary/20 text-primary" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between backdrop-blur sticky top-0 z-10 bg-background/80">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="size-4 mr-2" /> Retour
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h1 className="text-base font-bold">Dashboard Admin</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Studio Nova — Live</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedAudit(null); setSelectedDiagnostic(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ══════════ OVERVIEW ══════════ */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-400", bg: "from-blue-500/10", suffix: "" },
                { label: "Demandes Audit", value: auditRequests.length, icon: ClipboardList, color: "text-primary", bg: "from-primary/10", suffix: "" },
                { label: "Taux conversion", value: conversionRate, icon: TrendingUp, color: "text-green-400", bg: "from-green-500/10", suffix: "%" },
                { label: "Nouveaux today", value: todayLeads, icon: Clock, color: "text-amber-400", bg: "from-amber-500/10", suffix: "" },
              ].map((kpi) => (
                <div key={kpi.label} className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${kpi.bg} to-transparent p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</span>
                    <div className={`w-8 h-8 rounded-xl ${kpi.bg.replace("from-", "bg-")} flex items-center justify-center`}>
                      <kpi.icon className={`size-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className={`text-4xl font-black tabular-nums ${kpi.color}`}>
                    <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />
                  </p>
                  <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full opacity-5 blur-2xl" style={{ background: "hsl(var(--primary))" }} />
                </div>
              ))}
            </div>

            {/* Product families visual */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Star className="size-4 text-primary" /> Demandes par famille de produit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {productFamilies.map((f) => {
                  const count = productRequests.filter((p) => p.product === f.key).length;
                  const pct = productRequests.length > 0 ? Math.round((count / productRequests.length) * 100) : 0;
                  return (
                    <div key={f.key} className={`rounded-2xl border ${f.border} ${f.bg} p-5 flex flex-col gap-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center`}>
                            <f.icon className={`size-4 ${f.color}`} />
                          </div>
                          <span className="text-sm font-semibold">{f.label}</span>
                        </div>
                        <span className={`text-2xl font-black ${f.color}`}>{count}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Part des demandes</span>
                          <span>{pct}%</span>
                        </div>
                        <Bar pct={pct} color={f.color.replace("text-", "bg-")} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Sectors breakdown */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-6">
                <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                  <Eye className="size-4 text-primary" /> Répartition par secteur
                </h3>
                <div className="space-y-4">
                  {Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([sector, count]) => {
                    const max = Math.max(...Object.values(sectorCounts));
                    return (
                      <div key={sector}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground">{sector}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                        <Bar pct={(count / max) * 100} />
                      </div>
                    );
                  })}
                  {Object.keys(sectorCounts).length === 0 && <p className="text-sm text-muted-foreground">Aucune donnée</p>}
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-2xl border border-border bg-secondary/20 p-6">
                <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                  <MousePointerClick className="size-4 text-primary" /> Activité récente
                </h3>
                <div className="space-y-3">
                  {recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente</p>}
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.type}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.detail}</span>
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ AUDIT REQUESTS ══════════ */}
        {tab === "audit_requests" && (
          selectedAudit ? (
            <div className="rounded-2xl border border-border bg-secondary/20 p-6 max-w-2xl mx-auto">
              <button onClick={() => setSelectedAudit(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ChevronLeft className="size-4" /> Retour à la liste
              </button>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{selectedAudit.prenom} {selectedAudit.nom}</h3>
                <span className="text-xs text-muted-foreground">{new Date(selectedAudit.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Email", value: selectedAudit.email },
                  { label: "Téléphone", value: selectedAudit.telephone },
                  { label: "Secteur", value: selectedAudit.secteur },
                  { label: "Besoin", value: selectedAudit.besoin || "—" },
                ].map((field) => (
                  <div key={field.label} className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{field.label}</p>
                    <p className="text-sm font-medium">{field.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button size="sm" variant="outline" className="rounded-lg">
                  <Phone className="size-3 mr-1" /> Appeler
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30">
                <h3 className="font-semibold">Demandes Audits</h3>
                <p className="text-xs text-muted-foreground mt-1">{auditRequests.length} demande(s)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nom</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Secteur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditRequests.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Aucune demande pour l'instant</td></tr>
                    ) : (
                      auditRequests.map((r, i) => (
                        <tr key={i} onClick={() => setSelectedAudit(r)} className="border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                          <td className="px-4 py-3 font-medium">{r.prenom} {r.nom}</td>
                          <td className="px-4 py-3">{r.email}</td>
                          <td className="px-4 py-3"><span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{r.secteur}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* ══════════ DIAGNOSTICS ══════════ */}
        {tab === "diagnostics" && (
          selectedDiagnostic ? (
            <div className="rounded-2xl border border-border bg-secondary/20 p-6 max-w-2xl mx-auto">
              <button onClick={() => setSelectedDiagnostic(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ChevronLeft className="size-4" /> Retour
              </button>
              <h3 className="text-xl font-bold mb-6">Diagnostic</h3>
              <div className="space-y-3">
                {diagQuestions.map((q, i) => (
                  <div key={q} className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{q}</p>
                    <p className="text-sm font-medium">{selectedDiagnostic.answers[i] || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30">
                <h3 className="font-semibold">Diagnostics réalisés</h3>
                <p className="text-xs text-muted-foreground mt-1">{diagnostics.length} diagnostic(s)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Secteur</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Site existant</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Demandes clients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostics.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Aucun diagnostic</td></tr>
                    ) : (
                      diagnostics.map((d, i) => (
                        <tr key={i} onClick={() => setSelectedDiagnostic(d)} className="border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <td className="px-4 py-3 text-muted-foreground">{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                          <td className="px-4 py-3 font-medium">{d.answers[0] || "—"}</td>
                          <td className="px-4 py-3">{d.answers[1] || "—"}</td>
                          <td className="px-4 py-3">{d.answers[2] || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* ══════════ PRODUCT REQUESTS ══════════ */}
        {tab === "product_requests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Demandes Produits</h3>
                <p className="text-xs text-muted-foreground mt-1">{productRequests.length} demande(s)</p>
              </div>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="bg-secondary border border-border rounded-xl px-4 py-2 text-sm text-foreground appearance-none focus:border-primary outline-none"
              >
                <option value="all">Tous les produits</option>
                <option value="Site internet">🌐 Site internet</option>
                <option value="Contenu marketing">📸 Contenu marketing</option>
                <option value="Automatisation">⚡ Automatisation</option>
              </select>
            </div>

            {/* Product family cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {productFamilies.map((f) => {
                const count = productRequests.filter((p) => p.product === f.key).length;
                const latest = productRequests.filter((p) => p.product === f.key).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                return (
                  <div key={f.key} className={`rounded-2xl border ${f.border} ${f.bg} p-5`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center`}>
                        <f.icon className={`size-5 ${f.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                        <p className={`text-2xl font-black ${f.color}`}>{count}</p>
                      </div>
                    </div>
                    {latest && (
                      <p className="text-[11px] text-muted-foreground">
                        Dernier : <span className="text-foreground font-medium">{latest.prenom} {latest.nom}</span>
                        {" — "}{new Date(latest.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Donut + table */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border bg-secondary/20 p-6 flex flex-col items-center justify-center">
                <h4 className="text-sm font-semibold mb-6 self-start">Répartition visuelle</h4>
                <DonutChart data={donutData} />
              </div>

              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                        <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nom</th>
                        <th className="text-left px-4 py-3 text-muted-foreground font-medium">Produit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(productFilter === "all" ? productRequests : productRequests.filter((p) => p.product === productFilter)).length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">Aucune demande</td></tr>
                      ) : (
                        (productFilter === "all" ? productRequests : productRequests.filter((p) => p.product === productFilter))
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((p, i) => {
                            const fam = productFamilies.find((f) => f.key === p.product);
                            return (
                              <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                                <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</td>
                                <td className="px-4 py-3 font-medium">{p.prenom} {p.nom}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${fam?.bg || "bg-primary/10"} ${fam?.color || "text-primary"}`}>
                                    {p.product}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
