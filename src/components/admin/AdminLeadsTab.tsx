import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Download, Search, Trash2, ChevronRight, X, Send, Clock, Phone,
  Mail as MailIcon, User, LayoutGrid, List, GripVertical,
  ArrowRight, Plus, CalendarClock
} from "lucide-react";
import { toast } from "sonner";

const STATUSES = [
  { value: "nouveau", label: "Nouveau", color: "bg-blue-500/15 text-blue-400", dot: "#3b82f6", emoji: "🆕" },
  { value: "contacté", label: "Contacté", color: "bg-conversion/15 text-conversion", dot: "hsl(35, 85%, 56%)", emoji: "📞" },
  { value: "qualifié", label: "Qualifié", color: "bg-primary/15 text-primary", dot: "hsl(265, 89%, 60%)", emoji: "✅" },
  { value: "converti", label: "Converti", color: "bg-visibility/15 text-visibility", dot: "hsl(158, 60%, 48%)", emoji: "🎉" },
  { value: "perdu", label: "Perdu", color: "bg-destructive/15 text-destructive", dot: "hsl(0, 84%, 60%)", emoji: "❌" },
];

const statusColor = (s: string) => STATUSES.find(st => st.value === s)?.color || "bg-secondary text-muted-foreground";

interface AdminLeadsTabProps {
  leads: any[];
  fetchAll: () => void;
}

