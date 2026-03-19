import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, MapPin, Mail, Phone, User, ChevronLeft, ChevronRight, List, CalendarDays, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

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
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status } as any).eq("id", id);
    fetchAll();
  };

  // Filtered bookings for list view
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = !search || `${b.prenom} ${b.nom} ${b.email} ${b.secteur}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || b.status === filterStatus;
      const matchDateFrom = !dateFrom || b.date >= dateFrom;
      const matchDateTo = !dateTo || b.date <= dateTo;
      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [bookings, search, filterStatus, dateFrom, dateTo]);

  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const cancelled = bookings.filter(b => b.status === "cancelled").length;

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = (getDay(monthStart) + 6) % 7; // Monday start

  const bookingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach(b => {
      const key = b.date; // YYYY-MM-DD format
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  const selectedBookings = selectedDate
    ? bookingsByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  // Upcoming bookings (next 7 days)
  const today = new Date();
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(b => {
        const bDate = new Date(b.date);
        const diff = (bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7 && b.status !== "cancelled";
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "En attente", value: pending, color: "text-conversion", icon: Clock },
          { label: "Confirmés", value: confirmed, color: "text-visibility", icon: Calendar },
          { label: "Annulés", value: cancelled, color: "text-destructive", icon: Calendar },
          { label: "Total", value: bookings.length, color: "text-foreground", icon: CalendarDays },
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

      {/* View toggle + export */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
          <button onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === "calendar" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <CalendarDays className="size-3.5" /> Calendrier
          </button>
          <button onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <List className="size-3.5" /> Liste
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => {
            const rows = bookings.map((b: any) => `${b.date},${b.time},${b.prenom},${b.nom},${b.email},${b.telephone || ""},${b.secteur},${b.besoin || ""},${b.status}`);
            const csv = "Date,Heure,Prénom,Nom,Email,Téléphone,Secteur,Besoin,Statut\n" + rows.join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "rendez-vous.csv"; a.click();
          }}>
            <Download className="size-3.5 mr-1.5" />Export CSV
          </Button>
          {view === "calendar" && (
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[140px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </span>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
        </div>
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="card-surface rounded-xl p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider py-1">{d}</div>
                ))}
              </div>
              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-20 rounded-lg" />
                ))}
                {daysInMonth.map(day => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayBookings = bookingsByDate[key] || [];
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const hasBookings = dayBookings.length > 0;
                  const pendingCount = dayBookings.filter(b => b.status === "pending").length;
                  const confirmedCount = dayBookings.filter(b => b.status === "confirmed").length;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={`h-20 rounded-lg p-1.5 text-left transition-all relative ${
                        isSelected ? "bg-primary/10 ring-1 ring-primary" :
                        isToday(day) ? "bg-primary/5 ring-1 ring-primary/30" :
                        hasBookings ? "bg-secondary/30 hover:bg-secondary/50" :
                        "hover:bg-secondary/20"
                      }`}
                    >
                      <span className={`text-xs font-medium ${isToday(day) ? "text-primary" : ""}`}>
                        {day.getDate()}
                      </span>
                      {hasBookings && (
                        <div className="mt-1 space-y-0.5">
                          {confirmedCount > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-visibility" />
                              <span className="text-[9px] text-visibility font-medium">{confirmedCount}</span>
                            </div>
                          )}
                          {pendingCount > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-conversion" />
                              <span className="text-[9px] text-conversion font-medium">{pendingCount}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="w-[320px] space-y-4">
            {/* Selected date bookings */}
            <div className="card-surface p-4 rounded-xl">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {selectedDate
                  ? format(selectedDate, "EEEE d MMMM", { locale: fr })
                  : "Prochains RDV (7 jours)"
                }
              </h3>
              {(selectedDate ? selectedBookings : upcomingBookings).length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Aucun rendez-vous</p>
              ) : (
                <div className="space-y-2">
                  {(selectedDate ? selectedBookings : upcomingBookings).map((b: any) => {
                    const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
                    return (
                      <div key={b.id} className="bg-secondary/20 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-primary" />
                            <span className="text-sm font-semibold">{b.time}</span>
                            {!selectedDate && (
                              <span className="text-[10px] text-muted-foreground">{b.date}</span>
                            )}
                          </div>
                          <select
                            value={b.status}
                            onChange={e => updateStatus(b.id, e.target.value)}
                            className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border-0 cursor-pointer outline-none ${st.class}`}
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="cancelled">Annulé</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{b.prenom} {b.nom}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="size-2.5" />{b.email}
                          </p>
                          {b.telephone && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Phone className="size-2.5" />{b.telephone}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="bg-secondary/50 px-2 py-0.5 rounded-full">{b.secteur}</span>
                          {b.besoin && <span className="truncate">{b.besoin}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table view */}
      {view === "list" && (
        <div className="card-surface overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                <th className="p-4 text-left text-xs text-muted-foreground font-medium">Client</th>
                <th className="p-4 text-left text-xs text-muted-foreground font-medium">Date & Heure</th>
                <th className="p-4 text-left text-xs text-muted-foreground font-medium">Contact</th>
                <th className="p-4 text-left text-xs text-muted-foreground font-medium">Secteur</th>
                <th className="p-4 text-left text-xs text-muted-foreground font-medium">Besoin</th>
                <th className="p-4 text-left text-xs text-muted-foreground font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucun rendez-vous</td></tr>
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
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{b.date}</p>
                      <p className="text-xs text-muted-foreground">{b.time}</p>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Mail className="size-2.5" />{b.email}</div>
                      {b.telephone && <div className="flex items-center gap-1 mt-0.5"><Phone className="size-2.5" />{b.telephone}</div>}
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
      )}
    </div>
  );
};

export default AdminBookingsTab;
