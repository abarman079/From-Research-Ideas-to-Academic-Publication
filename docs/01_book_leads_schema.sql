-- Run once in the private Supabase project's SQL editor. No public read/write grants.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.book_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  phone_e164 text NOT NULL UNIQUE CHECK (phone_e164 ~ '^\+8801[3-9][0-9]{8}$'),
  university text NOT NULL CHECK (char_length(university) BETWEEN 2 AND 140),
  department text NOT NULL CHECK (char_length(department) BETWEEN 2 AND 100),
  profession text NOT NULL CHECK (char_length(profession) BETWEEN 2 AND 80),
  source text NOT NULL DEFAULT 'direct' CHECK (source IN ('nav','feature','finale','book-back-cover','direct')),
  consented_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.book_leads ENABLE ROW LEVEL SECURITY;
-- No anonymous/authenticated policies: the server-only service role is the sole API access path.
REVOKE ALL ON TABLE public.book_leads FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS book_leads_created_at_idx ON public.book_leads (created_at DESC);
COMMENT ON TABLE public.book_leads IS 'Private book interest registrations, consent to follow up; not purchase orders.';
