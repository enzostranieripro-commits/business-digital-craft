import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Settings, FileText, Clock, History, CheckCircle2, XCircle, Loader2, Eye, Mail } from "lucide-react";

type SubTab = "config" | "templates" | "send" | "history";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailLog {
  id: string;
  date: string;
  to: string;
  template: string;
  status: "sent" | "opened" | "failed";
}

const DEFAULT_TEMPLATES: Template[] = [
  { id: "relance-7", name: "Relance devis sans réponse (J+7)", subject: "Votre devis AS C&D — toujours d'actualité ?", body: `Bonjour {nom_client},\n\nJe me permets de vous recontacter suite au devis n°{numero_devis} d'un montant de {montant} € envoyé le {date_devis}.\n\nCe devis est encore valable et je reste à votre disposition pour en discuter ou l'adapter à vos besoins.\n\nCordialement,\nAS C&D` },
  { id: "relance-14", name: "Relance devis sans réponse (J+14)", subject: "Devis AS C&D — dernière relance", body: `Bonjour {nom_client},\n\nJe reviens vers vous une dernière fois concernant le devis n°{numero_devis}.\n\nSi votre projet a évolué ou si vous avez des questions, n'hésitez pas à me contacter.\n\nCordialement,\nAS C&D` },
  { id: "facture-impayee", name: "Relance facture impayée", subject: "Facture {numero_facture} — rappel de paiement", body: `Bonjour {nom_client},\n\nSauf erreur de notre part, la facture n°{numero_facture} d'un montant de {montant} € n'a pas encore été réglée.\n\nMerci de procéder au règlement dans les meilleurs délais.\n\nCordialement,\nAS C&D` },
  { id: "post-livraison", name: "Suivi post-livraison", subject: "Votre site est en ligne — tout est OK ?", body: `Bonjour {nom_client},\n\nVotre site est désormais en ligne ! J'espère qu'il vous donne entière satisfaction.\n\nN'hésitez pas à me faire part de vos retours ou questions.\n\nCordialement,\nAS C&D` },
  { id: "custom", name: "Email ponctuel personnalisé", subject: "", body: "" },
];

const SETTINGS_KEY = "resend_config";

