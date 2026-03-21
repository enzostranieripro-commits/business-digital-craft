import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { invoice, items, companyInfo, invoiceLegal } = await req.json();

    const company = {
      name: companyInfo?.name || "AS C&D",
      subtitle: companyInfo?.subtitle || "Création de sites web & Copywriting",
      siret: companyInfo?.siret || "",
      address: companyInfo?.address || "Rodez, France",
      email: companyInfo?.email || "contact@ascnd.fr",
      phone: companyInfo?.phone || "",
      legal_form: companyInfo?.legal_form || "Micro-entreprise",
      website: companyInfo?.website || "",
      logo_url: companyInfo?.logo_url || "",
      brand_color: companyInfo?.brand_color || "#7c3aed",
    };

    const legal = {
      tva_mention: invoiceLegal?.tva_mention || "TVA non applicable, article 293 B du Code Général des Impôts",
      penalty_clause: invoiceLegal?.penalty_clause || "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.",
      custom_footer: invoiceLegal?.custom_footer || "AS C&D — Rodez, France",
      default_payment_terms: invoiceLegal?.default_payment_terms || "50% à la commande, 50% à la livraison",
      default_validity_days: invoiceLegal?.default_validity_days || 15,
    };

    const bc = company.brand_color;
    const totalHT = items.reduce((sum: number, i: any) => sum + Number(i.total), 0);
    const isDevis = invoice.type === "devis";
    const title = isDevis ? "DEVIS" : "FACTURE";

    const logoHtml = company.logo_url
      ? `<img src="${escapeHtml(company.logo_url)}" alt="Logo" style="max-width:80px;max-height:80px;object-fit:contain;margin-right:16px;" />`
      : "";

    const itemRows = items.map((item: any, idx: number) => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;font-weight:500;">${escapeHtml(item.description)}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:center;color:#64748b;">${Number(item.quantity)}</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:right;color:#64748b;">${Number(item.unit_price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;text-align:right;font-weight:700;color:#1e293b;">${Number(item.total).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</td>
      </tr>
    `).join("");

    const validityText = isDevis
      ? `Devis valable ${legal.default_validity_days} jours`
      : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
  <div style="padding: 48px 52px; min-height: 100vh; display: flex; flex-direction: column;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:3px solid ${bc};">
      <div style="display:flex;align-items:center;">
        ${logoHtml}
        <div>
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#0f172a;">${escapeHtml(company.name)}</div>
          <div style="font-size:14px;font-weight:600;color:${bc};margin-top:2px;">${escapeHtml(company.subtitle)}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:10px;line-height:1.8;">
            ${escapeHtml(company.legal_form)}${company.siret ? ` — SIRET : ${escapeHtml(company.siret)}` : ""}<br>
            ${company.address ? `${escapeHtml(company.address)}<br>` : ""}
            ${escapeHtml(company.email)}${company.phone ? ` — ${escapeHtml(company.phone)}` : ""}
            ${company.website ? `<br>${escapeHtml(company.website)}` : ""}
          </div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:28px;font-weight:800;color:${bc};letter-spacing:2px;">${title}</div>
        <div style="font-size:15px;font-weight:700;margin-top:6px;color:#0f172a;">${escapeHtml(invoice.number)}</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:10px;line-height:1.8;">
          Date d'émission : ${formatDate(invoice.issue_date)}<br>
          ${isDevis && invoice.validity_date ? `Valable jusqu'au : ${formatDate(invoice.validity_date)}<br>` : ""}
          ${!isDevis && invoice.due_date ? `Date d'échéance : ${formatDate(invoice.due_date)}<br>` : ""}
        </div>
      </div>
    </div>

    <!-- Client -->
    <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:32px;border:1px solid #e2e8f0;">
      <div style="font-size:10px;text-transform:uppercase;color:#94a3b8;letter-spacing:1.5px;margin-bottom:8px;font-weight:700;">Destinataire</div>
      <div style="font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(invoice.client_name)}</div>
      ${invoice.client_address ? `<div style="font-size:12px;color:#64748b;margin-top:6px;white-space:pre-line;">${escapeHtml(invoice.client_address)}</div>` : ""}
      <div style="font-size:12px;color:#64748b;margin-top:4px;">
        ${invoice.client_email ? `${escapeHtml(invoice.client_email)}` : ""}
        ${invoice.client_phone ? `${invoice.client_email ? " — " : ""}${escapeHtml(invoice.client_phone)}` : ""}
      </div>
    </div>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <thead>
        <tr style="background:${bc};">
          <th style="padding:13px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#fff;">Désignation</th>
          <th style="padding:13px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#fff;width:70px;">Qté</th>
          <th style="padding:13px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#fff;width:130px;">Prix unit. HT</th>
          <th style="padding:13px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#fff;width:130px;">Total HT</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:32px;">
      <div style="width:300px;background:#f8fafc;border-radius:12px;padding:18px 22px;border:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
          <span style="color:#94a3b8;">Total HT</span>
          <span style="font-weight:700;color:#334155;">${totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#94a3b8;">
          <span>TVA</span>
          <span>Non applicable</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:14px 0 6px;font-size:18px;font-weight:800;border-top:3px solid ${bc};margin-top:10px;">
          <span style="color:#0f172a;">Total TTC</span>
          <span style="color:${bc};">${totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
      </div>
    </div>

    <!-- Payment terms -->
    <div style="background:${bc}10;border:1px solid ${bc}30;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:11px;text-transform:uppercase;color:${bc};letter-spacing:1px;margin-bottom:6px;font-weight:700;">Conditions de règlement</div>
      <div style="font-size:13px;color:#334155;font-weight:500;">${escapeHtml(invoice.payment_terms || legal.default_payment_terms)}</div>
    </div>

    <!-- Notes -->
    ${invoice.notes ? `
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:20px;border:1px solid #e2e8f0;">
      <div style="font-size:10px;text-transform:uppercase;color:#94a3b8;letter-spacing:1.5px;margin-bottom:6px;font-weight:700;">Notes</div>
      <div style="font-size:12px;color:#64748b;white-space:pre-line;">${escapeHtml(invoice.notes)}</div>
    </div>` : ""}

    <!-- Spacer to push footer down -->
    <div style="flex:1;"></div>

    <!-- Legal footer -->
    <div style="border-top:2px solid #e2e8f0;padding-top:20px;">
      <div style="font-size:10px;color:#94a3b8;text-align:center;line-height:2;">
        ${escapeHtml(legal.tva_mention)}${validityText ? ` — ${escapeHtml(validityText)}` : ""}<br>
        ${escapeHtml(company.name)}${company.subtitle ? ` — ${escapeHtml(company.subtitle)}` : ""} — ${escapeHtml(company.legal_form)}${company.siret ? ` — SIRET : ${escapeHtml(company.siret)}` : ""}<br>
        ${escapeHtml(legal.penalty_clause)}
        ${legal.custom_footer ? `<br><strong>${escapeHtml(legal.custom_footer)}</strong>` : ""}
      </div>
    </div>
  </div>
</body>
</html>`;

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
