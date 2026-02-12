-- =============================================================================
-- VOICES.BE – Atomische Security Remediation (Feb 2026)
-- Alles-in-één: extension_in_public, rls_disabled_in_public, sensitive_columns
-- Run: Supabase Dashboard SQL Editor of supabase db push
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. EXTENSION: vector uit public naar extensions (extension_in_public)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'vector' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. RLS: Enable op alle public tables (rls_disabled_in_public)
-- Geen policy = deny all. Drizzle/DATABASE_URL bypassed RLS.
-- -----------------------------------------------------------------------------
ALTER TABLE public.actor_demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ademing_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ademing_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.central_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voicejar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yuki_outstanding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ademing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actor_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fame_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actor_dialects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_block_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voicejar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ademing_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_interest_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_configs') THEN
    ALTER TABLE public.market_configs ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rate_cards') THEN
    ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pronunciation_dictionary') THEN
    ALTER TABLE public.pronunciation_dictionary ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. USERS POLICY: AuthContext leest role via supabase.from('users')
-- Alleen eigen rij (email match met JWT). Fix voor sensitive_columns (iban).
-- authenticated = ingelogde gebruiker (anon heeft geen JWT met email).
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

COMMIT;
