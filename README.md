# Inzira Works

**A Web-Based Platform for Enhancing Market Access and Professional Visibility of Skilled Women in Kigali City, Rwanda**

BSc Capstone Project · African Leadership University, Kigali  
**Author:** GAKUBA Lassy Orlene  
**GitHub:** https://github.com/LassyGAKUBA/Inzira-works  
**Live Demo:** https://inzira-works.vercel.app  
**Demo Video:** https://drive.google.com/drive/folders/1ZBIf25mPVLGW8tzZXzBKacZYYzgHwckY

---

## Description

Many skilled women running small service businesses in Kigali — tailors, caterers, hairdressers, craft makers — rely entirely on word-of-mouth for new customers. They have no digital presence, no way to prove their credibility to strangers, and no structured way for customers to find or compare them.

Inzira Works solves this with a three-role marketplace:

- **Customer** — searches for providers, books services, leaves reviews, and files complaints.
- **Service Provider** — manages a profile, lists services with pricing, responds to bookings, builds a Trust Score, and receives live notifications.
- **Admin** — verifies providers, manages users, resolves complaints, and monitors platform analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router v7 |
| UI / Animations | Lucide React, Framer Motion |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Database | Supabase (PostgreSQL 15 + Row Level Security) |
| Authentication | Supabase Auth (email/password, PKCE flow, JWT) |
| Realtime | Supabase Realtime (`postgres_changes`) |
| Edge Functions | Supabase Edge Functions (Deno runtime, TypeScript) |
| Email | Resend API |
| Deployment | Vercel (frontend) · Supabase Cloud (backend/DB/functions) |
| i18n | Custom LangContext — English / Kinyarwanda |

---

## Functional Requirements — Implementation Status

| # | Requirement | Status |
|---|---|---|
| FR1 | User registration with role selection (customer / provider) | ✅ Done |
| FR2 | Login, logout, password reset via email | ✅ Done |
| FR3 | Provider profiles — bio, portfolio, services, district, specialties | ✅ Done |
| FR4 | Service listings with pricing (fixed / starting / hourly) | ✅ Done |
| FR5 | Booking workflow (request → confirm → complete / reject / cancel) | ✅ Done |
| FR6 | Review and rating system (1–5 stars, after completion only) | ✅ Done |
| FR7 | Provider directory with search, filtering, and pagination | ✅ Done |
| FR8 | Trust Score auto-calculation via PostgreSQL triggers | ✅ Done |
| FR9 | Admin dashboard — analytics, verification queue, user management | ✅ Done |
| FR10 | Account self-deletion, privacy policy (Rwanda Data Protection Law) | ✅ Done |
| FR11 | Complaint / dispute system (customer → provider → admin resolution) | ✅ Done |
| FR12 | Email notifications for full booking lifecycle (new, confirmed, rejected, completed) | ✅ Done |
| FR13 | In-app notification bell with Supabase Realtime | ✅ Done |

**Non-Functional Requirements:**

| # | Requirement | Status |
|---|---|---|
| NFR1 | Responsive design — mobile phones and desktop | ✅ Done |
| NFR2 | Row Level Security on all Supabase tables | ✅ Done |
| NFR3 | Serverless architecture — scales automatically | ✅ Done |
| NFR4 | Bilingual UI — English and Kinyarwanda | ✅ Done |
| NFR5 | Hosted on Vercel + Supabase Cloud (99.9% uptime SLA) | ✅ Done |
| NFR6 | Privacy Policy, account deletion, data minimisation | ✅ Done |
| NFR7 | Email notifications via Resend API for all booking events | ✅ Done |

---

## Key Features

### Trust Score (FR8)
A transparent 0–100 credibility score, automatically recalculated by PostgreSQL triggers on every relevant data change — no scheduled jobs or manual updates required.

| Component | Weight |
|---|---|
| Average customer rating (1–5 stars) | 40% |
| Completed bookings (50 jobs = 100%) | 30% |
| Profile completeness (headline, bio, photo, services, district, specialties) | 20% |
| Response rate (% of bookings acted on) | 10% |

Triggers fire on: review INSERT/UPDATE/DELETE, booking status UPDATE, profile headline/bio/district UPDATE, service INSERT/UPDATE/DELETE, specialty INSERT/DELETE.

### Booking Workflow
1. Customer finds a provider in the directory; views services with pricing
2. Selects a service, date, and optional notes; submits booking
3. Provider receives an **email notification** and sees the request in their dashboard
4. Provider accepts or declines — customer receives an **email notification** either way
5. Provider marks the job complete — customer receives an email prompting a review
6. Customer leaves a review (1–5 stars + comment); Trust Score updates automatically
7. Customer can cancel a pending or confirmed booking at any time

