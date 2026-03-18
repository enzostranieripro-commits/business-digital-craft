import { useMemo } from "react";
import { BarChart3, Globe, Smartphone, Repeat } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  diagnostics: any[];
}

const offerColor = (o: string) =>
  o === "Visibilité" ? "text-visibility" :
  o === "Autorité" ? "text-primary" :
  "text-conversion";

const PIE_COLORS = ["hsl(158, 60%, 48%)", "hsl(265, 89%, 60%)", "hsl(35, 85%, 56%)", "hsl(215, 20%, 55%)"];

const AdminDiagnosticsTab = ({ diagnostics }: Props) => {
  const byRecommendation = useMemo(() => {
    const map: Record<string, number> = {};
    diagnostics.forEach(d => { map[d.offre_recommandee] = (map[d.offre_recommandee] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [diagnostics]);

  const bySite = useMemo(() => {
    const map: Record<string, number> = {};
    diagnostics.forEach(d => { map[d.a_un_site] = (map[d.a_un_site] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [diagnostics]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="size-4 text-primary" /><span className="text-xs text-muted-foreground">Total diagnostics</span></div>
          <p className="text-3xl font-extrabold text-primary">{diagnostics.length}</p>
        </div>
        {["Visibilité", "Autorité", "Conversion"].map(offer => {
          const count = diagnostics.filter(d => d.offre_recommandee === offer).length;
          return (
            <div key={offer} className="card-surface p-5">
              <p className="text-xs text-muted-foreground mb-1">Reco. {offer}</p>
              <p className={`text-3xl font-extrabold ${offerColor(offer)}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Offre recommandée</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byRecommendation} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {byRecommendation.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-semibold text-sm mb-4">Ont déjà un site ?</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={bySite} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {bySite.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 8%)", border: "1px solid hsl(217, 19%, 16%)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Date</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Secteur</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">A un site</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Demandes/sem.</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Réseaux</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Recommandation</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucun diagnostic</td></tr>
            ) : diagnostics.map((d: any) => (
              <tr key={d.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                <td className="p-4 text-muted-foreground text-xs">{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="p-4">{d.secteur}</td>
                <td className="p-4 text-xs">{d.a_un_site}</td>
                <td className="p-4 text-xs">{d.demandes_semaine}</td>
                <td className="p-4 text-xs">{d.reseaux_sociaux}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold ${offerColor(d.offre_recommandee)}`}>{d.offre_recommandee}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDiagnosticsTab;
