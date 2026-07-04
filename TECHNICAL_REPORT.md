# Technical Report — Inzira Works

**BSc Capstone Project · African Leadership University, Kigali**
**Author:** GAKUBA Lassy Orlene
**Live Demo:** https://inzira-works.vercel.app
**GitHub:** https://github.com/LassyGAKUBA/Inzira-works
**Demo Video:** https://drive.google.com/drive/folders/1ZBIf25mPVLGW8tzZXzBKacZYYzgHwckY

---

## 1. Introduction

Many skilled women running small service businesses in Kigali — tailors, caterers, hairdressers, craft makers — rely entirely on word-of-mouth for new customers. They have no digital presence, no way to prove their credibility to strangers, and no structured way for customers to find or compare them.

Inzira Works solves this with a three-role marketplace:

- **Customer** — searches for providers, books services, cancels bookings, and leaves reviews after completion.
- **Service Provider** — manages a profile, lists services and portfolio work, responds to bookings, and builds a Trust Score over time.
- **Admin** — verifies providers, activates or deactivates accounts, and monitors platform analytics.

---

## 2. Technical Architecture

The system uses a serverless architecture. This eliminated the need to manage a backend server and reduced deployment complexity significantly.

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Authentication | Supabase Auth — email/password, JWT sessions |
| Serverless Functions | Supabase Edge Functions (Deno runtime) |
| Email | Resend API |
| Deployment | Vercel (frontend) + Supabase Cloud (backend/DB) |
| i18n | Custom LangContext — English and Kinyarwanda |

### Database Schema

Seven core tables with foreign key relationships enforced at the database level:

- `users` — all accounts (customer, provider, admin)
- `provider_profiles` — trust score, verification status, bio, district (1:1 with provider users)
- `services` — services a provider offers with pricing
- `portfolio_items` — provider work sample images
- `provider_specialties` — skill and category tags
- `bookings` — full booking lifecycle (pending → confirmed → completed / rejected / cancelled)
- `reviews` — one review per completed booking (1–5 stars + comment)

---

## 3. Key Algorithms and Features

### Trust Score (FR8)

The Trust Score is a 0–100 composite metric recalculated **automatically** by PostgreSQL triggers whenever relevant data changes. No manual or scheduled recalculation is needed.

```
trust_score = (avg_rating / 5.0 × 100)          × 0.40   -- 40% ratings
            + (MIN(completed_jobs / 50, 1) × 100) × 0.30   -- 30% bookings
            + profile_completeness                × 0.20   -- 20% profile
            + response_rate                       × 0.10   -- 10% response rate
```

Triggers fire on: review insert/update/delete, booking status change, profile update, service add/remove, and specialty add/remove.

### Booking Notification Pipeline (NFR7)

When a customer makes a booking:
1. Frontend inserts a row into the `bookings` table
2. A Supabase Database Webhook detects the INSERT and calls the `notify-booking` Edge Function
3. The Edge Function fetches the provider's email and customer's details from the database
4. A formatted HTML email is sent to the provider via the Resend API with booking details and a link to their dashboard

### Account Self-Deletion (FR10)

A `SECURITY DEFINER` PostgreSQL function (`delete_my_account`) deletes all user data in the correct dependency order: portfolio → specialties → services → provider profile → reviews → bookings → user row. The function uses `auth.uid()` so users can only delete their own data.

---

## 4. Requirements Coverage

### Functional Requirements

| # | Requirement | Status |
|---|---|---|
| FR1 | User registration with role selection | Done |
| FR2 | Login, logout, password reset | Done |
| FR3 | Provider profiles with bio, portfolio, services, district | Done |
| FR4 | Service listings with pricing | Done |
| FR5 | Booking workflow — request, confirm, complete, cancel | Done |
| FR6 | Review and rating system (1–5 stars, post-completion only) | Done |
| FR7 | Provider directory with search and filtering | Done |
| FR8 | Trust Score auto-calculation via PostgreSQL triggers | Done |
| FR9 | Admin dashboard — analytics, verification, user management | Done |
| FR10 | Account self-deletion + Privacy Policy (Rwanda data law) | Done |


### Non-Functional Requirements

| # | Requirement | Status |
|---|---|---|
| NFR1 | Responsive design — mobile and desktop | Done |
| NFR2 | Row Level Security on all database tables | Done |
| NFR3 | Serverless architecture scales automatically | Done |
| NFR4 | Bilingual UI — English and Kinyarwanda | Done |
| NFR5 | Hosted on Vercel + Supabase (99.9% uptime SLA) | Done |
| NFR6 | Privacy Policy, account deletion, data minimisation | Done |
| NFR7 | Email notifications to providers on new bookings | Done |

