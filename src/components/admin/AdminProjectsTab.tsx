import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FolderKanban, Plus, X, Save, User, ChevronRight, CheckCircle, Clock,
  AlertTriangle, Truck, Wrench, Trash2
} from "lucide-react";

interface Props {
  leads: any[];
  projects: any[];
  fetchAll: () => void;
}

const PROJECT_STATUSES = [
  { value: "en_cours", label: "En cours", color: "bg-primary/15 text-primary", icon: Clock },
  { value: "en_attente", label: "En attente", color: "bg-conversion/15 text-conversion", icon: AlertTriangle },
  { value: "livre", label: "Livré", color: "bg-visibility/15 text-visibility", icon: Truck },
  { value: "maintenance", label: "Maintenance", color: "bg-muted/50 text-muted-foreground", icon: Wrench },
];

const DEFAULT_TASKS = [
  "Brief & cahier des charges",
  "Maquette / Design",
  "Développement",
  "Intégration contenu",
  "Tests & corrections",
  "Mise en ligne",
  "Formation client",
];

const AdminProjectsTab = ({ leads, projects, fetchAll }: Props) => {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLeadId, setNewLeadId] = useState("");
  const [newTask, setNewTask] = useState("");

  const convertedLeads = leads.filter(l => l.status === "converti");

  const enriched = useMemo(() => {
    return projects.map((p: any) => {
      const lead = leads.find((l: any) => l.id === p.lead_id);
      return { ...p, lead };
    });
  }, [projects, leads]);

  const byStatus = (status: string) => enriched.filter(p => p.status === status);

  const openProject = async (project: any) => {
    setSelectedProject(project);
    const { data } = await supabase.from("project_tasks").select("*").eq("project_id", project.id).order("sort_order", { ascending: true });
    if (data) setTasks(data);
  };

  const createProject = async () => {
    if (!newName.trim() || !newLeadId) return;
    const { data } = await supabase.from("client_projects").insert({ lead_id: newLeadId, name: newName.trim() } as any).select().single();
    if (data) {
      // Insert default tasks
      const taskInserts = DEFAULT_TASKS.map((title, i) => ({
        project_id: (data as any).id,
        title,
        sort_order: i,
      }));
      await supabase.from("project_tasks").insert(taskInserts as any);
    }
    setShowNew(false);
    setNewName("");
    setNewLeadId("");
    toast("Projet créé ✓");
    fetchAll();
  };

  const updateProjectStatus = async (id: string, status: string) => {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (status === "livre") updateData.delivered_at = new Date().toISOString();
    await supabase.from("client_projects").update(updateData).eq("id", id);
    if (selectedProject?.id === id) setSelectedProject({ ...selectedProject, ...updateData });
    fetchAll();
  };

  const updateProgress = async (id: string, progress: number) => {
    await supabase.from("client_projects").update({ progress, updated_at: new Date().toISOString() } as any).eq("id", id);
    if (selectedProject?.id === id) setSelectedProject({ ...selectedProject, progress });
    fetchAll();
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase.from("project_tasks").update({ completed: !completed } as any).eq("id", taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
    // Auto-update progress
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t);
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
    if (selectedProject) updateProgress(selectedProject.id, progress);
  };

  const addTask = async () => {
    if (!newTask.trim() || !selectedProject) return;
    await supabase.from("project_tasks").insert({ project_id: selectedProject.id, title: newTask.trim(), sort_order: tasks.length } as any);
    setNewTask("");
    const { data } = await supabase.from("project_tasks").select("*").eq("project_id", selectedProject.id).order("sort_order", { ascending: true });
    if (data) setTasks(data);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    await supabase.from("client_projects").delete().eq("id", id);
    setSelectedProject(null);
    fetchAll();
    toast("Projet supprimé");
  };

  const statusInfo = (s: string) => PROJECT_STATUSES.find(ps => ps.value === s) || PROJECT_STATUSES[0];

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className={`${selectedProject ? "w-1/2" : "w-full"} flex flex-col transition-all`}>
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {PROJECT_STATUSES.map(ps => (
            <div key={ps.value} className="card-surface p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${ps.color.split(" ")[0]} flex items-center justify-center`}>
                <ps.icon className={`size-4 ${ps.color.split(" ")[1]}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{ps.label}</p>
                <p className="text-lg font-extrabold">{byStatus(ps.value).length}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{projects.length} projet{projects.length > 1 ? "s" : ""}</p>
          <Button size="sm" onClick={() => setShowNew(true)} className="text-xs"><Plus className="size-3 mr-1" />Nouveau projet</Button>
        </div>

        {/* New project form */}
        {showNew && (
          <div className="card-surface p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Nouveau projet</h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <select value={newLeadId} onChange={e => setNewLeadId(e.target.value)}
              className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm outline-none border border-border/20">
              <option value="">Sélectionner un client...</option>
              {convertedLeads.map(l => <option key={l.id} value={l.id}>{l.prenom} {l.nom} — {l.secteur}</option>)}
            </select>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom du projet (ex: Site vitrine, Refonte, App...)"
              className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm outline-none border border-border/20" />
            <Button size="sm" onClick={createProject} disabled={!newName.trim() || !newLeadId}>Créer le projet</Button>
          </div>
        )}

        {/* Project list */}
        <div className="space-y-2 overflow-y-auto flex-1">
          {enriched.length === 0 ? (
            <div className="card-surface p-12 text-center flex flex-col items-center">
              <FolderKanban className="size-12 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm">Aucun projet en cours</p>
            </div>
          ) : enriched.map((p: any) => {
            const si = statusInfo(p.status);
            return (
              <div key={p.id} onClick={() => openProject(p)}
                className={`card-surface p-4 cursor-pointer transition-all hover:border-primary/20 ${selectedProject?.id === p.id ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${si.color.split(" ")[0]} flex items-center justify-center`}>
                      <si.icon className={`size-4 ${si.color.split(" ")[1]}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-[13px]">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.lead?.prenom} {p.lead?.nom} • {p.lead?.secteur}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 bg-primary" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">{p.progress}%</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${si.color}`}>{si.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      {selectedProject && (
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{selectedProject.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedProject.lead?.prenom} {selectedProject.lead?.nom}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => deleteProject(selectedProject.id)} className="text-destructive/60 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="size-4" /></button>
              <button onClick={() => setSelectedProject(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary"><X className="size-4" /></button>
            </div>
          </div>

          {/* Status */}
          <div className="card-surface p-5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Statut du projet</h3>
            <div className="flex flex-wrap gap-2">
              {PROJECT_STATUSES.map(ps => (
                <button key={ps.value} onClick={() => updateProjectStatus(selectedProject.id, ps.value)}
                  className={`text-[11px] px-3 py-2 rounded-xl font-medium transition-all ${selectedProject.status === ps.value ? ps.color + " ring-2 ring-offset-2 ring-offset-background ring-current" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                  {ps.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Avancement</span>
                <span className="text-sm font-extrabold text-primary">{selectedProject.progress}%</span>
              </div>
              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500 bg-primary" style={{ width: `${selectedProject.progress}%` }} />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="card-surface p-5 flex-1 flex flex-col">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Checklist ({tasks.filter(t => t.completed).length}/{tasks.length})
            </h3>
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {tasks.map((t: any) => (
                <label key={t.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-secondary/30 ${t.completed ? "opacity-50" : ""}`}>
                  <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t.id, t.completed)} />
                  <span className={`text-sm ${t.completed ? "line-through" : ""}`}>{t.title}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/20">
              <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
                placeholder="Ajouter une étape..." className="flex-1 bg-secondary/50 rounded-xl px-3.5 py-2 text-sm outline-none border border-border/20" />
              <Button size="sm" variant="ghost" onClick={addTask} className="h-9"><Plus className="size-4" /></Button>
            </div>
          </div>

          {/* Dates */}
          <div className="card-surface p-5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dates</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Démarré le</p>
                <p className="font-medium">{new Date(selectedProject.started_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Livré le</p>
                <p className="font-medium">{selectedProject.delivered_at ? new Date(selectedProject.delivered_at).toLocaleDateString("fr-FR") : "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsTab;
