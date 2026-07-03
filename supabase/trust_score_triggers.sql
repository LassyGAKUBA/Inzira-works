-- ─────────────────────────────────────────────────────────────────────────────
-- FR8: Trust Score auto-calculation
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Core calculation function
--    Receives users.id (the provider's auth user id)
--    Recalculates: response_rate, profile_completeness, trust_score
--    Note: avg_rating / review_count are NOT stored columns — they are
--    computed live by the get_providers / get_provider_detail RPCs.
CREATE OR REPLACE FUNCTION public.recalculate_provider_scores(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id        UUID;
  v_avg_rating        NUMERIC := 0;
  v_completed_count   INTEGER := 0;
  v_response_rate     NUMERIC := 0;
  v_has_headline      BOOLEAN := FALSE;
  v_has_bio           BOOLEAN := FALSE;
  v_has_district      BOOLEAN := FALSE;
  v_has_avatar        BOOLEAN := FALSE;
  v_has_service       BOOLEAN := FALSE;
  v_has_specialty     BOOLEAN := FALSE;
  v_profile_complete  NUMERIC := 0;
  v_rating_score      NUMERIC := 0;
  v_booking_score     NUMERIC := 0;
  v_trust_score       NUMERIC := 0;
BEGIN
  SELECT id INTO v_profile_id FROM provider_profiles WHERE user_id = p_user_id;
  IF v_profile_id IS NULL THEN RETURN; END IF;

  -- Average rating from reviews
  SELECT COALESCE(AVG(rating), 0)
  INTO v_avg_rating
  FROM reviews WHERE provider_id = p_user_id;

  -- Completed bookings
  SELECT COUNT(*) INTO v_completed_count
  FROM bookings WHERE provider_id = p_user_id AND status = 'completed';

  -- Response rate: proportion of bookings the provider acted on
  SELECT CASE
    WHEN COUNT(*) = 0 THEN 0
    ELSE ROUND(
      COUNT(*) FILTER (WHERE status IN ('confirmed','completed','rejected'))::NUMERIC
      / COUNT(*) * 100
    )
  END INTO v_response_rate
  FROM bookings WHERE provider_id = p_user_id;

  -- Profile completeness signals
  SELECT
    COALESCE(headline IS NOT NULL AND headline <> '', FALSE),
    COALESCE(bio      IS NOT NULL AND bio      <> '', FALSE),
    COALESCE(district IS NOT NULL AND district <> '', FALSE)
  INTO v_has_headline, v_has_bio, v_has_district
  FROM provider_profiles WHERE user_id = p_user_id;

  SELECT COALESCE(avatar_url IS NOT NULL, FALSE)
  INTO v_has_avatar FROM users WHERE id = p_user_id;

  SELECT EXISTS(
    SELECT 1 FROM services WHERE provider_id = v_profile_id AND is_active = TRUE
  ) INTO v_has_service;

  SELECT EXISTS(
    SELECT 1 FROM provider_specialties WHERE provider_id = v_profile_id
  ) INTO v_has_specialty;

  -- Completeness score (total 100 points)
  v_profile_complete :=
    (CASE WHEN v_has_headline  THEN 20 ELSE 0 END) +
    (CASE WHEN v_has_bio       THEN 20 ELSE 0 END) +
    (CASE WHEN v_has_district  THEN 10 ELSE 0 END) +
    (CASE WHEN v_has_avatar    THEN 20 ELSE 0 END) +
    (CASE WHEN v_has_service   THEN 15 ELSE 0 END) +
    (CASE WHEN v_has_specialty THEN 15 ELSE 0 END);

  -- Weighted trust score
  -- 40% ratings  (avg_rating / 5 * 100)
  -- 30% bookings (50 completed = 100%)
  -- 20% profile completeness
  -- 10% response rate
  v_rating_score  := (v_avg_rating / 5.0) * 100.0;
  v_booking_score := LEAST(v_completed_count::NUMERIC / 50.0, 1.0) * 100.0;
  v_trust_score   :=
    (v_rating_score     * 0.40) +
    (v_booking_score    * 0.30) +
    (v_profile_complete * 0.20) +
    (v_response_rate    * 0.10);

  UPDATE provider_profiles SET
    response_rate        = v_response_rate,
    profile_completeness = v_profile_complete,
    trust_score          = ROUND(LEAST(v_trust_score, 100))
  WHERE user_id = p_user_id;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Trigger: after review INSERT / UPDATE / DELETE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_reviews_update_trust()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_provider_scores(OLD.provider_id); RETURN OLD;
  ELSE
    PERFORM public.recalculate_provider_scores(NEW.provider_id); RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_trust ON public.reviews;
CREATE TRIGGER trg_reviews_trust
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trg_reviews_update_trust();


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Trigger: after booking status change
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_bookings_update_trust()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.recalculate_provider_scores(NEW.provider_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_trust ON public.bookings;
CREATE TRIGGER trg_bookings_trust
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.trg_bookings_update_trust();


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Trigger: after profile headline / bio / district update
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_profile_update_trust()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalculate_provider_scores(NEW.user_id); RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_trust ON public.provider_profiles;
CREATE TRIGGER trg_profile_trust
AFTER UPDATE OF headline, bio, district ON public.provider_profiles
FOR EACH ROW EXECUTE FUNCTION public.trg_profile_update_trust();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Trigger: after service added / removed
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_services_update_trust()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM provider_profiles WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  IF v_user_id IS NOT NULL THEN
    PERFORM public.recalculate_provider_scores(v_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_services_trust ON public.services;
CREATE TRIGGER trg_services_trust
AFTER INSERT OR UPDATE OR DELETE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.trg_services_update_trust();


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Trigger: after specialty added / removed
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_specialties_update_trust()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM provider_profiles WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  IF v_user_id IS NOT NULL THEN
    PERFORM public.recalculate_provider_scores(v_user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_specialties_trust ON public.provider_specialties;
CREATE TRIGGER trg_specialties_trust
AFTER INSERT OR DELETE ON public.provider_specialties
FOR EACH ROW EXECUTE FUNCTION public.trg_specialties_update_trust();


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Back-fill: recalculate scores for ALL existing providers now
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM provider_profiles LOOP
    PERFORM public.recalculate_provider_scores(r.user_id);
  END LOOP;
END;
$$;
