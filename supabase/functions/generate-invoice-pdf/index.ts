import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { invoice, items } = await req.json();

    const totalHT = items.reduce((sum: number, i: any) => sum + Number(i.total), 0);
    const isDevis = invoice.type === "devis";
    const title = isDevis ? "DEVIS" : "FACTURE";

    const itemRows = items.map((item: any) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;">${escapeHtml(item.description)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;text-align:center;">${Number(item.quantity)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;text-align:right;">${Number(item.unit_price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;text-align:right;font-weight:600;">${Number(item.total).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff; }
  </style>
</head>
<body>
  <div style="padding: 50px;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;margin-bottom:40px;">
      <div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">Angelot & Stranieri</div>
        <div style="font-size:16px;font-weight:700;color:#7c3aed;">Consulting</div>
        <div style="font-size:11px;color:#888;margin-top:8px;line-height:1.6;">
          Micro-entreprise<br>
          SIRET : [À compléter]<br>
          [Adresse à compléter]<br>
          contact@asconsulting.fr
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:28px;font-weight:800;color:#7c3aed;letter-spacing:1px;">${title}</div>
        <div style="font-size:14px;font-weight:600;margin-top:4px;">${escapeHtml(invoice.number)}</div>
        <div style="font-size:12px;color:#888;margin-top:8px;">
          Date : ${formatDate(invoice.issue_date)}<br>
          ${isDevis && invoice.validity_date ? `Valable jusqu'au : ${formatDate(invoice.validity_date)}<br>` : ""}
          ${!isDevis && invoice.due_date ? `Échéance : ${formatDate(invoice.due_date)}<br>` : ""}
        </div>
      </div>
    </div>

    <!-- Client -->
    <div style="background:#f8f8fa;border-radius:8px;padding:20px;margin-bottom:30px;">
      <div style="font-size:10px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:6px;">Destinataire</div>
      <div style="font-size:14px;font-weight:600;">${escapeHtml(invoice.client_name)}</div>
      ${invoice.client_address ? `<div style="font-size:12px;color:#555;margin-top:4px;white-space:pre-line;">${escapeHtml(invoice.client_address)}</div>` : ""}
      ${invoice.client_email ? `<div style="font-size:12px;color:#555;margin-top:2px;">${escapeHtml(invoice.client_email)}</div>` : ""}
      ${invoice.client_phone ? `<div style="font-size:12px;color:#555;">${escapeHtml(invoice.client_phone)}</div>` : ""}
    </div>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#7c3aed;color:#fff;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Description</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;width:80px;">Qté</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;width:120px;">Prix unit.</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;width:120px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:30px;">
      <div style="width:280px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
          <span style="color:#888;">Total HT</span>
          <span style="font-weight:600;">${totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:12px;color:#888;">
          <span>TVA</span>
          <span>Non applicable</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:700;border-top:2px solid #7c3aed;margin-top:4px;">
          <span>Total TTC</span>
          <span style="color:#7c3aed;">${totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    ${invoice.notes ? `
    <div style="background:#f8f8fa;border-radius:8px;padding:16px;margin-bottom:20px;">
      <div style="font-size:10px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:6px;">Notes</div>
      <div style="font-size:12px;color:#555;white-space:pre-line;">${escapeHtml(invoice.notes)}</div>
    </div>` : ""}

    <!-- Payment terms -->
    ${invoice.payment_terms ? `
    <div style="font-size:12px;color:#555;margin-bottom:20px;">
      <strong>Conditions :</strong> ${escapeHtml(invoice.payment_terms)}
    </div>` : ""}

    <!-- Legal -->
    <div style="border-top:1px solid #e5e5e5;padding-top:16px;margin-top:auto;">
      <div style="font-size:10px;color:#aaa;text-align:center;line-height:1.6;">
        TVA non applicable, article 293 B du Code Général des Impôts<br>
        Angelot & Stranieri Consulting — Micro-entreprise — SIRET : [À compléter]<br>
        En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.
      </div>
    </div>
  </div>
</body>
</html>`;

    // Use Lovable's PDF generation via headless browser
    // For now, return the HTML that the client can print/save as PDF
    // We'll encode the HTML to base64 and return it
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(html);
    const base64 = btoa(String.fromCharCode(...htmlBytes));

    return new Response(JSON.stringify({ pdf_base64: base64, format: "html" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-invoice-pdf error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
