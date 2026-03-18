
-- Payment history table
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.client_subscriptions(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.audit_requests(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'virement',
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select payment_history" ON public.payment_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert payment_history" ON public.payment_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete payment_history" ON public.payment_history FOR DELETE TO authenticated USING (true);

-- Client projects table
CREATE TABLE public.client_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.audit_requests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_cours',
  progress INT NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select client_projects" ON public.client_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert client_projects" ON public.client_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update client_projects" ON public.client_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete client_projects" ON public.client_projects FOR DELETE TO authenticated USING (true);

-- Project tasks/checklist
CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select project_tasks" ON public.project_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert project_tasks" ON public.project_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update project_tasks" ON public.project_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete project_tasks" ON public.project_tasks FOR DELETE TO authenticated USING (true);
