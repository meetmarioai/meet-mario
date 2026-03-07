-- ── Email sequence queue ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  patient_email text NOT NULL,
  patient_name text NOT NULL,
  sequence_type text NOT NULL DEFAULT 'onboarding', -- onboarding | post_alcat | reactivation
  step int NOT NULL DEFAULT 0,           -- which email in the sequence (0=day0, 1=day2, etc)
  send_at timestamptz NOT NULL,          -- when to send this email
  sent_at timestamptz,                   -- null = pending
  status text NOT NULL DEFAULT 'pending', -- pending | sent | failed | cancelled
  predicted_reactors jsonb,              -- top population-risk foods for this patient
  symptom_profile jsonb,                 -- from onboarding intake
  sender_email text NOT NULL DEFAULT 'info@medibalans.se',
  sender_name text NOT NULL DEFAULT 'MediBalans',
  CONSTRAINT email_sequences_pkey PRIMARY KEY (id),
  CONSTRAINT email_sequences_status_check CHECK (
    status = ANY (ARRAY['pending','sent','failed','cancelled'])
  )
);

CREATE INDEX IF NOT EXISTS email_seq_patient_idx ON public.email_sequences(patient_id);
CREATE INDEX IF NOT EXISTS email_seq_send_at_idx ON public.email_sequences(send_at);
CREATE INDEX IF NOT EXISTS email_seq_status_idx ON public.email_sequences(status);

-- ── Email send log ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sequence_id uuid REFERENCES email_sequences(id) ON DELETE SET NULL,
  patient_email text NOT NULL,
  subject text NOT NULL,
  resend_id text,   -- Resend message ID for tracking
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  CONSTRAINT email_logs_pkey PRIMARY KEY (id)
);

-- ── RLS policies ─────────────────────────────────────────────────────────────
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON email_sequences
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated full access" ON email_logs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── Service role bypass (for cron/server) ────────────────────────────────────
CREATE POLICY "service role full access" ON email_sequences
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "service role full access" ON email_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
