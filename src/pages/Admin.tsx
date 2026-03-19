import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Briefcase, Server, Calendar, Package, BarChart3, Settings,
  LogOut, Wifi, WifiOff, ChevronLeft, Bell, Search, FolderKanban, DollarSign, FileText
} from "lucide-react";
import AdminDashboardTab from "@/components/admin/AdminDashboardTab";
import AdminLeadsTab from "@/components/admin/AdminLeadsTab";
import AdminClientsTab from "@/components/admin/AdminClientsTab";
import AdminHostingTab from "@/components/admin/AdminHostingTab";
import AdminBookingsTab from "@/components/admin/AdminBookingsTab";
import AdminOffersTab from "@/components/admin/AdminOffersTab";
import AdminDiagnosticsTab from "@/components/admin/AdminDiagnosticsTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminProjectsTab from "@/components/admin/AdminProjectsTab";
import AdminFinanceTab from "@/components/admin/AdminFinanceTab";
import AdminBillingTab from "@/components/admin/AdminBillingTab";
import AdminInvoiceSettingsTab from "@/components/admin/AdminInvoiceSettingsTab";

type Tab = "dashboard" | "leads" | "clients" | "hosting" | "bookings" | "offers" | "diagnostics" | "settings" | "projects" | "finance" | "billing" | "invoice_settings";

