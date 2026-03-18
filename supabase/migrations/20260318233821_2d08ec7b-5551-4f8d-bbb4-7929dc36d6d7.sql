
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.audit_requests(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'devis',
  number text NOT NULL,
  status text NOT NULL DEFAULT 'brouillon',
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  client_address text,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  validity_date date,
  total_ht numeric NOT NULL DEFAULT 0,
  total_ttc numeric NOT NULL DEFAULT 0,
  notes text,
  payment_terms text DEFAULT 'Paiement à réception de facture',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invoice_counters (
  id text PRIMARY KEY,
  counter integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.next_invoice_number(p_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_year text;
  v_prefix text;
  v_counter_id text;
  v_next integer;
BEGIN
  v_year := extract(year from current_date)::text;
  v_prefix := CASE p_type WHEN 'devis' THEN 'DEV' ELSE 'FACT' END;
  v_counter_id := p_type || '-' || v_year;
  
  INSERT INTO invoice_counters (id, counter) VALUES (v_counter_id, 1)
  ON CONFLICT (id) DO UPDATE SET counter = invoice_counters.counter + 1
  RETURNING counter INTO v_next;
  
  RETURN v_prefix || '-' || v_year || '-' || lpad(v_next::text, 4, '0');
END;
$$;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth select invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete invoices" ON public.invoices FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth select invoice_items" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert invoice_items" ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update invoice_items" ON public.invoice_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete invoice_items" ON public.invoice_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth select invoice_counters" ON public.invoice_counters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert invoice_counters" ON public.invoice_counters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update invoice_counters" ON public.invoice_counters FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
