import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Briefcase, Server, Calendar, Package, BarChart3, Settings,
  LogOut, Wifi, WifiOff, ChevronLeft, Bell, Search, FolderKanban, DollarSign, FileText,
  Menu, X, Zap, Layers
} from "lucide-react";
import AdminDashboardTab from "@/components/admin/AdminDashboardTab";
import AdminLeadsTab from "@/components/admin/AdminLeadsTab";
import AdminClientsTab from "@/components/admin/AdminClientsTab";
import AdminHostingTab from "@/components/admin/AdminHostingTab";
import AdminBookingsTab from "@/components/admin/AdminBookingsTab";
import AdminDiagnosticsTab from "@/components/admin/AdminDiagnosticsTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminProjectsTab from "@/components/admin/AdminProjectsTab";
import AdminFinanceTab from "@/components/admin/AdminFinanceTab";
import AdminBillingTab from "@/components/admin/AdminBillingTab";
import AdminInvoiceSettingsTab from "@/components/admin/AdminInvoiceSettingsTab";
import AdminHubspotTab from "@/components/admin/AdminHubspotTab";
import AdminCatalogTab from "@/components/admin/AdminCatalogTab";
import AdminOffersTab from "@/components/admin/AdminOffersTab";

type Tab = "dashboard" | "leads" | "clients" | "hosting" | "bookings" | "offers" | "diagnostics" | "settings" | "projects" | "finance" | "billing" | "invoice_settings" | "hubspot" | "catalog";

