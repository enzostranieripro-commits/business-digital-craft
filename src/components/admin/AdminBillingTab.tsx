import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText, Download, Trash2, Send, Eye, Copy, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
}

interface Invoice {
  id: string;
  type: string;
  number: string;
  status: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  issue_date: string;
  due_date: string | null;
  validity_date: string | null;
  total_ht: number;
  total_ttc: number;
  notes: string | null;
  payment_terms: string | null;
  lead_id: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  brouillon: { label: "Brouillon", class: "bg-muted text-muted-foreground" },
  envoyé: { label: "Envoyé", class: "bg-primary/20 text-primary" },
  accepté: { label: "Accepté", class: "bg-visibility/20 text-visibility" },
  payé: { label: "Payé", class: "bg-visibility/20 text-visibility" },
  annulé: { label: "Annulé", class: "bg-destructive/20 text-destructive" },
  refusé: { label: "Refusé", class: "bg-destructive/20 text-destructive" },
};

interface Props {
  leads: any[];
  fetchAll: () => void;
}

const AdminBillingTab = ({ leads, fetchAll }: Props) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<string>("devis");
  const [formLeadId, setFormLeadId] = useState<string>("");
  const [formClientName, setFormClientName] = useState("");
  const [formClientEmail, setFormClientEmail] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");
  const [formClientAddress, setFormClientAddress] = useState("");
  const [formIssueDate, setFormIssueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formDueDate, setFormDueDate] = useState("");
  const [formValidityDate, setFormValidityDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPaymentTerms, setFormPaymentTerms] = useState("Paiement à réception de facture");
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0, sort_order: 0 },
  ]);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInvoices(data as Invoice[]);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const clientLeads = leads.filter(l => l.status === "client" || l.status === "converti");

  const resetForm = () => {
    setFormType("devis");
    setFormLeadId("");
    setFormClientName("");
    setFormClientEmail("");
    setFormClientPhone("");
    setFormClientAddress("");
    setFormIssueDate(format(new Date(), "yyyy-MM-dd"));
    setFormDueDate("");
    setFormValidityDate("");
    setFormNotes("");
    setFormPaymentTerms("Paiement à réception de facture");
    setFormItems([{ description: "", quantity: 1, unit_price: 0, total: 0, sort_order: 0 }]);
    setEditingInvoice(null);
  };

  const handleLeadSelect = (leadId: string) => {
    setFormLeadId(leadId);
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setFormClientName(`${lead.prenom} ${lead.nom}`);
      setFormClientEmail(lead.email || "");
      setFormClientPhone(lead.telephone || "");
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormItems(prev => {
      const items = [...prev];
      (items[index] as any)[field] = value;
      items[index].total = Number(items[index].quantity) * Number(items[index].unit_price);
      return items;
    });
  };

  const addItem = () => {
    setFormItems(prev => [...prev, { description: "", quantity: 1, unit_price: 0, total: 0, sort_order: prev.length }]);
  };

  const removeItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalHT = formItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);

  const handleSave = async () => {
    if (!formClientName.trim()) { toast.error("Nom du client requis"); return; }
    if (formItems.some(i => !i.description.trim())) { toast.error("Description requise pour chaque ligne"); return; }

    setLoading(true);
    try {
      if (editingInvoice) {
        // Update existing
        await supabase
          .from("invoices")
          .update({
            client_name: formClientName,
            client_email: formClientEmail || null,
            client_phone: formClientPhone || null,
            client_address: formClientAddress || null,
            issue_date: formIssueDate,
            due_date: formDueDate || null,
            validity_date: formValidityDate || null,
            total_ht: totalHT,
            total_ttc: totalHT,
            notes: formNotes || null,
            payment_terms: formPaymentTerms || null,
            lead_id: formLeadId || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingInvoice.id);

        // Delete old items, insert new
        await supabase.from("invoice_items").delete().eq("invoice_id", editingInvoice.id);
        await supabase.from("invoice_items").insert(
          formItems.map((item, i) => ({
            invoice_id: editingInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: Number(item.quantity) * Number(item.unit_price),
            sort_order: i,
          }))
        );
        toast.success("Document mis à jour");
      } else {
        // Get next number
        const { data: numData } = await supabase.rpc("next_invoice_number", { p_type: formType });
        const number = numData || `${formType === "devis" ? "DEV" : "FACT"}-${new Date().getFullYear()}-0001`;

        const { data: inv, error } = await supabase
          .from("invoices")
          .insert({
            type: formType,
            number,
            client_name: formClientName,
            client_email: formClientEmail || null,
            client_phone: formClientPhone || null,
            client_address: formClientAddress || null,
            issue_date: formIssueDate,
            due_date: formDueDate || null,
            validity_date: formValidityDate || null,
            total_ht: totalHT,
            total_ttc: totalHT,
            notes: formNotes || null,
            payment_terms: formPaymentTerms || null,
            lead_id: formLeadId || null,
          })
          .select()
          .single();

        if (error) throw error;

        await supabase.from("invoice_items").insert(
          formItems.map((item, i) => ({
            invoice_id: inv.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: Number(item.quantity) * Number(item.unit_price),
            sort_order: i,
          }))
        );
        toast.success(`${formType === "devis" ? "Devis" : "Facture"} ${number} créé(e)`);
      }

      resetForm();
      setShowModal(false);
      fetchInvoices();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la sauvegarde");
    }
    setLoading(false);
  };

  const handleEdit = async (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormType(invoice.type);
    setFormLeadId(invoice.lead_id || "");
    setFormClientName(invoice.client_name);
    setFormClientEmail(invoice.client_email || "");
    setFormClientPhone(invoice.client_phone || "");
    setFormClientAddress(invoice.client_address || "");
    setFormIssueDate(invoice.issue_date);
    setFormDueDate(invoice.due_date || "");
    setFormValidityDate(invoice.validity_date || "");
    setFormNotes(invoice.notes || "");
    setFormPaymentTerms(invoice.payment_terms || "");

    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("sort_order");

    if (items && items.length > 0) {
      setFormItems(items.map(i => ({
        id: i.id,
        description: i.description,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        total: Number(i.total),
        sort_order: i.sort_order,
      })));
    } else {
      setFormItems([{ description: "", quantity: 1, unit_price: 0, total: 0, sort_order: 0 }]);
    }

    setShowModal(true);
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: string) => {
    await supabase.from("invoices").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", invoice.id);
    toast.success(`Statut → ${STATUS_LABELS[newStatus]?.label || newStatus}`);
    fetchInvoices();
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`Supprimer ${invoice.number} ?`)) return;
    await supabase.from("invoices").delete().eq("id", invoice.id);
    toast.success("Document supprimé");
    fetchInvoices();
  };

  const handleConvertToInvoice = async (devis: Invoice) => {
    if (!confirm("Convertir ce devis en facture ?")) return;
    setLoading(true);
    try {
      const { data: numData } = await supabase.rpc("next_invoice_number", { p_type: "facture" });
      const number = numData || `FACT-${new Date().getFullYear()}-0001`;

      // Get items from devis
      const { data: items } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", devis.id)
        .order("sort_order");

      const { data: inv, error } = await supabase
        .from("invoices")
        .insert({
          type: "facture",
          number,
          client_name: devis.client_name,
          client_email: devis.client_email,
          client_phone: devis.client_phone,
          client_address: devis.client_address,
          issue_date: format(new Date(), "yyyy-MM-dd"),
          due_date: devis.due_date,
          total_ht: devis.total_ht,
          total_ttc: devis.total_ttc,
          notes: devis.notes,
          payment_terms: devis.payment_terms,
          lead_id: devis.lead_id,
        })
        .select()
        .single();

      if (error) throw error;

      if (items) {
        await supabase.from("invoice_items").insert(
          items.map(i => ({
            invoice_id: inv.id,
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
            total: i.total,
            sort_order: i.sort_order,
          }))
        );
      }

      // Mark devis as accepted
      await supabase.from("invoices").update({ status: "accepté" }).eq("id", devis.id);

      toast.success(`Facture ${number} créée depuis le devis`);
      fetchInvoices();
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
    setLoading(false);
  };

  const generatePDFHtml = async (invoice: Invoice): Promise<string> => {
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("sort_order");

    const response = await supabase.functions.invoke("generate-invoice-pdf", {
      body: { invoice, items: items || [] },
    });

    if (response.error) throw new Error(response.error.message);
    return atob(response.data.pdf_base64);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setGenerating(invoice.id);
    try {
      const html = await generatePDFHtml(invoice);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
      toast.success("PDF téléchargé");
    } catch (e: any) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(e);
    }
    setGenerating(null);
  };

  const handleSendByEmail = async (invoice: Invoice) => {
    setGenerating(invoice.id);
    try {
      const typeLabel = invoice.type === "devis" ? "Devis" : "Facture";
      const subject = encodeURIComponent(`${typeLabel} ${invoice.number} — Angelot & Stranieri Consulting`);
      const body = encodeURIComponent(
        `Bonjour ${invoice.client_name},\n\n` +
        `Veuillez trouver ci-joint votre ${typeLabel.toLowerCase()} n°${invoice.number} d'un montant de ${Number(invoice.total_ttc).toLocaleString("fr-FR")}€.\n\n` +
        `Date d'émission : ${format(new Date(invoice.issue_date), "dd/MM/yyyy")}\n` +
        (invoice.validity_date ? `Date de validité : ${format(new Date(invoice.validity_date), "dd/MM/yyyy")}\n` : "") +
        (invoice.due_date ? `Date d'échéance : ${format(new Date(invoice.due_date), "dd/MM/yyyy")}\n` : "") +
        `\nN'hésitez pas à nous contacter pour toute question.\n\n` +
        `Cordialement,\nAngelot & Stranieri Consulting`
      );
      const to = invoice.client_email ? encodeURIComponent(invoice.client_email) : "";
      
      window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_self");

      // Auto-update status to "envoyé" if still brouillon
      if (invoice.status === "brouillon") {
        await supabase.from("invoices").update({ status: "envoyé", updated_at: new Date().toISOString() }).eq("id", invoice.id);
        toast.success(`${typeLabel} marqué(e) comme envoyé(e)`);
        fetchInvoices();
      }
    } catch (e: any) {
      toast.error("Erreur lors de l'envoi");
      console.error(e);
    }
    setGenerating(null);
  };

  const filtered = invoices.filter(inv => {
    if (filterType !== "all" && inv.type !== filterType) return false;
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const totalDevis = invoices.filter(i => i.type === "devis").length;
  const totalFactures = invoices.filter(i => i.type === "facture").length;
  const totalPaid = invoices.filter(i => i.type === "facture" && i.status === "payé").reduce((s, i) => s + Number(i.total_ttc), 0);
  const totalPending = invoices.filter(i => i.type === "facture" && i.status !== "payé" && i.status !== "annulé").reduce((s, i) => s + Number(i.total_ttc), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-surface p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Devis émis</p>
          <p className="text-2xl font-extrabold mt-1">{totalDevis}</p>
        </div>
        <div className="card-surface p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Factures émises</p>
          <p className="text-2xl font-extrabold mt-1">{totalFactures}</p>
        </div>
        <div className="card-surface p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Encaissé</p>
          <p className="text-2xl font-extrabold text-visibility mt-1">{totalPaid.toLocaleString("fr-FR")}€</p>
        </div>
        <div className="card-surface p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">En attente</p>
          <p className="text-2xl font-extrabold text-conversion mt-1">{totalPending.toLocaleString("fr-FR")}€</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="devis">Devis</SelectItem>
              <SelectItem value="facture">Factures</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="envoyé">Envoyé</SelectItem>
              <SelectItem value="accepté">Accepté</SelectItem>
              <SelectItem value="payé">Payé</SelectItem>
              <SelectItem value="annulé">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { resetForm(); setFormType("devis"); setShowModal(true); }}>
            <Plus className="size-4 mr-1" /> Nouveau devis
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setFormType("facture"); setShowModal(true); }}>
            <Plus className="size-4 mr-1" /> Nouvelle facture
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="card-surface rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20 text-xs text-muted-foreground">
              <th className="text-left p-3 font-medium">N°</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Client</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-right p-3 font-medium">Montant TTC</th>
              <th className="text-center p-3 font-medium">Statut</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Aucun document trouvé</td></tr>
            )}
            {filtered.map(inv => {
              const st = STATUS_LABELS[inv.status] || { label: inv.status, class: "bg-muted text-muted-foreground" };
              return (
                <tr key={inv.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                  <td className="p-3 font-mono text-xs font-medium">{inv.number}</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.type === "devis" ? "bg-primary/10 text-primary" : "bg-conversion/10 text-conversion"}`}>
                      {inv.type === "devis" ? "Devis" : "Facture"}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{inv.client_name}</td>
                  <td className="p-3 text-muted-foreground">{format(new Date(inv.issue_date), "dd/MM/yyyy")}</td>
                  <td className="p-3 text-right font-semibold">{Number(inv.total_ttc).toLocaleString("fr-FR")}€</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.class}`}>{st.label}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(inv)} title="Modifier">
                        <Eye className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDownloadPDF(inv)} disabled={generating === inv.id} title="Télécharger PDF">
                        <Download className="size-3.5" />
                      </Button>
                      {inv.type === "devis" && inv.status !== "accepté" && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleConvertToInvoice(inv)} title="Convertir en facture">
                          <ArrowRightLeft className="size-3.5" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(inv)} title="Supprimer">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={showModal} onOpenChange={(v) => { if (!v) { resetForm(); } setShowModal(v); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? `Modifier ${editingInvoice.number}` : `Nouveau ${formType === "devis" ? "devis" : "facture"}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client selection */}
            {!editingInvoice && (
              <div className="space-y-2">
                <Label>Client existant (optionnel)</Label>
                <Select value={formLeadId} onValueChange={handleLeadSelect}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Sélectionner un client..." /></SelectTrigger>
                  <SelectContent>
                    {clientLeads.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.prenom} {l.nom} — {l.email}</SelectItem>
                    ))}
                    {leads.filter(l => !clientLeads.includes(l)).slice(0, 20).map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.prenom} {l.nom} — {l.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nom du client *</Label>
                <Input value={formClientName} onChange={e => setFormClientName(e.target.value)} placeholder="Nom complet" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={formClientEmail} onChange={e => setFormClientEmail(e.target.value)} placeholder="email@..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Téléphone</Label>
                <Input value={formClientPhone} onChange={e => setFormClientPhone(e.target.value)} placeholder="06..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date d'émission</Label>
                <Input type="date" value={formIssueDate} onChange={e => setFormIssueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Adresse du client</Label>
              <Textarea value={formClientAddress} onChange={e => setFormClientAddress(e.target.value)} rows={2} placeholder="Adresse complète..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {formType === "devis" && (
                <div className="space-y-1">
                  <Label className="text-xs">Validité du devis</Label>
                  <Input type="date" value={formValidityDate} onChange={e => setFormValidityDate(e.target.value)} />
                </div>
              )}
              {formType === "facture" && (
                <div className="space-y-1">
                  <Label className="text-xs">Échéance</Label>
                  <Input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Conditions de paiement</Label>
                <Input value={formPaymentTerms} onChange={e => setFormPaymentTerms(e.target.value)} />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Lignes de {formType}</Label>
                <Button size="sm" variant="ghost" onClick={addItem}><Plus className="size-3 mr-1" /> Ajouter</Button>
              </div>
              <div className="space-y-2">
                {formItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      className="flex-1 text-sm"
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateItem(index, "description", e.target.value)}
                    />
                    <Input
                      className="w-20 text-sm text-center"
                      type="number"
                      min="1"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={e => updateItem(index, "quantity", Number(e.target.value))}
                    />
                    <Input
                      className="w-28 text-sm text-right"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="P.U. €"
                      value={item.unit_price}
                      onChange={e => updateItem(index, "unit_price", Number(e.target.value))}
                    />
                    <div className="w-24 text-sm text-right font-semibold py-2 px-1">
                      {(Number(item.quantity) * Number(item.unit_price)).toLocaleString("fr-FR")}€
                    </div>
                    <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0" onClick={() => removeItem(index)} disabled={formItems.length <= 1}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="card-surface p-4 rounded-xl min-w-[200px]">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-semibold">{totalHT.toLocaleString("fr-FR")}€</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>TVA</span>
                  <span>Non applicable</span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-border/20">
                  <span>Total TTC</span>
                  <span>{totalHT.toLocaleString("fr-FR")}€</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes / Remarques</Label>
              <Textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} placeholder="Notes optionnelles..." />
            </div>

            {/* Status (for edit) */}
            {editingInvoice && (
              <div className="space-y-1">
                <Label className="text-xs">Statut</Label>
                <Select value={editingInvoice.status} onValueChange={(v) => handleStatusChange(editingInvoice, v)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="envoyé">Envoyé</SelectItem>
                    <SelectItem value="accepté">Accepté</SelectItem>
                    <SelectItem value="payé">Payé</SelectItem>
                    <SelectItem value="annulé">Annulé</SelectItem>
                    <SelectItem value="refusé">Refusé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { resetForm(); setShowModal(false); }}>Annuler</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Enregistrement..." : editingInvoice ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBillingTab;