const SIDEBAR_SECTIONS = [
  {
    label: "Vue d'ensemble",
    items: [
      { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
      { id: "finance" as Tab, label: "Finances", icon: DollarSign },
      { id: "billing" as Tab, label: "Devis & Factures", icon: FileText },
    ],
  },
  {
    label: "Commercial",
    items: [
      { id: "leads" as Tab, label: "Pipeline CRM", icon: Users },
      { id: "clients" as Tab, label: "Portefeuille Clients", icon: Briefcase },
      { id: "bookings" as Tab, label: "Rendez-vous", icon: Calendar },
    ],
  },
  {
    label: "Exploitation",
    items: [
      { id: "hosting" as Tab, label: "Hébergement & Abo.", icon: Server },
      { id: "projects" as Tab, label: "Projets / Livrables", icon: FolderKanban },
      { id: "offers" as Tab, label: "Demandes Produits", icon: Package },
      { id: "diagnostics" as Tab, label: "Diagnostics", icon: BarChart3 },
    ],
  },
  {
    label: "Système",
    items: [
      { id: "settings" as Tab, label: "Paramètres", icon: Settings },
    ],
  },
];

const Admin = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [connected, setConnected] = useState(true);

  const fetchAll = async () => {
    const [l, b, p, d, s, ph, pr] = await Promise.all([
      supabase.from("audit_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("product_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("diagnostics").select("*").order("created_at", { ascending: false }),
      supabase.from("client_subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_history").select("*").order("payment_date", { ascending: false }),
      supabase.from("client_projects").select("*").order("created_at", { ascending: false }),
    ]);
    if (l.data) setLeads(l.data);
    if (b.data) setBookings(b.data);
    if (p.data) setProducts(p.data);
    if (d.data) setDiagnostics(d.data);
    if (s.data) setSubscriptions(s.data);
    if (ph.data) setPayments(ph.data);
    if (pr.data) setProjects(pr.data);
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const channel = supabase.channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_requests" }, () => { fetchAll(); toast("📩 Nouveau lead reçu !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => { fetchAll(); toast("📅 Nouveau rendez-vous !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "product_requests" }, () => { fetchAll(); toast("📦 Nouvelle demande produit !"); })
      .on("postgres_changes", { event: "*", schema: "public", table: "diagnostics" }, () => { fetchAll(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "client_subscriptions" }, () => { fetchAll(); })
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));
    return () => { supabase.removeChannel(channel); };
  }, []);

  const hostingAlerts = subscriptions.filter((s: any) => s.payment_status === "retard" || s.payment_status === "impaye").length;
  const pendingBookings = bookings.filter((b: any) => b.status === "pending").length;
  const newLeads = leads.filter((l: any) => (l.status || "nouveau") === "nouveau").length;

  const getBadge = (id: Tab) => {
    if (id === "hosting" && hostingAlerts > 0) return { count: hostingAlerts, type: "destructive" as const };
    if (id === "bookings" && pendingBookings > 0) return { count: pendingBookings, type: "warning" as const };
    if (id === "leads" && newLeads > 0) return { count: newLeads, type: "info" as const };
    return null;
  };

  const tabLabel = SIDEBAR_SECTIONS.flatMap(s => s.items).find(i => i.id === tab)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-[68px]" : "w-[260px]"} border-r border-border/20 flex flex-col flex-shrink-0 transition-all duration-300 bg-card/50`}>
        {/* Brand */}
        <div className={`h-16 flex items-center ${sidebarCollapsed ? "justify-center px-2" : "px-5"} border-b border-border/20`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-display text-xs font-extrabold">AS</span>
              </div>
              <div>
                <p className="font-display text-xs font-extrabold leading-none">AS<span className="text-primary"> Consulting</span></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Back-office</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary/50">
            <ChevronLeft className={`size-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              {!sidebarCollapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] px-5 mb-2">{section.label}</p>
              )}
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const badge = getBadge(item.id);
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 rounded-xl text-[13px] transition-all duration-200 ${
                        sidebarCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
                      } ${
                        active
                          ? "bg-primary/10 text-primary font-semibold shadow-sm shadow-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className={`size-[18px] flex-shrink-0 ${active ? "text-primary" : ""}`} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {badge && (
                            <span className={`text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full ${
                              badge.type === "destructive" ? "bg-destructive text-destructive-foreground animate-pulse" :
                              badge.type === "warning" ? "bg-conversion/20 text-conversion" :
                              "bg-primary/20 text-primary"
                            }`}>
                              {badge.count}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && badge && (
                        <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${badge.type === "destructive" ? "bg-destructive" : badge.type === "warning" ? "bg-conversion" : "bg-primary"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-border/20 ${sidebarCollapsed ? "p-2" : "p-4"}`}>
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"}`}>
            {connected
              ? <Wifi className="size-3.5 text-visibility flex-shrink-0" />
              : <WifiOff className="size-3.5 text-destructive flex-shrink-0" />
            }
            {!sidebarCollapsed && (
              <span className={`text-[11px] ${connected ? "text-visibility" : "text-destructive"}`}>
                {connected ? "Connecté en temps réel" : "Déconnecté"}
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between mt-3">
              <a href="/" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">← Voir le site</a>
              <button onClick={signOut} className="flex items-center gap-1.5 text-[11px] text-destructive/70 hover:text-destructive transition-colors">
                <LogOut className="size-3" />Quitter
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border/20 flex items-center justify-between px-8 flex-shrink-0 bg-card/30">
          <div>
            <h1 className="text-lg font-display font-extrabold">{tabLabel}</h1>
            <p className="text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {hostingAlerts > 0 && (
              <button onClick={() => setTab("hosting")} className="flex items-center gap-2 text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-full hover:bg-destructive/20 transition-colors animate-pulse">
                <Bell className="size-3.5" />
                {hostingAlerts} alerte{hostingAlerts > 1 ? "s" : ""} paiement
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {tab === "dashboard" && <AdminDashboardTab leads={leads} bookings={bookings} products={products} diagnostics={diagnostics} subscriptions={subscriptions} payments={payments} />}
          {tab === "finance" && <AdminFinanceTab subscriptions={subscriptions} payments={payments} leads={leads} fetchAll={fetchAll} />}
          {tab === "billing" && <AdminBillingTab leads={leads} fetchAll={fetchAll} />}
          {tab === "leads" && <AdminLeadsTab leads={leads} fetchAll={fetchAll} />}
          {tab === "clients" && <AdminClientsTab leads={leads} bookings={bookings} products={products} subscriptions={subscriptions} fetchAll={fetchAll} />}
          {tab === "hosting" && <AdminHostingTab subscriptions={subscriptions} leads={leads} payments={payments} fetchAll={fetchAll} />}
          {tab === "projects" && <AdminProjectsTab leads={leads} projects={projects} fetchAll={fetchAll} />}
          {tab === "bookings" && <AdminBookingsTab bookings={bookings} fetchAll={fetchAll} />}
          {tab === "offers" && <AdminOffersTab products={products} />}
          {tab === "diagnostics" && <AdminDiagnosticsTab diagnostics={diagnostics} />}
          {tab === "settings" && <AdminSettingsTab leads={leads} bookings={bookings} diagnostics={diagnostics} products={products} fetchAll={fetchAll} />}
        </main>
      </div>
    </div>
  );
};

export default Admin;
