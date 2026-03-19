import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  RefreshCw, Upload, Download, CheckCircle2, XCircle, Loader2,
  Users, ArrowRightLeft, Zap, ExternalLink
} from "lucide-react";

interface AdminHubspotTabProps {
  leads: any[];
  fetchAll: () => void;
}

const AdminHubspotTab = ({ leads, fetchAll }: AdminHubspotTabProps) => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncAction, setSyncAction] = useState<string | null>(null);
  const [hubspotContacts, setHubspotContacts] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const invoke = async (action: string, data?: any) => {
    const { data: res, error } = await supabase.functions.invoke("hubspot-sync", {
      body: { action, data },
    });
    if (error) throw new Error(error.message);
    return res;
  };

  const checkConnection = async () => {
    try {
      const res = await invoke("status");
      setConnected(res.connected);
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => { checkConnection(); }, []);

  const pushAllLeads = async () => {
    setSyncAction("push_all");
    setLoading(true);
    try {
      const res = await invoke("push_all");
      toast.success(`${res.synced} lead(s) synchronisé(s) vers HubSpot${res.errors > 0 ? ` (${res.errors} erreurs)` : ""}`);
      setLastSync(new Date().toLocaleString("fr-FR"));
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
      setSyncAction(null);
    }
  };

  const pushSingleLead = async (lead: any) => {
    setSyncAction(`push_${lead.id}`);
    setLoading(true);
    try {
      await invoke("push_lead", lead);
      toast.success(`${lead.prenom} ${lead.nom} envoyé vers HubSpot`);
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
      setSyncAction(null);
    }
  };

  const pullContacts = async () => {
    setSyncAction("pull");
    setLoading(true);
    try {
      const res = await invoke("pull_contacts", { limit: 50 });
      setHubspotContacts(res.contacts || []);
      toast.success(`${res.contacts?.length || 0} contact(s) récupéré(s) de HubSpot`);
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
      setSyncAction(null);
    }
  };

  const syncStatuses = async () => {
    setSyncAction("sync_statuses");
    setLoading(true);
    try {
      const res = await invoke("sync_statuses");
      toast.success(`${res.updated} statut(s) mis à jour depuis HubSpot`);
      fetchAll();
      setLastSync(new Date().toLocaleString("fr-FR"));
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
      setSyncAction(null);
    }
  };

  const convertedLeads = leads.filter(l => l.status === "converti").length;
  const newLeads = leads.filter(l => (l.status || "nouveau") === "nouveau").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold flex items-center gap-2">
            <Zap className="size-5 text-[#ff7a59]" />
            Intégration HubSpot CRM
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Synchronisez vos leads avec votre CRM HubSpot
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connected === null ? (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Vérification...
            </span>
          ) : connected ? (
            <span className="flex items-center gap-1.5 text-sm text-visibility">
              <CheckCircle2 className="size-3.5" /> Connecté à HubSpot
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <XCircle className="size-3.5" /> Non connecté
            </span>
          )}
          <Button variant="outline" size="sm" onClick={checkConnection}>
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{leads.length}</p>
              <p className="text-xs text-muted-foreground">Leads locaux</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-visibility/10 flex items-center justify-center">
              <CheckCircle2 className="size-5 text-visibility" />
            </div>
            <div>
              <p className="text-2xl font-bold">{convertedLeads}</p>
              <p className="text-xs text-muted-foreground">Convertis</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff7a59]/10 flex items-center justify-center">
              <Download className="size-5 text-[#ff7a59]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{hubspotContacts.length}</p>
              <p className="text-xs text-muted-foreground">Contacts HubSpot</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card border border-border/20 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm">Actions de synchronisation</h3>
        {lastSync && (
          <p className="text-xs text-muted-foreground">Dernière sync : {lastSync}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button onClick={pushAllLeads} disabled={loading || !connected} className="gap-2 bg-[#ff7a59] hover:bg-[#e0654a] text-white">
            {syncAction === "push_all" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Envoyer tous les leads
          </Button>
          <Button onClick={pullContacts} disabled={loading || !connected} variant="outline" className="gap-2">
            {syncAction === "pull" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Récupérer contacts HubSpot
          </Button>
          <Button onClick={syncStatuses} disabled={loading || !connected} variant="outline" className="gap-2">
            {syncAction === "sync_statuses" ? <Loader2 className="size-4 animate-spin" /> : <ArrowRightLeft className="size-4" />}
            Sync statuts ← HubSpot
          </Button>
          <a href="https://app.hubspot.com/contacts" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="gap-2 w-full">
              <ExternalLink className="size-4" />
              Ouvrir HubSpot
            </Button>
          </a>
        </div>
      </div>

      {/* Leads list with push buttons */}
      <div className="bg-card border border-border/20 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/10">
          <h3 className="font-semibold text-sm">Leads récents — envoi individuel</h3>
        </div>
        <div className="divide-y divide-border/10 max-h-[400px] overflow-y-auto">
          {leads.slice(0, 20).map(lead => (
            <div key={lead.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{lead.prenom} {lead.nom}</p>
                <p className="text-xs text-muted-foreground truncate">{lead.email} • {lead.secteur}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => pushSingleLead(lead)}
                disabled={loading || !connected}
                className="flex-shrink-0 gap-1.5 text-[#ff7a59] hover:text-[#ff7a59] hover:bg-[#ff7a59]/10"
              >
                {syncAction === `push_${lead.id}` ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                Push
              </Button>
            </div>
          ))}
          {leads.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Aucun lead à synchroniser</p>
          )}
        </div>
      </div>

      {/* HubSpot contacts pulled */}
      {hubspotContacts.length > 0 && (
        <div className="bg-card border border-border/20 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/10">
            <h3 className="font-semibold text-sm">Contacts HubSpot ({hubspotContacts.length})</h3>
          </div>
          <div className="divide-y divide-border/10 max-h-[400px] overflow-y-auto">
            {hubspotContacts.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {c.properties?.firstname || ""} {c.properties?.lastname || ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.properties?.email || "—"} • {c.properties?.industry || "—"}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff7a59]/10 text-[#ff7a59] font-semibold flex-shrink-0">
                  {c.properties?.hs_lead_status || "N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHubspotTab;
