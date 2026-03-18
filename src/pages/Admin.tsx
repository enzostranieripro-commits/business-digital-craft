import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Trash2, BarChart3, Users, Calendar, Package, Settings, LayoutDashboard, LogOut, Briefcase, Server } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AdminDashboardTab from "@/components/admin/AdminDashboardTab";
import AdminLeadsTab from "@/components/admin/AdminLeadsTab";
import AdminClientsTab from "@/components/admin/AdminClientsTab";
import AdminHostingTab from "@/components/admin/AdminHostingTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";

type Tab = "dashboard" | "leads" | "clients" | "hosting" | "bookings" | "offers" | "diagnostics" | "settings";

const Admin = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [connected, setConnected] = useState(true);

  const fetchAll = async () => {
    const [l, b, p, d, s] = await Promise.all([
      supabase.from("audit_requests" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("bookings" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("product_requests" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("diagnostics" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("client_subscriptions" as any).select("*").order("created_at", { ascending: false }),
    ]);
    if (l.data) setLeads(l.data as any[]);
    if (b.data) setBookings(b.data as any[]);
    if (p.data) setProducts(p.data as any[]);
    if (d.data) setDiagnostics(d.data as any[]);
    if (s.data) setSubscriptions(s.data as any[]);
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const channel = supabase.channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_requests" }, () => { fetchAll(); toast("Nouveau lead reçu !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => { fetchAll(); toast("Nouveau RDV !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "product_requests" }, () => { fetchAll(); toast("Nouvelle demande produit !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "diagnostics" }, () => { fetchAll(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "client_subscriptions" }, () => { fetchAll(); })
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
    { id: "clients", label: "Clients", icon: Briefcase },
    { id: "hosting", label: "Hébergement", icon: Server },
    { id: "bookings", label: "Rendez-vous", icon: Calendar },
    { id: "offers", label: "Offres", icon: Package },
    { id: "diagnostics", label: "Diagnostics", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  // Alert badge for hosting
  const hostingAlerts = subscriptions.filter((s: any) => s.payment_status === "retard" || s.payment_status === "impaye").length;

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
              <t.icon className="size-4" />
              {t.label}
              {t.id === "hosting" && hostingAlerts > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {hostingAlerts}
                </span>
              )}
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
          <AdminDashboardTab leads={leads} bookings={bookings} products={products} diagnostics={diagnostics} subscriptions={subscriptions} />
        )}

        {tab === "leads" && (
          <AdminLeadsTab leads={leads} fetchAll={fetchAll} />
        )}

        {tab === "clients" && (
          <AdminClientsTab leads={leads} bookings={bookings} products={products} subscriptions={subscriptions} fetchAll={fetchAll} />
        )}

        {tab === "hosting" && (
          <AdminHostingTab subscriptions={subscriptions} leads={leads} fetchAll={fetchAll} />
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
          <AdminSettingsTab leads={leads} bookings={bookings} diagnostics={diagnostics} products={products} fetchAll={fetchAll} />
        )}
      </div>
    </div>
  );
};

export default Admin;