const AdminLeadsTab = ({ leads, fetchAll }: AdminLeadsTabProps) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpData, setFollowUpData] = useState({ scheduled_at: "", type: "email", message: "" });
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const filteredLeads = leads.filter((l: any) => {
    const matchSearch = `${l.prenom} ${l.nom} ${l.email} ${l.secteur}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || (l.status || "nouveau") === filterStatus;
    return matchSearch && matchStatus;
  });

  const kanbanColumns = useMemo(() => {
    const cols: Record<string, any[]> = {};
    STATUSES.forEach(s => { cols[s.value] = []; });
    filteredLeads.forEach(l => {
      const s = l.status || "nouveau";
      if (cols[s]) cols[s].push(l);
    });
    return cols;
  }, [filteredLeads]);

  const openLead = async (lead: any) => {
    setSelectedLead(lead);
    const [n, f] = await Promise.all([
      supabase.from("lead_notes").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }),
      supabase.from("follow_ups").select("*").eq("lead_id", lead.id).order("scheduled_at", { ascending: true }),
    ]);
    if (n.data) setNotes(n.data);
    if (f.data) setFollowUps(f.data);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("audit_requests").update({ status } as any).eq("id", id);
    fetchAll();
    if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    await supabase.from("lead_notes").insert({ lead_id: selectedLead.id, content: newNote } as any);
    setNewNote("");
    const { data } = await supabase.from("lead_notes").select("*").eq("lead_id", selectedLead.id).order("created_at", { ascending: false });
    if (data) setNotes(data);
    toast("Note ajoutée ✓");
  };

  const addFollowUp = async () => {
    if (!followUpData.scheduled_at || !selectedLead) return;
    await supabase.from("follow_ups").insert({ lead_id: selectedLead.id, ...followUpData } as any);
    setShowFollowUpForm(false);
    setFollowUpData({ scheduled_at: "", type: "email", message: "" });
    const { data } = await supabase.from("follow_ups").select("*").eq("lead_id", selectedLead.id).order("scheduled_at", { ascending: true });
    if (data) setFollowUps(data);
    toast("Relance programmée ✓");
  };

  const toggleFollowUp = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await supabase.from("follow_ups").update({ status: newStatus } as any).eq("id", id);
    const { data } = await supabase.from("follow_ups").select("*").eq("lead_id", selectedLead.id).order("scheduled_at", { ascending: true });
    if (data) setFollowUps(data);
  };

  const deleteRow = async (id: string) => {
    await supabase.from("audit_requests").delete().eq("id", id);
    fetchAll();
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  const exportCSV = () => {
    const rows = leads.map((l: any) => `${l.created_at},${l.prenom},${l.nom},${l.email},${l.telephone || ""},${l.secteur},${l.besoin || ""},${l.status || "nouveau"}`);
    const csv = "Date,Prénom,Nom,Email,Téléphone,Secteur,Besoin,Statut\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
  };

  const typeIcon = (t: string) => t === "email" ? <MailIcon className="size-3" /> : t === "call" ? <Phone className="size-3" /> : <Clock className="size-3" />;

  const handleDragStart = (leadId: string) => setDraggedLeadId(leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetStatus: string) => {
    if (!draggedLeadId) return;
    updateStatus(draggedLeadId, targetStatus);
    setDraggedLeadId(null);
  };

  const daysSinceCreation = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    return `il y a ${diff}j`;
  };

  const nextStatusValue = (current: string) => {
    const idx = STATUSES.findIndex(s => s.value === current);
    if (idx >= 0 && idx < STATUSES.length - 2) return STATUSES[idx + 1].value;
    return null;
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className={`${selectedLead ? "w-1/2" : "w-full"} flex flex-col transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{filteredLeads.length} lead{filteredLeads.length > 1 ? "s" : ""}</span>
            <div className="flex bg-secondary/50 rounded-lg p-0.5 border border-border/20">
              <button onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "kanban" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="size-3.5" />
              </button>
              <button onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="size-3.5" />
              </button>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs">
            <Download className="size-3.5 mr-1.5" />Export CSV
          </Button>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          <button onClick={() => setFilterStatus(null)}
            className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${!filterStatus ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
            Tous ({leads.length})
          </button>
          {STATUSES.map(s => {
            const count = leads.filter((l: any) => (l.status || "nouveau") === s.value).length;
            return (
              <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? null : s.value)}
                className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${filterStatus === s.value ? s.color : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                {s.emoji} {s.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, email, secteur..."
            className="w-full bg-secondary/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-border/20 focus:border-primary/30 transition-colors" />
        </div>

        {/* KANBAN VIEW */}
        {viewMode === "kanban" ? (
          <div className="flex gap-3 overflow-x-auto flex-1 pb-2">
            {STATUSES.map(status => {
              const cards = kanbanColumns[status.value] || [];
              return (
                <div key={status.value}
                  className="flex-shrink-0 w-[240px] flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(status.value)}
                >
                  {/* Column header */}
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${status.color}`}>
                    <span className="text-xs">{status.emoji}</span>
                    <span className="text-xs font-semibold flex-1">{status.label}</span>
                    <span className="text-[10px] font-bold opacity-70">{cards.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 bg-secondary/20 rounded-b-xl p-2 space-y-2 overflow-y-auto border border-border/10 border-t-0 min-h-[200px]">
                    {cards.length === 0 && (
                      <div className="text-[11px] text-muted-foreground/40 text-center py-8">
                        Déposez un lead ici
                      </div>
                    )}
                    {cards.map((l: any) => {
                      const next = nextStatusValue(l.status || "nouveau");
                      return (
                        <div key={l.id}
                          draggable
                          onDragStart={() => handleDragStart(l.id)}
                          onClick={() => openLead(l)}
                          className={`card-surface p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all group ${
                            selectedLead?.id === l.id ? "border-primary/40 ring-1 ring-primary/20" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <GripVertical className="size-3 text-muted-foreground/30 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate">{l.prenom} {l.nom}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{l.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{l.secteur}</span>
                            <span className="text-[9px] text-muted-foreground/60">{daysSinceCreation(l.created_at)}</span>
                          </div>
                          {next && (
                            <button onClick={(e) => { e.stopPropagation(); updateStatus(l.id, next); }}
                              className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] text-primary/60 hover:text-primary bg-primary/5 hover:bg-primary/10 rounded-lg py-1 transition-all opacity-0 group-hover:opacity-100">
                              <ArrowRight className="size-2.5" />Avancer
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="card-surface overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border/20 text-left">
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Date</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Client</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Secteur</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Besoin</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Statut</th>
                  <th className="p-3.5 text-[11px] text-muted-foreground font-medium">Ancienneté</th>
                  <th className="p-3.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-muted-foreground text-sm">Aucun lead trouvé</td></tr>
                ) : filteredLeads.map((l: any) => (
                  <tr key={l.id} onClick={() => openLead(l)}
                    className={`border-b border-border/10 cursor-pointer transition-colors ${selectedLead?.id === l.id ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                    <td className="p-3.5 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="size-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-[13px]">{l.prenom} {l.nom}</p>
                          <p className="text-[11px] text-muted-foreground">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-muted-foreground">{l.secteur}</td>
                    <td className="p-3.5 text-xs text-muted-foreground max-w-[150px] truncate">{l.besoin || "—"}</td>
                    <td className="p-3.5">
                      <select value={l.status || "nouveau"} onClick={e => e.stopPropagation()}
                        onChange={e => updateStatus(l.id, e.target.value)}
                        className={`text-[11px] rounded-full px-2.5 py-1 font-semibold ${statusColor(l.status || "nouveau")} border-0 cursor-pointer outline-none`}>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="p-3.5 text-[11px] text-muted-foreground">{daysSinceCreation(l.created_at)}</td>
                    <td className="p-3.5"><ChevronRight className="size-4 text-muted-foreground/50" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead detail panel */}
      {selectedLead && (
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">{selectedLead.prenom} {selectedLead.nom}</h2>
                <p className="text-xs text-muted-foreground">{selectedLead.secteur} • {daysSinceCreation(selectedLead.created_at)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => deleteRow(selectedLead.id)} className="text-destructive/60 hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="size-4" /></button>
              <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary"><X className="size-4" /></button>
            </div>
          </div>

          {/* Quick status progression */}
          <div className="card-surface p-4">
            <div className="flex items-center gap-1">
              {STATUSES.map((s, i) => {
                const currentIdx = STATUSES.findIndex(st => st.value === (selectedLead.status || "nouveau"));
                const isActive = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s.value} className="flex items-center flex-1">
                    <button onClick={() => updateStatus(selectedLead.id, s.value)}
                      className={`flex-1 py-2 text-[10px] font-semibold rounded-lg transition-all ${
                        isCurrent ? s.color + " ring-1 ring-current" :
                        isActive ? s.color + " opacity-60" :
                        "bg-secondary/50 text-muted-foreground/40 hover:text-muted-foreground"
                      }`}>
                      {s.emoji} {s.label}
                    </button>
                    {i < STATUSES.length - 1 && <ChevronRight className="size-3 text-muted-foreground/30 mx-0.5 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact info */}
          <div className="card-surface p-5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Informations de contact</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><MailIcon className="size-3.5 text-muted-foreground" /><span>{selectedLead.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="size-3.5 text-muted-foreground" /><span>{selectedLead.telephone || "—"}</span></div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Besoin exprimé</p>
                <p className="text-sm">{selectedLead.besoin || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Date d'entrée</p>
                <p className="text-sm">{new Date(selectedLead.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </div>

          {/* Timeline / Follow-ups */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Relances & suivi</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFollowUpForm(!showFollowUpForm)} className="text-xs h-7">
                <Plus className="size-3 mr-1" />Planifier
              </Button>
            </div>
            {showFollowUpForm && (
              <div className="bg-secondary/30 rounded-xl p-3 mb-3 space-y-2 border border-border/20">
                <div className="flex gap-2">
                  <input type="datetime-local" value={followUpData.scheduled_at}
                    onChange={e => setFollowUpData({ ...followUpData, scheduled_at: e.target.value })}
                    className="flex-1 bg-background rounded-lg px-3 py-1.5 text-sm outline-none border border-border/20" />
                  <select value={followUpData.type} onChange={e => setFollowUpData({ ...followUpData, type: e.target.value })}
                    className="bg-background rounded-lg px-2 py-1.5 text-sm border border-border/20">
                    <option value="email">Email</option><option value="call">Appel</option><option value="sms">SMS</option>
                  </select>
                </div>
                <textarea value={followUpData.message} onChange={e => setFollowUpData({ ...followUpData, message: e.target.value })}
                  placeholder="Message / notes de relance..." className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none resize-none h-14 border border-border/20" />
                <Button size="sm" onClick={addFollowUp} className="text-xs h-7">Programmer</Button>
              </div>
            )}
            <div className="space-y-1.5">
              {followUps.length === 0 && <p className="text-xs text-muted-foreground py-2">Aucune relance programmée</p>}
              {followUps.map((f: any) => {
                const overdue = new Date(f.scheduled_at) < new Date() && f.status !== "done";
                return (
                  <div key={f.id} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                    f.status === "done" ? "opacity-40" : overdue ? "bg-destructive/5 border border-destructive/15" : ""
                  }`}>
                    <button onClick={() => toggleFollowUp(f.id, f.status)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        f.status === "done" ? "bg-visibility border-visibility" : "border-border hover:border-primary"
                      }`}>
                      {f.status === "done" && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="flex items-center gap-1.5">{typeIcon(f.type)}</div>
                    <span className="flex-1 text-xs">
                      {new Date(f.scheduled_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {overdue && <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">EN RETARD</span>}
                    {f.message && <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">{f.message}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="card-surface p-5 flex-1 flex flex-col">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notes internes</h3>
            <div className="flex-1 space-y-2 overflow-y-auto mb-3">
              {notes.length === 0 && <p className="text-xs text-muted-foreground py-2">Aucune note</p>}
              {notes.map((n: any) => (
                <div key={n.id} className="bg-secondary/30 rounded-lg p-3 border border-border/10">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{new Date(n.created_at).toLocaleString("fr-FR")}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="Ajouter une note..." className="flex-1 bg-secondary/50 rounded-xl px-3.5 py-2 text-sm outline-none border border-border/20 focus:border-primary/30 transition-colors" />
              <Button size="sm" variant="ghost" onClick={addNote} className="h-9 w-9 p-0"><Send className="size-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadsTab;
