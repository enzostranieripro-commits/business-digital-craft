import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Search, Trash2, MessageSquarePlus, ChevronRight, X, Send, Clock, Phone, Mail as MailIcon } from "lucide-react";
import { toast } from "sonner";

const STATUSES = [
  { value: "nouveau", label: "Nouveau", color: "bg-blue-500/20 text-blue-400" },
  { value: "contacté", label: "Contacté", color: "bg-conversion/20 text-conversion" },
  { value: "qualifié", label: "Qualifié", color: "bg-primary/20 text-primary" },
  { value: "converti", label: "Converti", color: "bg-visibility/20 text-visibility" },
  { value: "perdu", label: "Perdu", color: "bg-destructive/20 text-destructive" },
];

const statusColor = (s: string) => STATUSES.find(st => st.value === s)?.color || "bg-secondary text-muted-foreground";

interface AdminLeadsTabProps {
  leads: any[];
  fetchAll: () => void;
}

const AdminLeadsTab = ({ leads, fetchAll }: AdminLeadsTabProps) => {
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpData, setFollowUpData] = useState({ scheduled_at: "", type: "email", message: "" });

  const filteredLeads = leads.filter((l: any) =>
    `${l.prenom} ${l.nom} ${l.email} ${l.secteur} ${l.status || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const openLead = async (lead: any) => {
    setSelectedLead(lead);
    const [n, f] = await Promise.all([
      supabase.from("lead_notes" as any).select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }),
      supabase.from("follow_ups" as any).select("*").eq("lead_id", lead.id).order("scheduled_at", { ascending: true }),
    ]);
    if (n.data) setNotes(n.data as any[]);
    if (f.data) setFollowUps(f.data as any[]);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("audit_requests" as any).update({ status } as any).eq("id", id);
    fetchAll();
    if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    await supabase.from("lead_notes" as any).insert({ lead_id: selectedLead.id, content: newNote } as any);
    setNewNote("");
    const { data } = await supabase.from("lead_notes" as any).select("*").eq("lead_id", selectedLead.id).order("created_at", { ascending: false });
    if (data) setNotes(data as any[]);
    toast("Note ajoutée");
  };

  const addFollowUp = async () => {
    if (!followUpData.scheduled_at || !selectedLead) return;
    await supabase.from("follow_ups" as any).insert({ lead_id: selectedLead.id, ...followUpData } as any);
    setShowFollowUpForm(false);
    setFollowUpData({ scheduled_at: "", type: "email", message: "" });
    const { data } = await supabase.from("follow_ups" as any).select("*").eq("lead_id", selectedLead.id).order("scheduled_at", { ascending: true });
    if (data) setFollowUps(data as any[]);
    toast("Relance programmée");
  };

  const toggleFollowUp = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await supabase.from("follow_ups" as any).update({ status: newStatus } as any).eq("id", id);
    const { data } = await supabase.from("follow_ups" as any).select("*").eq("lead_id", selectedLead.id).order("scheduled_at", { ascending: true });
    if (data) setFollowUps(data as any[]);
  };

  const deleteRow = async (id: string) => {
    await supabase.from("audit_requests" as any).delete().eq("id", id);
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

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Lead list */}
      <div className={`${selectedLead ? "w-1/2" : "w-full"} flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Pipeline Leads</h1>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="size-4 mr-2" />CSV</Button>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {STATUSES.map(s => {
            const count = leads.filter((l: any) => (l.status || "nouveau") === s.value).length;
            return (
              <button key={s.value} onClick={() => setSearch(s.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${s.color} hover:opacity-80`}>
                {s.label} ({count})
              </button>
            );
          })}
          <button onClick={() => setSearch("")} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground">
            Tous ({leads.length})
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2 text-sm outline-none" />
        </div>

        <div className="card-surface overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border/30 text-left">
                <th className="p-3 text-xs text-muted-foreground">Date</th>
                <th className="p-3 text-xs text-muted-foreground">Nom</th>
                <th className="p-3 text-xs text-muted-foreground">Secteur</th>
                <th className="p-3 text-xs text-muted-foreground">Statut</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l: any) => (
                <tr key={l.id} onClick={() => openLead(l)}
                  className={`border-b border-border/10 cursor-pointer transition-colors ${selectedLead?.id === l.id ? "bg-primary/5" : "hover:bg-secondary/30"}`}>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="p-3 font-medium">{l.prenom} {l.nom}</td>
                  <td className="p-3 text-xs">{l.secteur}</td>
                  <td className="p-3">
                    <select value={l.status || "nouveau"} onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(l.id, e.target.value)}
                      className={`text-xs rounded-lg px-2 py-1 ${statusColor(l.status || "nouveau")} bg-transparent border-0 cursor-pointer`}>
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead detail panel */}
      {selectedLead && (
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedLead.prenom} {selectedLead.nom}</h2>
            <div className="flex gap-2">
              <button onClick={() => deleteRow(selectedLead.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="size-4" /></button>
              <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
          </div>

          {/* Contact info */}
          <div className="card-surface p-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{selectedLead.email}</p></div>
            <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="font-medium">{selectedLead.telephone || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Secteur</p><p className="font-medium">{selectedLead.secteur}</p></div>
            <div><p className="text-xs text-muted-foreground">Besoin</p><p className="font-medium">{selectedLead.besoin || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Statut</p>
              <select value={selectedLead.status || "nouveau"} onChange={e => updateStatus(selectedLead.id, e.target.value)}
                className={`text-xs rounded-lg px-2 py-1 mt-1 ${statusColor(selectedLead.status || "nouveau")} bg-transparent cursor-pointer`}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedLead.created_at).toLocaleDateString("fr-FR")}</p></div>
          </div>

          {/* Follow-ups */}
          <div className="card-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Relances</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFollowUpForm(!showFollowUpForm)}>
                <Clock className="size-4 mr-1" />Planifier
              </Button>
            </div>
            {showFollowUpForm && (
              <div className="bg-secondary/50 rounded-xl p-3 mb-3 space-y-2">
                <div className="flex gap-2">
                  <input type="datetime-local" value={followUpData.scheduled_at}
                    onChange={e => setFollowUpData({ ...followUpData, scheduled_at: e.target.value })}
                    className="flex-1 bg-background rounded-lg px-3 py-1.5 text-sm outline-none" />
                  <select value={followUpData.type} onChange={e => setFollowUpData({ ...followUpData, type: e.target.value })}
                    className="bg-background rounded-lg px-2 py-1.5 text-sm">
                    <option value="email">Email</option><option value="call">Appel</option><option value="sms">SMS</option>
                  </select>
                </div>
                <textarea value={followUpData.message} onChange={e => setFollowUpData({ ...followUpData, message: e.target.value })}
                  placeholder="Message de relance..." className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none resize-none h-16" />
                <Button size="sm" onClick={addFollowUp}>Programmer</Button>
              </div>
            )}
            <div className="space-y-2">
              {followUps.length === 0 && <p className="text-xs text-muted-foreground">Aucune relance programmée</p>}
              {followUps.map((f: any) => (
                <div key={f.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${f.status === "done" ? "opacity-50" : ""}`}>
                  <button onClick={() => toggleFollowUp(f.id, f.status)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${f.status === "done" ? "bg-visibility border-visibility" : "border-border"}`}>
                    {f.status === "done" && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex items-center gap-1.5">{typeIcon(f.type)}</div>
                  <span className="flex-1">{new Date(f.scheduled_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  {f.message && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{f.message}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card-surface p-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-sm mb-3">Notes internes</h3>
            <div className="flex-1 space-y-2 overflow-y-auto mb-3">
              {notes.length === 0 && <p className="text-xs text-muted-foreground">Aucune note</p>}
              {notes.map((n: any) => (
                <div key={n.id} className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("fr-FR")}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="Ajouter une note..." className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
              <Button size="sm" variant="ghost" onClick={addNote}><Send className="size-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadsTab;