### Email Notification Pipeline (FR12)
A Supabase Edge Function (`notify-booking`) handles the full booking lifecycle:
- **New booking** → email to provider with booking details and dashboard link
- **Confirmed** → email to customer ("Your booking is confirmed")
- **Rejected** → email to customer ("Your booking was declined") + link to find another provider
- **Completed** → email to customer ("Service complete — leave a review")

The function is triggered via a Supabase Database Webhook on `bookings` INSERT and UPDATE.

### In-App Notification Bell (FR13)
The `NotificationBell` component subscribes to Supabase Realtime `postgres_changes` on the `bookings` table:
- **Providers** see a badge for each new incoming booking
- **Customers** see a badge when a booking status changes

Live badge count + dropdown with dismiss-all action. No polling required.

### Complaint / Dispute System (FR11)
- Customers can file a dispute from any completed booking in their History tab
- Providers see all complaints directed at them in a dedicated dashboard tab
- Admins see all platform complaints, can update status (pending → investigating → resolved), and can add an admin note

### Provider Directory Filters
Category (Tailoring, Hair & Beauty, Handcraft, Catering), district, minimum rating, minimum Trust Score, verified-only toggle. Applied client-side after a single `get_providers()` RPC call.

### Provider Response Time
Each provider card in the directory shows "Responds ~2 hrs" (or similar) derived from `avg_response_minutes` in their profile — calculated as the average time between a booking being created and the provider acting on it.

### WhatsApp Integration
Customers can message providers directly on WhatsApp from the provider's public profile and from a confirmed booking card. Phone numbers are automatically formatted to international Rwandan format (+250).

### Admin Tools
- Platform overview: total providers, avg Trust Score, total reviews, pending verifications
- District breakdown with visual bar charts
- Manage all providers: verify/unverify, enable/disable
- Manage all customers: enable/disable
- View all bookings with status filtering
- Complaint resolution with status management and admin notes

---

## Project Structure

```
inzira-works/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── public/        # HomePage, ProviderDirectory, ProviderProfilePage, About, Contact, Privacy, EULA
│       │   ├── auth/          # Login, Signup, RoleSelect, AuthCallback, ForgotPassword, ResetPassword, CheckEmail
│       │   ├── provider/      # ProviderDashboard (overview, bookings, history, analytics, reviews, complaints, portfolio, profile)
│       │   ├── customer/      # CustomerDashboard (overview, bookings, history, reviews, complaints)
│       │   └── admin/         # AdminDashboard (overview, providers, customers, bookings, complaints, verify queue)
│       ├── components/
│       │   └── shared/        # Navbar, NotificationBell, ProtectedRoute, LanguageSwitcher, PageTransition
│       ├── context/           # AuthContext (Supabase session + register/login/logout)
│       ├── i18n/              # LangContext, EN / RW translation strings
│       └── lib/               # supabase.js client
│
├── backend/
│   └── src/db/
│       └── schema.sql         # Full PostgreSQL schema, enums, triggers, RLS policies, RPC functions
│
├── supabase/
│   ├── functions/
│   │   └── notify-booking/    # Edge Function — email notifications for all booking events
│   ├── trust_score_triggers.sql
│   └── delete_account_rpc.sql
│
└── README.md
```

---

