
-- Table audit_requests
CREATE TABLE public.audit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  secteur TEXT NOT NULL,
  besoin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert audit_requests" ON public.audit_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can select audit_requests" ON public.audit_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update audit_requests" ON public.audit_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete audit_requests" ON public.audit_requests FOR DELETE TO authenticated USING (true);

-- Table bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  secteur TEXT NOT NULL,
  besoin TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can select bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete bookings" ON public.bookings FOR DELETE TO authenticated USING (true);

-- Table diagnostics
CREATE TABLE public.diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secteur TEXT NOT NULL,
  a_un_site TEXT NOT NULL,
  demandes_semaine TEXT NOT NULL,
  reseaux_sociaux TEXT NOT NULL,
  taches_repetitives TEXT[] DEFAULT '{}',
  offre_recommandee TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert diagnostics" ON public.diagnostics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can select diagnostics" ON public.diagnostics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can delete diagnostics" ON public.diagnostics FOR DELETE TO authenticated USING (true);

-- Table product_requests
CREATE TABLE public.product_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  secteur TEXT NOT NULL,
  product TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert product_requests" ON public.product_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can select product_requests" ON public.product_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can delete product_requests" ON public.product_requests FOR DELETE TO authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagnostics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_requests;