const SIDEBAR_SECTIONS = [
  {
    label: "Vue d'ensemble",
    items: [
      { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
      { id: "finance" as Tab, label: "Finances", icon: DollarSign },
    ],
  },
  {
    label: "Commercial",
    items: [
      { id: "leads" as Tab, label: "Pipeline CRM", icon: Users },
      { id: "clients" as Tab, label: "Portefeuille Clients", icon: Briefcase },
      { id: "bookings" as Tab, label: "Rendez-vous", icon: Calendar },
      { id: "hubspot" as Tab, label: "HubSpot CRM", icon: Zap },
    ],
  },
  {
    label: "Facturation",
    items: [
      { id: "billing" as Tab, label: "Devis & Factures", icon: FileText },
      { id: "invoice_settings" as Tab, label: "Réglages Facturation", icon: Settings },
    ],
  },
  {
    label: "Produits & Tarifs",
    items: [
      { id: "catalog" as Tab, label: "Catalogue & Options", icon: Layers },
      { id: "offers" as Tab, label: "Demandes Reçues", icon: Package },
    ],
  },
  {
    label: "Exploitation",
    items: [
      { id: "hosting" as Tab, label: "Hébergement & Abo.", icon: Server },
      { id: "projects" as Tab, label: "Projets / Livrables", icon: FolderKanban },
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

interface SearchResult {
  type: "lead" | "booking" | "client";
  label: string;
  sub: string;
  tab: Tab;
  id: string;
}

const Admin = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [connected, setConnected] = useState(true);

  // Global search
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!globalSearch.trim() || globalSearch.length < 2) return [];
    const q = globalSearch.toLowerCase();
    const results: SearchResult[] = [];

    leads.forEach(l => {
      const text = `${l.prenom} ${l.nom} ${l.email} ${l.secteur}`.toLowerCase();
      if (text.includes(q)) {
        const isClient = l.status === "converti";
        results.push({
          type: isClient ? "client" : "lead",
          label: `${l.prenom} ${l.nom}`,
          sub: `${l.email} • ${l.secteur}`,
          tab: isClient ? "clients" : "leads",
          id: l.id,
        });
      }
    });

    bookings.forEach(b => {
      const text = `${b.prenom} ${b.nom} ${b.email} ${b.date}`.toLowerCase();
      if (text.includes(q)) {
        results.push({
          type: "booking",
          label: `${b.prenom} ${b.nom}`,
          sub: `RDV ${b.date} à ${b.time}`,
          tab: "bookings",
          id: b.id,
        });
      }
    });

    return results.slice(0, 8);
  }, [globalSearch, leads, bookings]);

  // Close search on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  const totalNotifs = hostingAlerts + pendingBookings + newLeads;

  const getBadge = (id: Tab) => {
    if (id === "hosting" && hostingAlerts > 0) return { count: hostingAlerts, type: "destructive" as const };
    if (id === "bookings" && pendingBookings > 0) return { count: pendingBookings, type: "warning" as const };
    if (id === "leads" && newLeads > 0) return { count: newLeads, type: "info" as const };
    return null;
  };

  const tabLabel = SIDEBAR_SECTIONS.flatMap(s => s.items).find(i => i.id === tab)?.label || "Dashboard";

  const handleSearchSelect = (result: SearchResult) => {
    setTab(result.tab);
    setGlobalSearch("");
    setSearchFocused(false);
  };

  const sidebarContent = (
    <>
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
                    onClick={() => { setTab(item.id); setMobileMenuOpen(false); }}
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
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-[68px]" : "w-[260px]"} border-r border-border/20 hidden md:flex flex-col flex-shrink-0 transition-all duration-300 bg-card/50`}>
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
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border/20 flex flex-col z-10 animate-fade-in">
            <div className="h-16 flex items-center px-5 border-b border-border/20 justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-display text-xs font-extrabold">AS</span>
                </div>
                <p className="font-display text-xs font-extrabold leading-none">AS<span className="text-primary"> Consulting</span></p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground">
                <X className="size-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border/20 flex items-center justify-between px-4 md:px-8 flex-shrink-0 bg-card/30 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground">
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-extrabold">{tabLabel}</h1>
              <p className="text-[11px] text-muted-foreground">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Global search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Rechercher un lead, client, RDV..."
              className="w-full bg-secondary/50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none border border-border/20 focus:border-primary/30 transition-colors"
            />
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/20 rounded-xl shadow-xl z-50 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleSearchSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/30 transition-colors border-b border-border/10 last:border-0"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      r.type === "lead" ? "bg-primary/10 text-primary" :
                      r.type === "client" ? "bg-visibility/10 text-visibility" :
                      "bg-conversion/10 text-conversion"
                    }`}>
                      {r.type === "lead" ? <Users className="size-3.5" /> :
                       r.type === "client" ? <Briefcase className="size-3.5" /> :
                       <Calendar className="size-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.sub}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                      r.type === "lead" ? "bg-primary/10 text-primary" :
                      r.type === "client" ? "bg-visibility/10 text-visibility" :
                      "bg-conversion/10 text-conversion"
                    }`}>
                      {r.type === "lead" ? "Lead" : r.type === "client" ? "Client" : "RDV"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searchFocused && globalSearch.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/20 rounded-xl shadow-xl z-50 p-4 text-center text-sm text-muted-foreground">
                Aucun résultat pour « {globalSearch} »
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {hostingAlerts > 0 && (
              <button onClick={() => setTab("hosting")} className="hidden md:flex items-center gap-2 text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-full hover:bg-destructive/20 transition-colors animate-pulse">
                <Bell className="size-3.5" />
                {hostingAlerts} alerte{hostingAlerts > 1 ? "s" : ""}
              </button>
            )}
            <button onClick={() => setTab("dashboard")} className="relative p-2 rounded-xl hover:bg-secondary/50 transition-colors">
              <Bell className="size-5 text-muted-foreground" />
              {totalNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 animate-scale-in">
                  {totalNotifs}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {tab === "dashboard" && <AdminDashboardTab leads={leads} bookings={bookings} products={products} diagnostics={diagnostics} subscriptions={subscriptions} payments={payments} onNavigate={(t) => setTab(t as Tab)} />}
          {tab === "finance" && <AdminFinanceTab subscriptions={subscriptions} payments={payments} leads={leads} fetchAll={fetchAll} />}
          {tab === "billing" && <AdminBillingTab leads={leads} fetchAll={fetchAll} />}
          {tab === "invoice_settings" && <AdminInvoiceSettingsTab />}
          {tab === "leads" && <AdminLeadsTab leads={leads} fetchAll={fetchAll} />}
          {tab === "clients" && <AdminClientsTab leads={leads} bookings={bookings} products={products} subscriptions={subscriptions} fetchAll={fetchAll} />}
          {tab === "hubspot" && <AdminHubspotTab leads={leads} fetchAll={fetchAll} />}
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
