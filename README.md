# Inzira Works

**A Web-Based Platform for Enhancing Market Access and Professional Visibility of Skilled Women in Kigali City, Rwanda**

BSc Capstone Project · African Leadership University, Kigali  
**Author:** GAKUBA Lassy Orlene  
**GitHub:** https://github.com/LassyGAKUBA/Inzira-works  
**Live Demo:** https://inzira-works.vercel.app  
**Demo Video:** https://drive.google.com/drive/folders/1ZBIf25mPVLGW8tzZXzBKacZYYzgHwckY

---

## 1. Description

Many skilled women in Kigali do excellent work but lack the digital visibility to reach new customers and prove their credibility. Inzira Works solves this by giving each provider a professional profile, a portfolio, and a transparent **Trust Score**, while giving customers a trustworthy way to search, compare, and book services.

The platform has three user roles:

- **Customer** — searches for providers, views profiles and trust scores, books services, cancels bookings, and leaves reviews.
- **Service Provider** — creates a profile, lists services, uploads portfolio work, manages bookings (accept/decline/complete), and grows a Trust Score.
- **Admin** — verifies providers, activates/deactivates accounts, manages the verification queue, and views platform analytics.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend & Database | Supabase (PostgreSQL + Auth + Row Level Security) |
| Serverless Functions | Supabase Edge Functions (Deno) |
| Email Notifications | Resend API |
| Deployment | Vercel (frontend) · Supabase Cloud (backend/DB) |
| Auth | Supabase Auth (email/password, JWT sessions) |
| i18n | Custom LangContext — English / Kinyarwanda |

---

## 3. Functional Requirements — Implementation Status

| # | Requirement | Status |
|---|---|---|
| FR1 | User registration with role selection (customer / provider) | Done |
| FR2 | Login, logout, password reset via email | Done |
| FR3 | Provider profiles with bio, portfolio, services, district | Done |
| FR4 | Service listings per provider with pricing | Done |
| FR5 | Booking workflow (request → confirm → complete) | Done |
| FR6 | Review and rating system (1–5 stars, after completion) | Done |
| FR7 | Provider directory with search by name, district, category | Done |
| FR8 | Trust Score auto-calculation via PostgreSQL triggers | Done |
| FR9 | Admin dashboard — analytics, verification queue, user management | Done |
| FR10 | Account self-deletion, privacy policy (Rwanda Data Protection Law) | Done |

**Non-Functional Requirements:**

| # | Requirement | Status |
|---|---|---|
| NFR1 | Responsive design — works on mobile and desktop | Done |
| NFR2 | Row Level Security on all Supabase tables | Done |
| NFR3 | Supabase serverless scales automatically | Done |
| NFR4 | Bilingual UI — English and Kinyarwanda | Done |
| NFR5 | Hosted on Vercel + Supabase Cloud (99.9% uptime SLA) | Done |
| NFR6 | Privacy Policy page, account deletion, data minimisation | Done |
| NFR7 | Email notifications via Resend API (booking alerts) | Done |

---

## 4. Key Features

### Trust Score (FR8)
A transparent 0–100 credibility score calculated automatically by PostgreSQL triggers whenever relevant data changes:

| Component | Weight |
|---|---|
| Average customer rating (1–5 stars) | 40% |
| Completed bookings (50 jobs = 100%) | 30% |
| Profile completeness (headline, bio, photo, services, district) | 20% |
| Response rate (% of bookings acted on) | 10% |

### Booking Workflow
1. Customer finds a provider in the directory
2. Selects a service, date, time, and optional notes
3. Provider receives an **email notification** via Resend and sees the request on their dashboard
4. Provider accepts or declines; customer is notified via status change on their dashboard
5. Provider marks the job complete; customer can then leave a review
6. Customer can cancel a pending or confirmed booking at any time

### Email Notifications
A Supabase Edge Function (`notify-booking`) fires on every new booking INSERT via a Database Webhook. It fetches provider and customer details and sends a styled HTML email to the provider with booking details and a direct link to their dashboard.

### Admin Tools
- View all customers and providers with real-time stats
- Activate / deactivate any user account
- Verify / unverify provider profiles (controls directory visibility)
- Verification queue for new provider sign-ups
- Platform-wide analytics: total providers, verified count, average trust score, total reviews