---

## 5. Testing Results and Strategies

### Testing Strategies

- **End-to-end functional testing** — every user flow tested manually on the live deployed site, not just locally
- **Role-based testing** — separate test sessions as customer, provider, and admin to confirm role isolation and protected routes
- **Edge case testing** — incomplete data, missing relationships, and boundary conditions tested deliberately
- **Database integrity testing** — SQL queries run in Supabase SQL Editor to verify data was written correctly after each feature
- **Cross-device testing** — tested on desktop (1920×1080) and mobile (375px viewport)
- **Error injection testing** — wrong passwords, missing fields, and invalid dates tested to confirm validation messages

### Functional Test Cases

| ID | Feature | Input / Condition | Expected | Result |
|---|---|---|---|---|
| TC01 | Customer registration | Valid email, password, name, district | Account created, redirected to dashboard | PASS |
| TC02 | Provider registration | Valid details + category | users row + provider_profiles row created | PASS |
| TC03 | Login — correct credentials | Registered email and password | Session established, redirected by role | PASS |
| TC04 | Login — wrong password | Correct email, wrong password | Error shown, no session created | PASS |
| TC05 | Password reset | Registered email | Reset email delivered, link works | PASS |
| TC06 | Protected routes | Unauthenticated access to /customer/dashboard | Redirected to /login | PASS |
| TC07 | Provider directory search | Search "cook", district filter "Kicukiro" | Results filtered correctly | PASS |
| TC08 | Booking — with services listed | Select service, date, time | Booking created, appears in provider dashboard | PASS |
| TC09 | Booking — no services listed | Provider with empty service list | "General service request" option shown, booking proceeds | PASS |
| TC10 | Provider accept booking | Click Accept on pending request | Status changes to confirmed | PASS |
| TC11 | Provider decline booking | Click Decline on pending request | Status changes to rejected | PASS |
| TC12 | Provider mark complete | Click Complete on confirmed booking | Status changes to completed, review button appears | PASS |
| TC13 | Customer cancel booking | Cancel a pending booking | Status changes to cancelled, removed from upcoming list | PASS |
| TC14 | Leave a review | 4-star rating + comment after completed booking | Review saved, provider trust score updated automatically | PASS |
| TC15 | Trust Score trigger | New review inserted for provider | trust_score in provider_profiles updated within same transaction | PASS |
| TC16 | Admin verify provider | Click Verify in All Providers tab | verification_status → verified, provider appears in directory | PASS |
| TC17 | Admin deactivate user | Click Disable on a user | is_active → false, account blocked | PASS |
| TC18 | Account self-deletion | Type "DELETE" in confirmation field | All data removed, signed out, redirected to home | PASS |
| TC19 | Bilingual UI | Toggle language switcher to Kinyarwanda | All labels switch to Kinyarwanda | PASS |
| TC20 | Mobile layout | 375px viewport | Sidebar collapses to hamburger, all content accessible | PASS |
| TC21 | WhatsApp integration | Click WhatsApp on a booking | WhatsApp opens with pre-filled message and provider number | PASS |
| TC22 | Email notification | New booking inserted | Edge Function fires, provider receives email via Resend | PASS |

### Defects Found and Fixed During Testing

**1. Signup returning HTTP 500**
- Found by: manual registration test; confirmed in Supabase logs
- Cause: Custom Resend SMTP was configured in Supabase Auth. When a signup is attempted, Supabase tries to send a confirmation email via SMTP. Resend rejected the call, causing a 500 error returned to the client
- Fix: Disabled custom SMTP in Supabase Auth settings. Password reset continues to work via Supabase's default email provider

**2. Customer dashboard showing "No bookings yet" despite a booking existing**
- Found by: registered as customer, made a booking, opened dashboard — stats showed Total: 1 but Recent Activity was empty
- Cause: The booking query used a nested PostgREST join `users!provider_id(provider_profiles(trust_score))`. PostgREST could not resolve the inner join without an explicit FK hint, returned `data: null`, silently swallowed by `|| []`
- Fix: Removed the nested `provider_profiles` join from BOOKING_FIELDS. Added `console.error` logging so future query failures surface in the browser console

**3. New provider not appearing in the directory**
- Found by: registered as provider, account existed in users table but did not appear on /providers
- Cause: Two issues — (1) provider registered during the SMTP 500 error period, so the client received an error before running the provider_profiles INSERT; (2) the `get_providers` RPC only returns providers with `verification_status = 'verified'`
- Fix: Created the missing provider_profiles row via SQL. Documented that all new providers must be verified by an admin before appearing publicly

