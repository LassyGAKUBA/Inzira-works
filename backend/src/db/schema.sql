-- ============================================================
--  Inzira Works — PostgreSQL Schema
--  Safe to re-run: drops objects in dependency order first.
-- ============================================================

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Drop (reverse dependency order) ─────────────────────────
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS saved_providers       CASCADE;
DROP TABLE IF EXISTS reviews               CASCADE;
DROP TABLE IF EXISTS bookings              CASCADE;
DROP TABLE IF EXISTS portfolio_items       CASCADE;
DROP TABLE IF EXISTS services              CASCADE;
DROP TABLE IF EXISTS provider_specialties  CASCADE;
DROP TABLE IF EXISTS provider_categories   CASCADE;
DROP TABLE IF EXISTS categories            CASCADE;
DROP TABLE IF EXISTS provider_profiles     CASCADE;
DROP TABLE IF EXISTS users                 CASCADE;

DROP TYPE IF EXISTS user_role      CASCADE;
DROP TYPE IF EXISTS verify_status  CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS price_kind     CASCADE;
DROP TYPE IF EXISTS mod_status     CASCADE;

-- ── Enums ───────────────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE verify_status  AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'rejected', 'cancelled');
CREATE TYPE price_kind     AS ENUM ('fixed', 'starting', 'hourly');
CREATE TYPE mod_status     AS ENUM ('approved', 'flagged', 'removed');

-- ── Shared updated_at trigger function ──────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
--  USERS  (all roles live here)
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(160) UNIQUE NOT NULL,
  phone         VARCHAR(20)  NOT NULL DEFAULT '',
  role          user_role    NOT NULL DEFAULT 'customer',
  district      VARCHAR(60),
  avatar_url    TEXT,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  PROVIDER PROFILES  (1:1 with a user where role = 'provider')
-- ============================================================
CREATE TABLE provider_profiles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  headline             VARCHAR(120),
  bio                  TEXT,
  district             VARCHAR(60),
  cover_image_url      TEXT,
  avg_response_minutes INT,
  response_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0–100
  repeat_rate          NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0–100
  verification_status  verify_status NOT NULL DEFAULT 'pending',
  verified_at          TIMESTAMPTZ,
  verified_by          UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_completeness NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0–100
  trust_score          NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0–100 (cached)
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_profiles_trust ON provider_profiles(trust_score DESC);
CREATE INDEX idx_provider_profiles_verif ON provider_profiles(verification_status);

CREATE TRIGGER trg_provider_profiles_updated
  BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  CATEGORIES  +  provider ↔ category (M:M)
-- ============================================================
CREATE TABLE categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(60) UNIQUE NOT NULL,
  slug      VARCHAR(60) UNIQUE NOT NULL,
  icon      VARCHAR(60),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE provider_categories (
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id)        ON DELETE CASCADE,
  PRIMARY KEY (provider_id, category_id)
);

-- ============================================================
--  PROVIDER SPECIALTIES  (tags: "Dresses", "Agaseke", "Braiding")
-- ============================================================
CREATE TABLE provider_specialties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  label       VARCHAR(60) NOT NULL
);

CREATE INDEX idx_specialties_provider ON provider_specialties(provider_id);

-- ============================================================
--  SERVICES
-- ============================================================
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title       VARCHAR(120) NOT NULL,
  description TEXT,
  price       NUMERIC(12,2),
  price_type  price_kind NOT NULL DEFAULT 'fixed',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_provider ON services(provider_id);

-- ============================================================
--  PORTFOLIO ITEMS
-- ============================================================
CREATE TABLE portfolio_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     VARCHAR(160),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_provider ON portfolio_items(provider_id);

-- ============================================================
--  BOOKINGS
--  customer_id and provider_id both point at users(id).
--  provider must be a user whose role = 'provider'.
-- ============================================================
CREATE TABLE bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id     UUID REFERENCES services(id) ON DELETE SET NULL,
  title          VARCHAR(160) NOT NULL,          -- e.g. "Wedding Dress Alteration"
  status         booking_status NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  amount         NUMERIC(12,2),
  notes          TEXT,
  responded_at   TIMESTAMPTZ,                    -- when provider accepted/rejected
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status   ON bookings(status);

CREATE TRIGGER trg_bookings_updated
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  REVIEWS  (one per completed booking)
-- ============================================================
CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment           TEXT,
  moderation_status mod_status NOT NULL DEFAULT 'approved',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);

