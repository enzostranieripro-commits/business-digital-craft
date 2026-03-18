import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, User, Mail, Phone, MapPin, Calendar, FileText, TrendingUp, ChevronRight, X } from "lucide-react";

interface AdminClientsTabProps {
  leads: any[];
  bookings: any[];
  products: any[];
}

const AdminClientsTab = ({ leads, bookings, products }: AdminClientsTabProps) => {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);

  // Clients = converted leads (or all leads to build portfolio)
  const clients = useMemo(() => {
    return leads
      .filter((l: any) => l.status === "converti")
      .map((l: any) => {
        const clientBookings = bookings.filter((b: any) => b.email === l.email);
        const clientProducts = products.filter((p: any) => p.email === l.email);
        return {
          ...l,
          bookings: clientBookings,
          products: clientProducts,
          totalBookings: clientBookings.length,
          confirmedBookings: clientBookings.filter((b: any) => b.status === "confirmed").length,
          productsList: clientProducts.map((p: any) => p.product),
        };
      });
  }, [leads, bookings, products]);

  const filteredClients = clients.filter((c: any) =>
    `${c.prenom} ${c.nom} ${c.email} ${c.secteur}`.toLowerCase().includes(search.toLowerCase())
  );

  const openClient = async (client: any) => {
    setSelectedClient(client);
    const [n, f] = await Promise.all([
      supabase.from("lead_notes" as any).select("*").eq("lead_id", client.id).order("created_at", { ascending: false }),
      supabase.from("follow_ups" as any).select("*").eq("lead_id", client.id).order("scheduled_at", { ascending: false }),
    ]);
    if (n.data) setNotes(n.data as any[]);
    if (f.data) setFollowUps(f.data as any[]);
  };

  const offerColor = (o: string) =>
    o === "Visibilité" ? "bg-visibility/20 text-visibility" :
    o === "Autorité" ? "bg-primary/20 text-primary" :
    o === "Conversion" ? "bg-conversion/20 text-conversion" :
    "bg-secondary text-muted-foreground";

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Client list */}
      <div className={`${selectedClient ? "w-1/2" : "w-full"} flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Portefeuille Clients</h1>
            <p className="text-sm text-muted-foreground">{clients.length} client{clients.length > 1 ? "s" : ""} converti{clients.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2 text-sm outline-none" />
        </div>

        {filteredClients.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <User className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aucun client converti pour le moment</p>
            <p className="text-xs text-muted-foreground mt-1">Les leads passés au statut "Converti" apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid gap-3 overflow-y-auto flex-1">
            {filteredClients.map((c: any) => (
              <div key={c.id} onClick={() => openClient(c)}
                className={`card-surface p-4 cursor-pointer transition-all hover:border-primary/30 ${selectedClient?.id === c.id ? "border-primary/50 bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-visibility/20 flex items-center justify-center">
                      <User className="size-5 text-visibility" />
                    </div>
                    <div>
                      <p className="font-semibold">{c.prenom} {c.nom}</p>
                      <p className="text-xs text-muted-foreground">{c.secteur} • {c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.productsList.length > 0 && (
                      <div className="flex gap-1">
                        {[...new Set(c.productsList)].map((p: any) => (
                          <span key={p} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${offerColor(p)}`}>{p}</span>
                        ))}
                      </div>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="size-3" />{c.totalBookings} RDV</span>
                  <span className="flex items-center gap-1"><FileText className="size-3" />{c.productsList.length} offre{c.productsList.length > 1 ? "s" : ""}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="size-3" />Client depuis {new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client detail panel */}
      {selectedClient && (
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedClient.prenom} {selectedClient.nom}</h2>
            <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>

          {/* Client card */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-visibility/20 flex items-center justify-center">
                <User className="size-7 text-visibility" />
              </div>
              <div>
                <p className="font-display font-bold text-lg">{selectedClient.prenom} {selectedClient.nom}</p>
                <p className="text-sm text-muted-foreground">{selectedClient.secteur}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3.5" />{selectedClient.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5" />{selectedClient.telephone || "—"}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-3.5" />{selectedClient.secteur}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-3.5" />Depuis {new Date(selectedClient.created_at).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>

          {/* Products / Offers */}
          {selectedClient.products.length > 0 && (
            <div className="card-surface p-4">
              <h3 className="font-semibold text-sm mb-3">Offres souscrites</h3>
              <div className="space-y-2">
                {selectedClient.products.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${offerColor(p.product)}`}>{p.product}</span>
                      <span className="text-sm">{p.secteur}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings history */}
          {selectedClient.bookings.length > 0 && (
            <div className="card-surface p-4">
              <h3 className="font-semibold text-sm mb-3">Historique RDV</h3>
              <div className="space-y-2">
                {selectedClient.bookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl text-sm">
                    <div>
                      <p>📅 {b.date} à {b.time}</p>
                      {b.besoin && <p className="text-xs text-muted-foreground mt-0.5">{b.besoin}</p>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-visibility/20 text-visibility" : b.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-conversion/20 text-conversion"}`}>
                      {b.status === "confirmed" ? "Confirmé" : b.status === "cancelled" ? "Annulé" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card-surface p-4">
            <h3 className="font-semibold text-sm mb-3">Notes ({notes.length})</h3>
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune note</p>
            ) : (
              <div className="space-y-2">
                {notes.map((n: any) => (
                  <div key={n.id} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm">{n.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-ups history */}
          <div className="card-surface p-4">
            <h3 className="font-semibold text-sm mb-3">Historique relances</h3>
            {followUps.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune relance</p>
            ) : (
              <div className="space-y-2">
                {followUps.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 p-2 text-sm">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${f.status === "done" ? "bg-visibility/20 text-visibility" : "bg-secondary text-muted-foreground"}`}>
                      {f.status === "done" ? "✓" : "○"}
                    </span>
                    <span className="capitalize text-xs text-muted-foreground">{f.type}</span>
                    <span className="flex-1">{new Date(f.scheduled_at).toLocaleDateString("fr-FR")}</span>
                    {f.message && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{f.message}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientsTab;