## Setup & Local Development

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Resend](https://resend.com) account (free tier) for email notifications

### 1. Clone and install

```bash
git clone https://github.com/LassyGAKUBA/Inzira-works.git
cd Inzira-works/frontend
npm install
```

### 2. Environment variables

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database — base schema

In **Supabase Dashboard → SQL Editor**, run:

```
backend/src/db/schema.sql
```

This creates all tables, enums, RLS policies, RPC functions, and the auth trigger.

### 4. Database — additional SQL files

```
supabase/trust_score_triggers.sql   # Trust Score auto-calculation triggers
supabase/delete_account_rpc.sql     # Account self-deletion RPC
```

### 5. Required SQL patches

Run these in the SQL Editor after the base schema:

```sql
-- Fix: provider_profiles row auto-created at signup (server-side, not reliant on email callback)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE v_role user_role;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer');
  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name','User'), NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'phone',''), v_role)
  ON CONFLICT (id) DO NOTHING;
  IF v_role = 'provider' THEN
    INSERT INTO public.provider_profiles
      (user_id, headline, bio, district, trust_score, profile_completeness, response_rate, repeat_rate)
    VALUES (
      NEW.id,
      NULLIF(TRIM(NEW.raw_user_meta_data->>'category'),''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'bio'),''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'district'),''),
      0, 0, 0, 0
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: RLS policies so providers can write their own specialties, services, and portfolio items
CREATE POLICY "specialties_own" ON provider_specialties FOR ALL
  USING (EXISTS (
    SELECT 1 FROM provider_profiles pp
    WHERE pp.id = provider_specialties.provider_id AND pp.user_id = auth.uid()
  ));

CREATE POLICY "services_own" ON services FOR ALL
  USING (EXISTS (
    SELECT 1 FROM provider_profiles pp
    WHERE pp.id = services.provider_id AND pp.user_id = auth.uid()
  ));

CREATE POLICY "portfolio_own" ON portfolio_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM provider_profiles pp
    WHERE pp.id = portfolio_items.provider_id AND pp.user_id = auth.uid()
  ));

-- Fix: add status and admin_note columns to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Backfill: create missing provider_profiles rows for any providers who registered before the trigger fix
INSERT INTO public.provider_profiles
  (user_id, trust_score, profile_completeness, response_rate, repeat_rate)
SELECT u.id, 0, 0, 0, 0
FROM public.users u
WHERE u.role = 'provider'
  AND NOT EXISTS (SELECT 1 FROM public.provider_profiles pp WHERE pp.user_id = u.id);
```

### 6. Enable Supabase Realtime

In Supabase Dashboard → Database → Replication, enable the **`bookings`** table for Realtime.

### 7. Deploy the Edge Function

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
npx supabase functions deploy notify-booking
```

Then in Supabase Dashboard → Database → Webhooks, create a webhook:
- **Table:** `bookings`
- **Events:** `INSERT` and `UPDATE`
- **Type:** Supabase Edge Function
- **Function:** `notify-booking`

### 8. Run locally

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Database Schema

All tables have Row Level Security enabled.

```
auth.users (Supabase managed)
    │
    └─[trigger: handle_new_user]─→ public.users
                                        │
                                        └──1:1── provider_profiles
                                                      │
                                                      ├──1:M── services
                                                      ├──1:M── provider_specialties
                                                      ├──1:M── portfolio_items
                                                      └──1:M── verification_requests
                                        │
                                        ├──1:M── bookings (customer_id + provider_id)
                                        │            └──1:1── reviews
                                        ├──1:M── complaints
                                        └──1:M── saved_providers
```

| Table | Purpose |
|---|---|
| `users` | All accounts — customer, provider, admin |
| `provider_profiles` | 1:1 with provider users — trust score, verification, bio, district |
| `services` | Services a provider offers with pricing (fixed / starting / hourly) |
| `portfolio_items` | Provider work sample images |
| `provider_specialties` | Skill and category tags per provider |
| `bookings` | Full booking lifecycle with status enum |
| `reviews` | One review per completed booking (1–5 stars + comment) |
| `complaints` | Customer disputes linked to a booking, with admin resolution |
| `saved_providers` | Customer favourites |
| `verification_requests` | Provider document uploads for admin review |

**Booking status lifecycle:**
```
pending → confirmed → completed
pending → rejected  (by provider)
pending → cancelled (by customer)
confirmed → cancelled (by customer)
```

---

## Key RPC Functions

| Function | Purpose |
|---|---|
| `get_providers()` | All active providers for the directory |
| `get_provider_detail(p_id)` | Full profile detail for one provider |
| `admin_approve_provider(p_profile_id)` | Admin: set verification_status → verified |
| `recalculate_provider_scores(p_user_id)` | Recalculate trust score for one provider |
| `increment_profile_views(p_id)` | Increment view counter on profile visit |
| `delete_own_account()` | User self-deletion (SECURITY DEFINER, deletes in FK order) |

---

## Roles & Access Control

| Role | Route | Access |
|---|---|---|
| `provider` | `/provider/dashboard` | Profile, bookings, history, analytics, reviews, complaints, portfolio |
| `customer` | `/customer/dashboard` | Overview, bookings, history, reviews, complaints |
| `admin` | `/admin/dashboard` | All data, verification queue, complaint resolution |
| Public | `/`, `/providers`, `/providers/:id` | Homepage, directory, individual profiles |

Unauthenticated access to protected routes redirects to `/login` via `ProtectedRoute`.

---

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| alice@example.com | Password123 | Provider (verified) |
| diane@example.com | Password123 | Provider (verified) |
| clarisse@example.com | Password123 | Provider (verified) |
| admin@inzira.works | Password123 | Admin |

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main`. Set env vars in Vercel dashboard. |
| Database + Auth | Supabase Cloud | Managed PostgreSQL, Auth, RLS, and Edge Functions. |
| Email | Resend API | Key stored as a Supabase Edge Function secret (`RESEND_API_KEY`). |

**Live URL:** https://inzira-works.vercel.app

After deploying to Vercel, add the production URL to Supabase Auth → URL Configuration → Redirect URLs:
```
https://inzira-works.vercel.app/auth/callback
```

---

## Compliance

This platform is designed in accordance with **Rwanda Law No. 058/2021 on the Protection of Personal Data and Privacy**:

- Users can permanently delete their own account and all associated data at any time (Settings → Danger Zone)
- A Privacy Policy is published at `/privacy` explaining data collected, retention periods, and user rights
- No personal data is shared with third parties without consent
- Passwords are never stored — authentication is delegated to Supabase Auth (bcrypt + JWT)