-- ============================================================
--  SAVED PROVIDERS  (customer bookmarks a provider)
-- ============================================================
CREATE TABLE saved_providers (
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, provider_id)
);

-- ============================================================
--  VERIFICATION REQUESTS  (provider submits, admin reviews)
-- ============================================================
CREATE TABLE verification_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id  UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  status       verify_status NOT NULL DEFAULT 'pending',
  document_url TEXT,
  reviewed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verif_status ON verification_requests(status);

-- ============================================================
--  SUPABASE AUTH → PUBLIC.USERS SYNC TRIGGER
--  Fires when a new user signs up via Supabase Auth and
--  automatically creates the matching public.users row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_specialties  ENABLE ROW LEVEL SECURITY;
ALTER TABLE services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_providers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Public read: anyone (including anonymous) can browse provider data
CREATE POLICY "public_read_users"              ON users              FOR SELECT USING (true);
CREATE POLICY "public_read_provider_profiles"  ON provider_profiles  FOR SELECT USING (true);
CREATE POLICY "public_read_categories"         ON categories         FOR SELECT USING (true);
CREATE POLICY "public_read_provider_cats"      ON provider_categories FOR SELECT USING (true);
CREATE POLICY "public_read_specialties"        ON provider_specialties FOR SELECT USING (true);
CREATE POLICY "public_read_services"           ON services           FOR SELECT USING (true);
CREATE POLICY "public_read_portfolio"          ON portfolio_items    FOR SELECT USING (true);
CREATE POLICY "public_read_reviews"            ON reviews            FOR SELECT USING (moderation_status = 'approved');

-- Authenticated users can manage their own data
CREATE POLICY "users_update_own"     ON users             FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "bookings_own"         ON bookings          FOR ALL    USING (auth.uid() = customer_id OR auth.uid() = provider_id);
CREATE POLICY "saved_providers_own"  ON saved_providers   FOR ALL    USING (auth.uid() = customer_id);
CREATE POLICY "reviews_insert_own"   ON reviews           FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "provider_profile_own" ON provider_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "provider_update_own"  ON provider_profiles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
--  RPC FUNCTIONS  (called by the frontend via supabase.rpc())
-- ============================================================

