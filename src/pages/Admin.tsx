import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Phone, Calendar, ClipboardList, BarChart3, Users, TrendingUp, Clock, Eye, MousePointerClick, ChevronLeft, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DiagnosticEntry {
  answers: string[];
  date: string;
}

interface BookingEntry {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  secteur: string;
  besoin: string;
  date: string;
  time: string;
  createdAt: string;
}

interface AuditRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  secteur: string;
  besoin: string;
  createdAt: string;
}

interface ProductRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  secteur: string;
  product: string;
  createdAt: string;
}

type TabId = "overview" | "audit_requests" | "diagnostics" | "rdv" | "product_requests";

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("overview");
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditRequest | null>(null);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticEntry | null>(null);
  const [productFilter, setProductFilter] = useState<string>("all");

  useEffect(() => {
    setDiagnostics(JSON.parse(localStorage.getItem("diagnostics") || "[]"));
    setBookings(JSON.parse(localStorage.getItem("bookings") || "[]"));
    setAuditRequests(JSON.parse(localStorage.getItem("audit_requests") || "[]"));
    setProductRequests(JSON.parse(localStorage.getItem("product_requests") || "[]"));
  }, []);

  const tabs = [
    { id: "overview" as const, label: "Vue d'ensemble", icon: BarChart3 },
    { id: "audit_requests" as const, label: "Demandes Audits", icon: ClipboardList },
    { id: "diagnostics" as const, label: "Diagnostics", icon: Users },
    { id: "rdv" as const, label: "RDV", icon: Calendar },
    { id: "product_requests" as const, label: "Demandes Produits", icon: Package },
  ];

  // KPIs
  const totalLeads = auditRequests.length + diagnostics.length;
  const totalBookings = bookings.length;
  const conversionRate = totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0;
  const todayBookings = bookings.filter(b => {
    const d = new Date(b.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  // Sectors breakdown
  const sectorCounts: Record<string, number> = {};
  [...auditRequests, ...diagnostics.map(d => ({ secteur: d.answers[0] || "Inconnu" }))].forEach(item => {
    const s = ('secteur' in item ? item.secteur : "Inconnu") || "Inconnu";
    sectorCounts[s] = (sectorCounts[s] || 0) + 1;
  });

  const besoinCounts: Record<string, number> = {};
  auditRequests.forEach(r => {
    besoinCounts[r.besoin] = (besoinCounts[r.besoin] || 0) + 1;
  });

  // Product request pie chart data
  const productCounts = useMemo(() => {
    const filtered = productFilter === "all" ? productRequests : productRequests.filter(p => p.product === productFilter);
    const counts: Record<string, number> = {};
    filtered.forEach(p => {
      counts[p.product] = (counts[p.product] || 0) + 1;
    });
    return counts;
  }, [productRequests, productFilter]);

  const pieColors = ["hsl(var(--primary))", "hsl(210, 70%, 55%)", "hsl(150, 60%, 45%)"];
  const totalProductRequests = Object.values(productCounts).reduce((a, b) => a + b, 0);

  // RDV calendar grouping
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, BookingEntry[]> = {};
    bookings.forEach(b => {
      if (!grouped[b.date]) grouped[b.date] = [];
      grouped[b.date].push(b);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);

  const diagQuestions = [
    "Secteur d'activité",
    "Site internet",
    "Demandes clients",
    "Réseaux sociaux",
    "Tâches répétitives",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="size-4 mr-2" /> Retour
          </Button>
          <h1 className="text-lg font-bold">Dashboard Admin</h1>
        </div>
        <span className="text-xs text-muted-foreground">Studio Nova — Panel</span>
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
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW ===== */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-400" },
                { label: "RDV Réservés", value: totalBookings, icon: Calendar, color: "text-primary" },
                { label: "Taux conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-green-400" },
                { label: "RDV Aujourd'hui", value: todayBookings, icon: Clock, color: "text-orange-400" },
              ].map((kpi) => (
                <div key={kpi.label} className="card-surface p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</span>
                    <kpi.icon className={`size-4 ${kpi.color}`} />
                  </div>
                  <p className="text-3xl font-bold tabular-nums">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-surface p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Eye className="size-4 text-primary" /> Répartition par secteur
                </h3>
                <div className="space-y-3">
                  {Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([sector, count]) => {
                    const max = Math.max(...Object.values(sectorCounts));
                    return (
                      <div key={sector}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{sector}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(sectorCounts).length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucune donnée</p>
                  )}
                </div>
              </div>

              <div className="card-surface p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <MousePointerClick className="size-4 text-primary" /> Types de besoin
                </h3>
                <div className="space-y-3">
                  {Object.entries(besoinCounts).sort((a, b) => b[1] - a[1]).map(([besoin, count]) => {
                    const max = Math.max(...Object.values(besoinCounts));
                    return (
                      <div key={besoin}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{besoin}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(besoinCounts).length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucune donnée</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="card-surface p-6">
              <h3 className="text-sm font-semibold mb-4">Dernières demandes</h3>
              <div className="space-y-3">
                {[...auditRequests.map(a => ({ type: "Formulaire", name: `${a.prenom} ${a.nom}`, detail: a.besoin, date: a.createdAt })),
                  ...bookings.map(b => ({ type: "RDV", name: `${b.prenom} ${b.nom}`, detail: `${b.date} à ${b.time}`, date: b.createdAt }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === "RDV" ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-400"}`}>
                        {item.type}
                      </span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                  </div>
                ))}
                {auditRequests.length === 0 && bookings.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== AUDIT REQUESTS ===== */}
        {tab === "audit_requests" && (
          selectedAudit ? (
            <div className="card-surface p-6 max-w-2xl mx-auto">
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
            <div className="card-surface overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Demandes Audits (Formulaire N°1)</h3>
                <p className="text-xs text-muted-foreground mt-1">{auditRequests.length} demande(s)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nom</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Secteur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditRequests.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucune demande</td></tr>
                    ) : (
                      auditRequests.map((r, i) => (
                        <tr key={i} onClick={() => setSelectedAudit(r)} className="border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                          <td className="px-4 py-3 font-medium">{r.prenom} {r.nom}</td>
                          <td className="px-4 py-3">{r.email}</td>
                          <td className="px-4 py-3"><span className="badge-primary text-xs">{r.secteur}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* ===== DIAGNOSTICS ===== */}
        {tab === "diagnostics" && (
          selectedDiagnostic ? (
            <div className="card-surface p-6 max-w-2xl mx-auto">
              <button onClick={() => setSelectedDiagnostic(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ChevronLeft className="size-4" /> Retour à la liste
              </button>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Diagnostic</h3>
                <span className="text-xs text-muted-foreground">{new Date(selectedDiagnostic.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
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
            <div className="card-surface overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Diagnostics réalisés (Formulaire N°2)</h3>
                <p className="text-xs text-muted-foreground mt-1">{diagnostics.length} diagnostic(s) — pour phoning</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Secteur</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Site existant</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Demandes clients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostics.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Aucun diagnostic</td></tr>
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

        {/* ===== RDV - Calendar View ===== */}
        {tab === "rdv" && (
          <div className="space-y-6">
            <div className="card-surface p-4 border-b border-border">
              <h3 className="font-semibold">Rendez-vous réservés</h3>
              <p className="text-xs text-muted-foreground mt-1">{bookings.length} rendez-vous</p>
            </div>

            {bookings.length === 0 ? (
              <div className="card-surface p-8 text-center text-muted-foreground">Aucun rendez-vous réservé</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookingsByDate.map(([date, entries]) => (
                  <div key={date} className="card-surface overflow-hidden">
                    <div className="bg-primary/10 px-4 py-3 border-b border-border">
                      <p className="text-sm font-bold text-primary">
                        {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{entries.length} RDV</p>
                    </div>
                    <div className="divide-y divide-border/50">
                      {entries.sort((a, b) => a.time.localeCompare(b.time)).map((b, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-secondary/30 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">{b.prenom} {b.nom}</span>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-lg">{b.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{b.telephone} · {b.secteur}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== PRODUCT REQUESTS ===== */}
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
                <option value="all">Tous les axes</option>
                <option value="Site internet">Axe 1 — Site internet</option>
                <option value="Contenu marketing">Axe 2 — Contenu marketing</option>
                <option value="Automatisation">Axe 3 — Automatisation</option>
              </select>
            </div>

            {/* Pie chart */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-surface p-6 flex flex-col items-center justify-center">
                <h4 className="text-sm font-semibold mb-6">Répartition par produit</h4>
                {totalProductRequests === 0 ? (
                  <p className="text-sm text-muted-foreground py-8">Aucune donnée</p>
                ) : (
                  <div className="relative">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      {(() => {
                        const entries = Object.entries(productCounts);
                        let cumAngle = 0;
                        return entries.map(([product, count], i) => {
                          const angle = (count / totalProductRequests) * 360;
                          const startAngle = cumAngle;
                          cumAngle += angle;
                          const x1 = 90 + 80 * Math.cos((Math.PI / 180) * (startAngle - 90));
                          const y1 = 90 + 80 * Math.sin((Math.PI / 180) * (startAngle - 90));
                          const x2 = 90 + 80 * Math.cos((Math.PI / 180) * (startAngle + angle - 90));
                          const y2 = 90 + 80 * Math.sin((Math.PI / 180) * (startAngle + angle - 90));
                          const largeArc = angle > 180 ? 1 : 0;
                          const d = entries.length === 1
                            ? `M90,10 A80,80 0 1,1 89.99,10 Z`
                            : `M90,90 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z`;
                          return <path key={product} d={d} fill={pieColors[i % pieColors.length]} opacity={0.85} />;
                        });
                      })()}
                      <circle cx="90" cy="90" r="40" fill="hsl(var(--background))" />
                      <text x="90" y="90" textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--foreground))" fontSize="20" fontWeight="bold">{totalProductRequests}</text>
                    </svg>
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                      {Object.entries(productCounts).map(([product, count], i) => (
                        <div key={product} className="flex items-center gap-1.5 text-xs">
                          <span className="size-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                          {product} ({count})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="card-surface overflow-hidden">
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
                      {(productFilter === "all" ? productRequests : productRequests.filter(p => p.product === productFilter)).length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Aucune demande</td></tr>
                      ) : (
                        (productFilter === "all" ? productRequests : productRequests.filter(p => p.product === productFilter)).map((p, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                            <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td className="px-4 py-3 font-medium">{p.prenom} {p.nom}</td>
                            <td className="px-4 py-3"><span className="badge-primary text-xs">{p.product}</span></td>
                          </tr>
                        ))
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
