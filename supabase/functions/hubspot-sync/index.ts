import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUBSPOT_API = "https://api.hubapi.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
  if (!HUBSPOT_API_KEY) {
    return new Response(JSON.stringify({ error: "HUBSPOT_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const hubHeaders = {
    Authorization: `Bearer ${HUBSPOT_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const { action, data } = await req.json();

    // ─── Push a single lead to HubSpot ───
    if (action === "push_lead") {
      const lead = data;
      const properties = {
        firstname: lead.prenom,
        lastname: lead.nom,
        email: lead.email,
        phone: lead.telephone || "",
        industry: lead.secteur,
        hs_lead_status: mapStatusToHubspot(lead.status || "nouveau"),
        lovable_lead_id: lead.id,
      };

      // Search for existing contact by email
      const searchRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/search`, {
        method: "POST", headers: hubHeaders,
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: lead.email }] }],
        }),
      });
      const searchData = await searchRes.json();

      let hubspotId: string;
      if (searchData.total > 0) {
        hubspotId = searchData.results[0].id;
        await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/${hubspotId}`, {
          method: "PATCH", headers: hubHeaders,
          body: JSON.stringify({ properties }),
        });
      } else {
        const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
          method: "POST", headers: hubHeaders,
          body: JSON.stringify({ properties }),
        });
        const created = await createRes.json();
        if (!createRes.ok) throw new Error(`HubSpot create failed: ${JSON.stringify(created)}`);
        hubspotId = created.id;
      }

      return new Response(JSON.stringify({ success: true, hubspot_id: hubspotId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Push ALL leads to HubSpot ───
    if (action === "push_all") {
      const { data: leads } = await supabase.from("audit_requests").select("*");
      if (!leads || leads.length === 0) {
        return new Response(JSON.stringify({ success: true, synced: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let synced = 0;
      let errors = 0;
      for (const lead of leads) {
        try {
          const properties = {
            firstname: lead.prenom,
            lastname: lead.nom,
            email: lead.email,
            phone: lead.telephone || "",
            industry: lead.secteur,
            hs_lead_status: mapStatusToHubspot(lead.status || "nouveau"),
          };

          const searchRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/search`, {
            method: "POST", headers: hubHeaders,
            body: JSON.stringify({
              filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: lead.email }] }],
            }),
          });
          const searchData = await searchRes.json();

          if (searchData.total > 0) {
            await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/${searchData.results[0].id}`, {
              method: "PATCH", headers: hubHeaders,
              body: JSON.stringify({ properties }),
            });
          } else {
            const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
              method: "POST", headers: hubHeaders,
              body: JSON.stringify({ properties }),
            });
            if (!createRes.ok) throw new Error("Create failed");
          }
          synced++;
        } catch {
          errors++;
        }
      }

      return new Response(JSON.stringify({ success: true, synced, errors, total: leads.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Pull contacts from HubSpot ───
    if (action === "pull_contacts") {
      const limit = data?.limit || 50;
      const res = await fetch(
        `${HUBSPOT_API}/crm/v3/objects/contacts?limit=${limit}&properties=firstname,lastname,email,phone,industry,hs_lead_status,createdate`,
        { headers: hubHeaders }
      );
      const contacts = await res.json();
      if (!res.ok) throw new Error(`HubSpot pull failed: ${JSON.stringify(contacts)}`);

      return new Response(JSON.stringify({ success: true, contacts: contacts.results || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Get HubSpot connection status ───
    if (action === "status") {
      const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts?limit=1`, { headers: hubHeaders });
      const ok = res.ok;
      let portalId = null;
      if (ok) {
        const infoRes = await fetch(`${HUBSPOT_API}/account-info/v3/api-usage/daily/private-apps`, { headers: hubHeaders });
        if (infoRes.ok) {
          const info = await infoRes.json();
          portalId = info?.portalId || null;
        }
      }
      return new Response(JSON.stringify({ connected: ok, portal_id: portalId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Update status from HubSpot → local ───
    if (action === "sync_statuses") {
      const res = await fetch(
        `${HUBSPOT_API}/crm/v3/objects/contacts?limit=100&properties=email,hs_lead_status`,
        { headers: hubHeaders }
      );
      const contacts = await res.json();
      if (!res.ok) throw new Error("Failed to fetch HubSpot contacts");

      let updated = 0;
      for (const contact of contacts.results || []) {
        const email = contact.properties?.email;
        const hsStatus = contact.properties?.hs_lead_status;
        if (!email || !hsStatus) continue;

        const localStatus = mapStatusFromHubspot(hsStatus);
        if (!localStatus) continue;

        const { error } = await supabase
          .from("audit_requests")
          .update({ status: localStatus })
          .eq("email", email);
        if (!error) updated++;
      }

      return new Response(JSON.stringify({ success: true, updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("HubSpot sync error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapStatusToHubspot(status: string): string {
  const map: Record<string, string> = {
    nouveau: "NEW",
    contacté: "ATTEMPTED_TO_CONTACT",
    qualifié: "CONNECTED",
    converti: "CUSTOMER",
    perdu: "UNQUALIFIED",
  };
  return map[status] || "NEW";
}

function mapStatusFromHubspot(hsStatus: string): string | null {
  const map: Record<string, string> = {
    NEW: "nouveau",
    ATTEMPTED_TO_CONTACT: "contacté",
    CONNECTED: "qualifié",
    CUSTOMER: "converti",
    UNQUALIFIED: "perdu",
    OPEN_DEAL: "qualifié",
    IN_PROGRESS: "contacté",
  };
  return map[hsStatus] || null;
}