**4. Trust Score trigger failing on first deploy**
- Found by: SQL Editor returned "column avg_rating does not exist"
- Cause: The initial trigger tried to UPDATE `avg_rating` and `review_count` columns in provider_profiles, but these are computed live by RPCs — they are not stored columns
- Fix: Removed those two fields from the UPDATE statement in `recalculate_provider_scores`

**5. Booking modal unusable for providers with no services**
- Found by: attempting to book a provider who had not yet added any services to their profile
- Cause: The service dropdown rendered "No services listed" with an empty string value. Form validation required a non-empty service field, blocking submission entirely
- Fix: When the service list is empty, the dropdown defaults to "General service request" as a selectable value. The customer describes details in the Notes field

---

## 6. Analysis of Results

All ten functional requirements and seven non-functional requirements were implemented and verified. The platform is live and handles the complete service marketplace lifecycle end-to-end.

### Deviations from the Original Proposal

**Trust Score weights revised.** The original proposal allocated 10% of the score to verification status — a one-time binary signal. During implementation this was judged to over-reward a single admin action relative to ongoing provider performance. The weight was redistributed to completed bookings (30%) and profile completeness (20%), making the score more responsive to real behaviour.

**Backend architecture changed from Node/Express + Neon to Supabase.** The original proposal specified Node.js with a Neon PostgreSQL database. Managing authentication, JWT sessions, and access control manually added significant complexity without adding value at this scale. Supabase provides the same PostgreSQL capabilities with built-in auth and RLS. The switch reduced codebase size and eliminated an entire deployment service.

### Additions Beyond Original Scope

- **WhatsApp integration** — providers are contactable via WhatsApp from their profile and from the customer's booking card, reflecting the dominant communication channel for small businesses in Rwanda
- **Email notification pipeline** — providers receive an email when a customer books them, via a Supabase Edge Function triggered by a Database Webhook
- **Customer booking cancellation** — the original flow had no way for a customer to withdraw a request

### Limitations

- **Email delivery to any inbox requires a verified domain.** The platform currently uses Resend's test sender address, which can only deliver to the account owner's own inbox. Full delivery to any provider email requires a verified custom domain configured in Resend.
- **No real-time notifications.** When a provider accepts a booking, the customer's dashboard does not update until they refresh the page. Supabase Realtime subscriptions would be the natural next step.
- **No payment processing.** The platform handles booking coordination but not payment. Mobile Money integration (MTN or Airtel Rwanda) was noted as out of scope for this version.

---

## 7. Deployment Plan and Execution

### Frontend — Vercel

1. GitHub repository connected to Vercel; `frontend/` set as the root directory
2. Build command: `npm run build` — output: `dist/`
3. Environment variables set in Vercel dashboard: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Every push to `main` triggers an automatic redeploy
5. **Verified:** https://inzira-works.vercel.app is publicly accessible

### Database and Auth — Supabase Cloud

1. Supabase project created (eu-west-1 region, free tier)
2. Schema applied and seed data inserted via SQL Editor
3. Trust Score triggers deployed: `supabase/trust_score_triggers.sql` run in SQL Editor
4. Account deletion RPC deployed: `supabase/delete_account_rpc.sql` run in SQL Editor
5. RLS policies enabled on all seven core tables
6. **Verified:** all tables present; triggers fire correctly; auth flows working

### Email Notifications — Edge Functions + Resend

1. `notify-booking` Edge Function deployed via Supabase Dashboard
2. `RESEND_API_KEY` stored as an Edge Function secret
3. Database Webhook created: table `bookings`, event `INSERT`, target `notify-booking`
4. **Verified:** Edge Function logs show successful boot; invocation confirmed on new booking INSERT

### Deployment Summary

| Service | Platform | Status |
|---|---|---|
| Frontend | Vercel | Live |
| Database + Auth | Supabase Cloud | Live |
| Edge Function | Supabase Edge | Deployed |
| Email | Resend API | Active |

---

## 8. Conclusion

Inzira Works has been fully implemented, deployed, and verified. All requirements from the approved proposal are met. The system handles service discovery, booking, communication, completion, and review — with automatic Trust Score updates and email notifications running in the background without any manual intervention.

The most instructive challenge during development was a silent query failure caused by a nested PostgREST join. The failure produced no visible error — only missing data — and required carefully comparing working and non-working queries to diagnose. This reinforced the importance of logging all query errors rather than silently falling back to empty arrays.

The platform is live and accessible for evaluation at **https://inzira-works.vercel.app**.
