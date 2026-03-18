import { Package, User, Mail, Calendar } from "lucide-react";

interface Props {
  products: any[];
}

const offerColor = (o: string) =>
  o === "Visibilité" ? "bg-visibility/15 text-visibility" :
  o === "Autorité" ? "bg-primary/15 text-primary" :
  o === "Conversion" ? "bg-conversion/15 text-conversion" :
  "bg-secondary text-muted-foreground";

const AdminOffersTab = ({ products }: Props) => {
  // Count by product
  const byProduct: Record<string, number> = {};
  products.forEach(p => { byProduct[p.product] = (byProduct[p.product] || 0) + 1; });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card-surface p-5">
          <p className="text-xs text-muted-foreground mb-1">Total demandes</p>
          <p className="text-3xl font-extrabold text-primary">{products.length}</p>
        </div>
        {["Visibilité", "Autorité", "Conversion"].map(offer => (
          <div key={offer} className="card-surface p-5">
            <p className="text-xs text-muted-foreground mb-1">{offer}</p>
            <p className={`text-3xl font-extrabold ${offer === "Visibilité" ? "text-visibility" : offer === "Autorité" ? "text-primary" : "text-conversion"}`}>
              {byProduct[offer] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Date</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Client</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Email</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Secteur</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Offre demandée</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Aucune demande produit</td></tr>
            ) : products.map((p: any) => (
              <tr key={p.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                <td className="p-4 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="p-4 font-medium">{p.prenom} {p.nom}</td>
                <td className="p-4 text-muted-foreground text-xs">{p.email}</td>
                <td className="p-4 text-muted-foreground text-xs">{p.secteur}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${offerColor(p.product)}`}>{p.product}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOffersTab;