-- Returns all active providers for the directory page
CREATE OR REPLACE FUNCTION get_providers()
RETURNS TABLE(
  provider_id         UUID,
  user_id             UUID,
  full_name           TEXT,
  avatar_url          TEXT,
  headline            TEXT,
  district            TEXT,
  trust_score         NUMERIC,
  verification_status TEXT,
  avg_rating          NUMERIC,
  review_count        BIGINT,
  specialties         TEXT[],
  categories          TEXT[]
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.id::UUID                                               AS provider_id,
    u.id::UUID                                                AS user_id,
    u.full_name::TEXT,
    u.avatar_url::TEXT,
    pp.headline::TEXT,
    pp.district::TEXT,
    pp.trust_score::NUMERIC,
    pp.verification_status::TEXT                              AS verification_status,
    COALESCE(r.avg_rating,    0::NUMERIC)::NUMERIC            AS avg_rating,
    COALESCE(r.review_count,  0::BIGINT)::BIGINT              AS review_count,
    COALESCE(s.specialties,   ARRAY[]::TEXT[])                AS specialties,
    COALESCE(c.categories,    ARRAY[]::TEXT[])                AS categories
  FROM provider_profiles pp
  JOIN users u ON u.id = pp.user_id
  LEFT JOIN (
    SELECT reviews.provider_id,
           ROUND(AVG(reviews.rating::NUMERIC), 1)  AS avg_rating,
           COUNT(*)::BIGINT                          AS review_count
    FROM reviews
    WHERE reviews.moderation_status = 'approved'
    GROUP BY reviews.provider_id
  ) r ON r.provider_id = u.id
  LEFT JOIN (
    SELECT provider_specialties.provider_id,
           ARRAY_AGG(provider_specialties.label::TEXT) AS specialties
    FROM provider_specialties
    GROUP BY provider_specialties.provider_id
  ) s ON s.provider_id = pp.id
  LEFT JOIN (
    SELECT pc.provider_id,
           ARRAY_AGG(cat.name::TEXT ORDER BY cat.name) AS categories
    FROM provider_categories pc
    JOIN categories cat ON cat.id = pc.category_id
    WHERE cat.is_active = TRUE
    GROUP BY pc.provider_id
  ) c ON c.provider_id = pp.id
  WHERE u.is_active = TRUE
  ORDER BY pp.trust_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Returns full detail for a single provider by provider_profiles.id
CREATE OR REPLACE FUNCTION get_provider_detail(p_id UUID)
RETURNS JSONB SECURITY DEFINER AS $$
DECLARE
  v_provider     RECORD;
  v_specialties  TEXT[];
  v_services     JSONB;
  v_portfolio    JSONB;
  v_reviews      JSONB;
BEGIN
  SELECT
    pp.id                          AS provider_id,
    u.id                           AS user_id,
    u.full_name,
    u.avatar_url,
    u.created_at                   AS member_since,
    pp.headline,
    pp.bio,
    pp.district,
    pp.cover_image_url,
    pp.avg_response_minutes,
    pp.response_rate,
    pp.repeat_rate,
    pp.profile_completeness,
    pp.trust_score,
    pp.verification_status,
    COALESCE(r.avg_rating, 0)      AS avg_rating,
    COALESCE(r.review_count, 0)    AS review_count,
    COALESCE(b.completed_jobs, 0)  AS completed_jobs
  INTO v_provider
  FROM provider_profiles pp
  JOIN users u ON u.id = pp.user_id
  LEFT JOIN (
    SELECT provider_id,
           ROUND(AVG(rating)::NUMERIC, 1) AS avg_rating,
           COUNT(*) AS review_count
    FROM reviews WHERE moderation_status = 'approved'
    GROUP BY provider_id
  ) r ON r.provider_id = u.id
  LEFT JOIN (
    SELECT provider_id, COUNT(*) AS completed_jobs
    FROM bookings WHERE status = 'completed'
    GROUP BY provider_id
  ) b ON b.provider_id = u.id
  WHERE pp.id = p_id;

  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT ARRAY_AGG(label ORDER BY label) INTO v_specialties
  FROM provider_specialties WHERE provider_id = p_id;

  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT('id', id, 'title', title, 'description', description, 'price', price, 'price_type', price_type)
    ORDER BY created_at
  ), '[]'::JSON) INTO v_services
  FROM services WHERE provider_id = p_id AND is_active = TRUE;

  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT('id', id, 'image_url', image_url, 'caption', caption)
    ORDER BY created_at
  ), '[]'::JSON) INTO v_portfolio
  FROM portfolio_items WHERE provider_id = p_id;

  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', rv.id, 'rating', rv.rating, 'comment', rv.comment,
      'created_at', rv.created_at, 'customer_name', cu.full_name
    )
    ORDER BY rv.created_at DESC
  ), '[]'::JSON) INTO v_reviews
  FROM reviews rv
  JOIN users cu ON cu.id = rv.customer_id
  WHERE rv.provider_id = v_provider.user_id AND rv.moderation_status = 'approved';

  RETURN JSON_BUILD_OBJECT(
    'provider_id',        v_provider.provider_id,
    'user_id',            v_provider.user_id,
    'full_name',          v_provider.full_name,
    'avatar_url',         v_provider.avatar_url,
    'member_since',       v_provider.member_since,
    'headline',           v_provider.headline,
    'bio',                v_provider.bio,
    'district',           v_provider.district,
    'cover_image_url',    v_provider.cover_image_url,
    'avg_response_minutes', v_provider.avg_response_minutes,
    'response_rate',      v_provider.response_rate,
    'repeat_rate',        v_provider.repeat_rate,
    'profile_completeness', v_provider.profile_completeness,
    'trust_score',        v_provider.trust_score,
    'verification_status', v_provider.verification_status,
    'avg_rating',         v_provider.avg_rating,
    'review_count',       v_provider.review_count,
    'completed_jobs',     v_provider.completed_jobs,
    'specialties',        COALESCE(v_specialties, ARRAY[]::TEXT[]),
    'services',           v_services,
    'portfolio',          v_portfolio,
    'reviews',            v_reviews
  );
END;
$$ LANGUAGE plpgsql;

-- Admin: approve a provider's verification status
-- Caller must have role = 'admin' in the users table
CREATE OR REPLACE FUNCTION admin_approve_provider(p_profile_id UUID)
RETURNS void SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE provider_profiles
  SET verification_status = 'verified',
      verified_at         = now(),
      verified_by         = auth.uid()
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql;
