CREATE TABLE public.product_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  product_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('removed','restored')),
  user_id uuid NOT NULL,
  user_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.product_audit_log TO authenticated;
GRANT ALL ON public.product_audit_log TO service_role;

ALTER TABLE public.product_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view audit log"
  ON public.product_audit_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Signed-in users can add their own audit entries"
  ON public.product_audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_product_audit_log_created_at ON public.product_audit_log (created_at DESC);