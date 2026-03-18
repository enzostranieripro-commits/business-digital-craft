
CREATE TABLE public.client_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.audit_requests(id) ON DELETE CASCADE NOT NULL,
  offer_level text NOT NULL DEFAULT 'Visibilité',
  options text[] NOT NULL DEFAULT '{}',
  payment_type text NOT NULL DEFAULT 'abonnement',
  monthly_amount numeric NOT NULL DEFAULT 0,
  hosting_included boolean NOT NULL DEFAULT false,
  hosting_domain text,
  payment_status text NOT NULL DEFAULT 'a_jour',
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lead_id)
);

ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select client_subscriptions" ON public.client_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert client_subscriptions" ON public.client_subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update client_subscriptions" ON public.client_subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete client_subscriptions" ON public.client_subscriptions FOR DELETE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.client_subscriptions;
