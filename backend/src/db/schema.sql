-- ============================================================
--  Inzira Works — PostgreSQL Schema
--  Safe to re-run: drops objects in dependency order first.
-- ============================================================

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Drop (reverse dependency order) ─────────────────────────
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
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(160) UNIQUE NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
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
