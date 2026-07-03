
-- ─────────────────────────────────────────────────────────────────────────────
-- Account self-deletion RPC
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Called from the frontend as: supabase.rpc('delete_my_account')
-- Deletes all business data for the authenticated user, then the users row.
-- The auth.users record is signed out client-side after this completes.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_profile_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get provider profile id (NULL for customers)
  SELECT id INTO v_profile_id
  FROM provider_profiles WHERE user_id = v_user_id;

  -- Delete provider-specific data
  IF v_profile_id IS NOT NULL THEN
    DELETE FROM portfolio_items      WHERE provider_id = v_profile_id;
    DELETE FROM provider_specialties WHERE provider_id = v_profile_id;
    DELETE FROM services             WHERE provider_id = v_profile_id;
    DELETE FROM provider_profiles    WHERE id = v_profile_id;
  END IF;

  -- Delete reviews and bookings
  DELETE FROM reviews  WHERE customer_id = v_user_id OR provider_id = v_user_id;
  DELETE FROM bookings WHERE customer_id = v_user_id OR provider_id = v_user_id;

  -- Delete user record
  DELETE FROM users WHERE id = v_user_id;
END;
$$;