const AdminResendTab = () => {
  const [subTab, setSubTab] = useState<SubTab>("config");
  const [config, setConfig] = useState({ apiKey: "", fromEmail: "hello@ascnd.fr", fromName: "AS C&D" });
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);

  // Send form
  const [sendTemplate, setSendTemplate] = useState<string>("");
  const [sendTo, setSendTo] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sending, setSending] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle() as any;
      if (data?.value) {
        if (data.value.config) setConfig(data.value.config);
        if (data.value.templates) setTemplates(data.value.templates);
        if (data.value.logs) setLogs(data.value.logs);
        if (data.value.connectionOk !== undefined) setConnectionOk(data.value.connectionOk);
      }
    };
    load();
  }, []);

  const saveConfig = async () => {
    const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", SETTINGS_KEY).maybeSingle();
    const val = { config, templates, logs, connectionOk };
    if (existing) {
      await supabase.from("admin_settings").update({ value: val as any, updated_at: new Date().toISOString() }).eq("key", SETTINGS_KEY);
    } else {
      await supabase.from("admin_settings").insert({ key: SETTINGS_KEY, value: val as any } as any);
    }
    toast.success("Configuration Resend sauvegardée");
  };

  const testConnection = async () => {
    if (!config.apiKey) { toast.error("Clé API requise"); return; }
    setTesting(true);
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (res.ok) {
        setConnectionOk(true);
        toast.success("Connexion Resend réussie ✅");
      } else {
        setConnectionOk(false);
        toast.error("Échec de la connexion — vérifiez votre clé API");
      }
    } catch {
      setConnectionOk(false);
      toast.error("Erreur réseau");
    }
    setTesting(false);
    await saveConfig();
  };

  const selectTemplate = (id: string) => {
    const t = templates.find(t => t.id === id);
    if (t) {
      setSendTemplate(id);
      setSendSubject(t.subject);
      setSendBody(t.body);
    }
  };

  const handleSend = async () => {
    if (!config.apiKey) { toast.error("Configurez votre clé API Resend"); return; }
    if (!sendTo) { toast.error("Destinataire requis"); return; }
    if (!sendSubject) { toast.error("Objet requis"); return; }

    setSending(true);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${config.fromName} <${config.fromEmail}>`,
          to: [sendTo],
          subject: sendSubject,
          html: sendBody.replace(/\n/g, "<br>"),
        }),
      });

      if (res.ok) {
        const newLog: EmailLog = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          to: sendTo,
          template: templates.find(t => t.id === sendTemplate)?.name || "Manuel",
          status: "sent",
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);

        // Save logs
        const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", SETTINGS_KEY).maybeSingle();
        const val = { config, templates, logs: updatedLogs, connectionOk };
        if (existing) {
          await supabase.from("admin_settings").update({ value: val as any, updated_at: new Date().toISOString() }).eq("key", SETTINGS_KEY);
        }

        toast.success("Email envoyé ✅");
        setSendTo("");
        setSendSubject("");
        setSendBody("");
        setSendTemplate("");
      } else {
        const err = await res.json();
        toast.error(`Erreur: ${err.message || "Envoi échoué"}`);
        const failLog: EmailLog = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          to: sendTo,
          template: templates.find(t => t.id === sendTemplate)?.name || "Manuel",
          status: "failed",
        };
        setLogs([failLog, ...logs]);
      }
    } catch (e: any) {
      toast.error("Erreur réseau");
    }
    setSending(false);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;
    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setEditingTemplate(null);
    toast.success("Template sauvegardé (pensez à sauvegarder la config)");
  };

  const tabs = [
    { id: "config" as SubTab, label: "Configuration", icon: Settings },
    { id: "templates" as SubTab, label: "Templates", icon: FileText },
    { id: "send" as SubTab, label: "Envoyer", icon: Send },
    { id: "history" as SubTab, label: "Historique", icon: History },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Sub tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              subTab === t.id ? "bg-primary/10 text-primary shadow-sm" : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}>
            <t.icon className="size-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Config */}
      {subTab === "config" && (
        <div className="card-surface p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold mb-1">Connexion Resend</h3>
            <p className="text-xs text-muted-foreground">Configurez votre clé API pour envoyer des emails depuis le back-office.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Clé API Resend</Label>
              <Input type="password" value={config.apiKey} onChange={e => setConfig({ ...config, apiKey: e.target.value })} placeholder="re_xxxxxxxx..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Email expéditeur</Label>
                <Input value={config.fromEmail} onChange={e => setConfig({ ...config, fromEmail: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nom expéditeur</Label>
                <Input value={config.fromName} onChange={e => setConfig({ ...config, fromName: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={testConnection} disabled={testing} variant="outline">
                {testing ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Mail className="size-3.5 mr-1.5" />}
                Tester la connexion
              </Button>
              <Button onClick={saveConfig}>Sauvegarder</Button>
              {connectionOk !== null && (
                <div className={`flex items-center gap-1.5 text-sm ${connectionOk ? "text-visibility" : "text-destructive"}`}>
                  {connectionOk ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  {connectionOk ? "Connecté ✅" : "Erreur ❌"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {subTab === "templates" && (
        <div className="space-y-4">
          <div className="card-surface p-4 rounded-xl">
            <p className="text-xs text-muted-foreground mb-3">
              Variables disponibles : <code className="text-primary">{`{nom_client}`}</code>, <code className="text-primary">{`{montant}`}</code>, <code className="text-primary">{`{numero_devis}`}</code>, <code className="text-primary">{`{numero_facture}`}</code>, <code className="text-primary">{`{date_devis}`}</code>, <code className="text-primary">{`{lien_devis}`}</code>
            </p>
          </div>
          {templates.map(t => (
            <div key={t.id} className="card-surface p-4 rounded-xl">
              {editingTemplate?.id === t.id ? (
                <div className="space-y-3">
                  <Input value={editingTemplate.name} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} placeholder="Nom du template" />
                  <Input value={editingTemplate.subject} onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })} placeholder="Objet" />
                  <Textarea value={editingTemplate.body} onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })} rows={6} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveTemplate}>Sauvegarder</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingTemplate(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Objet : {t.subject || "(vide)"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingTemplate({ ...t })}><Eye className="size-3.5 mr-1" />Éditer</Button>
                    <Button size="sm" variant="outline" onClick={() => { selectTemplate(t.id); setSubTab("send"); }}><Send className="size-3.5 mr-1" />Utiliser</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Send */}
      {subTab === "send" && (
        <div className="card-surface p-6 space-y-5">
          <h3 className="text-sm font-bold">Envoyer un email</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Template</Label>
              <select value={sendTemplate} onChange={e => selectTemplate(e.target.value)}
                className="w-full bg-background rounded-xl px-3 py-2 text-sm border border-border/20 outline-none">
                <option value="">— Choisir un template —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Destinataire</Label>
              <Input value={sendTo} onChange={e => setSendTo(e.target.value)} placeholder="email@client.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Objet</Label>
              <Input value={sendSubject} onChange={e => setSendSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Corps de l'email</Label>
              <Textarea value={sendBody} onChange={e => setSendBody(e.target.value)} rows={8} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSend} disabled={sending}>
                {sending ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Send className="size-3.5 mr-1.5" />}
                Envoyer maintenant
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {subTab === "history" && (
        <div className="card-surface rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20 bg-secondary/30">
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Destinataire</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Template</th>
                <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-sm text-muted-foreground py-8">Aucun email envoyé.</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="border-b border-border/10">
                  <td className="px-4 py-3 text-sm">{new Date(l.date).toLocaleDateString("fr-FR")} {new Date(l.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-3 text-sm">{l.to}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{l.template}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      l.status === "sent" ? "bg-visibility/15 text-visibility" :
                      l.status === "opened" ? "bg-primary/15 text-primary" :
                      "bg-destructive/15 text-destructive"
                    }`}>
                      {l.status === "sent" ? "Envoyé" : l.status === "opened" ? "Ouvert" : "Échec"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminResendTab;
