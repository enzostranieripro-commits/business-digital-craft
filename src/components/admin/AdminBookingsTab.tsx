import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, MapPin, Mail, Phone, User } from "lucide-react";

interface Props {
  bookings: any[];
  fetchAll: () => void;
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending: { label: "En attente", class: "bg-conversion/15 text-conversion" },
  confirmed: { label: "Confirmé", class: "bg-visibility/15 text-visibility" },
  cancelled: { label: "Annulé", class: "bg-destructive/15 text-destructive" },
};

const AdminBookingsTab = ({ bookings, fetchAll }: Props) => {
  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status } as any).eq("id", id);
    fetchAll();
  };

  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const cancelled = bookings.filter(b => b.status === "cancelled").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En attente", value: pending, color: "text-conversion", icon: Clock },
          { label: "Confirmés", value: confirmed, color: "text-visibility", icon: Calendar },
          { label: "Annulés", value: cancelled, color: "text-destructive", icon: Calendar },
        ].map(k => (
          <div key={k.label} className="card-surface p-5">
            <div className="flex items-center gap-2 mb-2">
              <k.icon className={`size-4 ${k.color}`} />
              <span className="text-xs text-muted-foreground">{k.label}</span>
            </div>
            <p className={`text-3xl font-extrabold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Client</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Date & Heure</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Secteur</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Besoin</th>
              <th className="p-4 text-left text-xs text-muted-foreground font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Aucun rendez-vous</td></tr>
            ) : bookings.map((b: any) => {
              const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
              return (
                <tr key={b.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{b.prenom} {b.nom}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="size-2.5" />{b.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{b.date}</p>
                    <p className="text-xs text-muted-foreground">{b.time}</p>
                  </td>
                  <td className="p-4 text-muted-foreground">{b.secteur}</td>
                  <td className="p-4 text-muted-foreground text-xs max-w-[200px] truncate">{b.besoin || "—"}</td>
                  <td className="p-4">
                    <select
                      value={b.status}
                      onChange={e => updateStatus(b.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer outline-none ${st.class}`}
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsTab;
