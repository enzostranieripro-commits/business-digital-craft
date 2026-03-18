import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Trash2, BarChart3, Users, Calendar, Package, Settings, LayoutDashboard, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AdminDashboardTab from "@/components/admin/AdminDashboardTab";
import AdminLeadsTab from "@/components/admin/AdminLeadsTab";

type Tab = "dashboard" | "leads" | "bookings" | "offers" | "diagnostics" | "settings";

const Admin = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [connected, setConnected] = useState(true);

  const fetchAll = async () => {
    const [l, b, p, d] = await Promise.all([
      supabase.from("audit_requests" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("bookings" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("product_requests" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("diagnostics" as any).select("*").order("created_at", { ascending: false }),
    ]);
    if (l.data) setLeads(l.data as any[]);
    if (b.data) setBookings(b.data as any[]);
    if (p.data) setProducts(p.data as any[]);
    if (d.data) setDiagnostics(d.data as any[]);
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const channel = supabase.channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_requests" }, () => { fetchAll(); toast("Nouveau lead reçu !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => { fetchAll(); toast("Nouveau RDV !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "product_requests" }, () => { fetchAll(); toast("Nouvelle demande produit !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "diagnostics" }, () => { fetchAll(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "lead_notes" }, () => { })
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, () => { })
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateBookingStatus = async (id: string, status: string) => {
    await supabase.from("bookings" as any).update({ status } as any).eq("id", id);
    fetchAll();
  };

  const offerColor = (o: string) => o === "Visibilité" ? "text-visibility" : o === "Autorité" ? "text-primary" : o === "Conversion" ? "text-conversion" : "text-foreground";

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Leads CRM", icon: Users },
    { id: "bookings", label: "Rendez-vous", icon: Calendar },
    { id: "offers", label: "Offres", icon: Package },
    { id: "diagnostics", label: "Diagnostics", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const pendingFollowUps = 0; // Could query but keep simple for now

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/30 p-4 flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <span className="font-display text-lg font-extrabold">Studio<span className="text-primary">Nova</span></span>
          {connected ? <Wifi className="size-4 text-visibility" /> : <WifiOff className="size-4 text-destructive" />}
        </div>
        <nav className="space-y-1 flex-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${tab === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="size-4" />{t.label}
            </button>
          ))}
        </nav>
        <a href="/" className="text-xs text-muted-foreground hover:text-foreground mt-2">← Retour au site</a>
        <button onClick={signOut} className="flex items-center gap-2 text-xs text-destructive hover:text-destructive/80 mt-2">
          <LogOut className="size-3" />Déconnexion
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {tab === "dashboard" && (
          <AdminDashboardTab leads={leads} bookings={bookings} products={products} diagnostics={diagnostics} />
        )}

        {tab === "leads" && (
          <AdminLeadsTab leads={leads} fetchAll={fetchAll} />
        )}

        {tab === "bookings" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Rendez-vous</h1>
            <div className="grid md:grid-cols-2 gap-4">
              {bookings.map((b: any) => (
                <div key={b.id} className="card-surface p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="font-semibold">{b.prenom} {b.nom}</p><p className="text-xs text-muted-foreground">{b.email}</p></div>
                    <select value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)} className={`text-xs rounded-lg px-2 py-1 bg-secondary ${b.status === "confirmed" ? "text-visibility" : b.status === "cancelled" ? "text-destructive" : "text-conversion"}`}>
                      <option value="pending">En attente</option><option value="confirmed">Confirmé</option><option value="cancelled">Annulé</option>
                    </select>
                  </div>
                  <p className="text-sm">📅 {b.date} à {b.time}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.secteur}{b.besoin ? ` • ${b.besoin}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "offers" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Demandes produits</h1>
            <div className="card-surface overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/30"><th className="p-3 text-left text-xs text-muted-foreground">Date</th><th className="p-3 text-left text-xs text-muted-foreground">Nom</th><th className="p-3 text-left text-xs text-muted-foreground">Email</th><th className="p-3 text-left text-xs text-muted-foreground">Offre</th></tr></thead>
                <tbody>{products.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/10"><td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td><td className="p-3 font-medium">{p.prenom} {p.nom}</td><td className="p-3">{p.email}</td><td className={`p-3 font-semibold ${offerColor(p.product)}`}>{p.product}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "diagnostics" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Diagnostics</h1>
            <div className="card-surface overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/30"><th className="p-3 text-left text-xs text-muted-foreground">Date</th><th className="p-3 text-left text-xs text-muted-foreground">Secteur</th><th className="p-3 text-left text-xs text-muted-foreground">Site</th><th className="p-3 text-left text-xs text-muted-foreground">Recommandation</th></tr></thead>
                <tbody>{diagnostics.map((d: any) => (
                  <tr key={d.id} className="border-b border-border/10"><td className="p-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString("fr-FR")}</td><td className="p-3">{d.secteur}</td><td className="p-3">{d.a_un_site}</td><td className={`p-3 font-semibold ${offerColor(d.offre_recommandee)}`}>{d.offre_recommandee}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
            <div className="card-surface p-6">
              <h3 className="font-semibold text-destructive mb-4">Zone dangereuse</h3>
              <div className="space-y-3">
                {[{ table: "audit_requests", label: "leads" }, { table: "bookings", label: "rendez-vous" }, { table: "product_requests", label: "demandes produits" }, { table: "diagnostics", label: "diagnostics" }].map(t => (
                  <Button key={t.table} variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={async () => { if (confirm(`Supprimer tous les ${t.label} ?`)) { await supabase.from(t.table as any).delete().neq("id", "00000000-0000-0000-0000-000000000000"); fetchAll(); toast(`${t.label} supprimés`); } }}>
                    <Trash2 className="size-4 mr-2" />Supprimer tous les {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="card-surface p-6 mt-4">
              <h3 className="font-semibold mb-3">Statistiques globales</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Total leads</p><p className="font-bold text-lg">{leads.length}</p></div>
                <div><p className="text-muted-foreground">Total RDV</p><p className="font-bold text-lg">{bookings.length}</p></div>
                <div><p className="text-muted-foreground">Total diagnostics</p><p className="font-bold text-lg">{diagnostics.length}</p></div>
                <div><p className="text-muted-foreground">Total demandes produits</p><p className="font-bold text-lg">{products.length}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