### WhatsApp Integration
Customers can message providers directly on WhatsApp after booking is confirmed. Providers can also be contacted via WhatsApp from the public profile page.

---

## 5. Project Structure

```
inzira-works/
├── frontend/                        # React + Vite app
│   └── src/
│       ├── components/shared/       # Navbar, ProtectedRoute, PageTransition
│       ├── context/                 # AuthContext (Supabase session)
│       ├── i18n/                    # LangContext, EN/RW translations
│       ├── lib/                     # Supabase client
│       └── pages/
│           ├── public/              # Home, About, Contact, Directory, ProviderProfile, Privacy
│           ├── auth/                # Login, Signup, RoleSelect, ForgotPassword, ResetPassword
│           ├── customer/            # CustomerDashboard
│           ├── provider/            # ProviderDashboard
│           └── admin/               # AdminDashboard
│
└── supabase/
    ├── functions/
    │   └── notify-booking/          # Edge Function — email alert on booking
    ├── trust_score_triggers.sql     # FR8: auto-recalculate trust score on data changes
    └── delete_account_rpc.sql       # FR10: SECURITY DEFINER RPC for account self-deletion
```

---

## 6. Database Schema

All tables live in Supabase PostgreSQL with Row Level Security enabled.

```
users ──1:1── provider_profiles ──1:M── services
  │                  │            ├──1:M── portfolio_items
  │                  │            └──1:M── provider_specialties
  │
  ├──1:M── bookings ──1:1── reviews
  └── (auth.users via Supabase Auth trigger)
```

**Core tables:**

| Table | Purpose |
|---|---|
| `users` | All accounts — customer, provider, admin |
| `provider_profiles` | 1:1 with provider users — trust score, verification, bio, district |
| `services` | Services a provider offers, with pricing |
| `portfolio_items` | Provider work samples (images) |
| `provider_specialties` | Skill/category tags per provider |
| `bookings` | Customer ↔ provider bookings with status lifecycle |
| `reviews` | One review per completed booking (1–5 stars + comment) |

**Booking status lifecycle:**
`pending` → `confirmed` → `completed`  
`pending` / `confirmed` → `rejected` (by provider) or `cancelled` (by customer)

---

## 7. Setup & Local Development

### Prerequisites
- Node.js v18+
- A Supabase project (free tier works)
- A Resend account (free tier) for email notifications

### Step 1 — Clone

```bash
git clone https://github.com/LassyGAKUBA/Inzira-works.git
cd Inzira-works
```

### Step 2 — Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev        # starts on http://localhost:5173
```

### Step 3 — Database

In **Supabase Dashboard → SQL Editor**, run in order:

1. `supabase/trust_score_triggers.sql` — deploys Trust Score auto-calculation triggers
2. `supabase/delete_account_rpc.sql` — deploys the account self-deletion RPC

Then go to **Database → Webhooks** and create a hook:
- Table: `bookings` · Event: `INSERT` · Type: Supabase Edge Function · Function: `notify-booking`

### Step 4 — Edge Function

Deploy the booking notification function:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
npx supabase functions deploy notify-booking
```

---

## 8. Demo Accounts

| Email | Password | Role |
|---|---|---|
| alice@example.com | Password123 | Provider (verified) |
| diane@example.com | Password123 | Provider (verified) |
| clarisse@example.com | Password123 | Provider (verified) |
| admin@inzira.works | Password123 | Admin |


---

## 9. Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables. |
| Database & Auth | Supabase Cloud | Fully managed PostgreSQL with Auth, RLS, and Edge Functions. |
| Email | Resend | API key stored as a Supabase Edge Function secret. |

Live URL: **https://inzira-works.vercel.app**

---

## 10. Compliance

This platform is designed in accordance with the **Rwanda Law No. 058/2021 on the Protection of Personal Data and Privacy**:

- Users can permanently delete their own account and all associated data at any time (Settings → Danger Zone)
- A Privacy Policy is published at `/privacy` explaining data collected, retention periods, and user rights
- No personal data is shared with third parties without consent
- Passwords are never stored — authentication is delegated to Supabase Auth (bcrypt + JWT)
