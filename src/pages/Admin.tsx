import { useState, useEffect } from "react";
import { ArrowLeft, Phone, Calendar, ClipboardList, BarChart3, Users, TrendingUp, Clock, Eye, MousePointerClick } from "lucide-react";
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

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "audit_requests" | "bookings" | "diagnostics">("overview");
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>([]);

  useEffect(() => {
    setDiagnostics(JSON.parse(localStorage.getItem("diagnostics") || "[]"));
    setBookings(JSON.parse(localStorage.getItem("bookings") || "[]"));
    setAuditRequests(JSON.parse(localStorage.getItem("audit_requests") || "[]"));
  }, []);

  const tabs = [
    { id: "overview" as const, label: "Vue d'ensemble", icon: BarChart3 },
    { id: "audit_requests" as const, label: "Demandes Formulaire", icon: ClipboardList },
    { id: "bookings" as const, label: "RDV Réservés", icon: Calendar },
    { id: "diagnostics" as const, label: "Diagnostics", icon: Users },
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
    const s = ('secteur' in item ? item.secteur : (item as any).secteur) || "Inconnu";
    sectorCounts[s] = (sectorCounts[s] || 0) + 1;
  });

  const besoinCounts: Record<string, number> = {};
  auditRequests.forEach(r => {
    besoinCounts[r.besoin] = (besoinCounts[r.besoin] || 0) + 1;
  });

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
              onClick={() => setTab(t.id)}
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

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
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

            {/* Secondary KPIs */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sectors */}
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

              {/* Besoins */}
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

        {/* Audit Requests Table */}
        {tab === "audit_requests" && (
          <div className="card-surface overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Demandes via Formulaire N°1</h3>
              <p className="text-xs text-muted-foreground mt-1">{auditRequests.length} demande(s)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nom</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Téléphone</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Secteur</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Besoin</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRequests.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune demande pour le moment</td></tr>
                  ) : (
                    auditRequests.map((r, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                        <td className="px-4 py-3 font-medium">{r.prenom} {r.nom}</td>
                        <td className="px-4 py-3">{r.email}</td>
                        <td className="px-4 py-3">{r.telephone}</td>
                        <td className="px-4 py-3"><span className="badge-primary text-xs">{r.secteur}</span></td>
                        <td className="px-4 py-3">{r.besoin}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" className="text-xs rounded-lg">
                            <Phone className="size-3 mr-1" /> Appeler
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        {tab === "bookings" && (
          <div className="card-surface overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Rendez-vous téléphoniques réservés</h3>
              <p className="text-xs text-muted-foreground mt-1">{bookings.length} réservation(s)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date RDV</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Heure</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nom</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Téléphone</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Secteur</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Besoin</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune réservation pour le moment</td></tr>
                  ) : (
                    bookings.map((b, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{new Date(b.date).toLocaleDateString("fr-FR")}</td>
                        <td className="px-4 py-3"><span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-lg">{b.time}</span></td>
                        <td className="px-4 py-3 font-medium">{b.prenom} {b.nom}</td>
                        <td className="px-4 py-3">{b.email}</td>
                        <td className="px-4 py-3">{b.telephone}</td>
                        <td className="px-4 py-3"><span className="badge-primary text-xs">{b.secteur}</span></td>
                        <td className="px-4 py-3">{b.besoin}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Diagnostics Table */}
        {tab === "diagnostics" && (
          <div className="card-surface overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Réponses au diagnostic (Formulaire N°2)</h3>
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
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Réseaux sociaux</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Tâches répétitives</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnostics.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucune réponse pour le moment</td></tr>
                  ) : (
                    diagnostics.map((d, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                        <td className="px-4 py-3 font-medium">{d.answers[0] || "—"}</td>
                        <td className="px-4 py-3">{d.answers[1] || "—"}</td>
                        <td className="px-4 py-3">{d.answers[2] || "—"}</td>
                        <td className="px-4 py-3">{d.answers[3] || "—"}</td>
                        <td className="px-4 py-3">{d.answers[4] || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
