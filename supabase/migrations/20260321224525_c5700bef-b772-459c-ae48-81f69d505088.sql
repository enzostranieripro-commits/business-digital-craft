
INSERT INTO storage.buckets (id, name, public) VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth upload company-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'company-assets');
CREATE POLICY "Auth select company-assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'company-assets');
CREATE POLICY "Auth update company-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'company-assets');
CREATE POLICY "Auth delete company-assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'company-assets');
CREATE POLICY "Public read company-assets" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'company-assets');
