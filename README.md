Inzira Works


A web platform that helps skilled women in Rwanda — tailors, hairdressers, handcraft producers, TVET graduates, and cooperative members — showcase their services, build professional visibility, and connect with customers.



BSc Capstone Project · Kigali, Rwanda
Author: GAKUBA Lassy Orlene
GitHub Repository: [https://github.com/LassyGAKUBA/Inzira-works]
Demo video: [https://drive.google.com/drive/folders/1ZBIf25mPVLGW8tzZXzBKacZYYzgHwckY]


1. Description

Many skilled women in Kigali do excellent work but lack the digital visibility to reach new customers and prove their credibility. Inzira Works addresses this by giving each provider a professional profile, a portfolio, and a transparent Trust Score, while giving customers a trustworthy way to search, compare, and book services.

The platform has three user roles:


Customer — searches for providers, views profiles and trust scores, books services, and leaves reviews.
Service Provider — creates a profile, uploads portfolio work, manages bookings, and grows a Trust Score.
Admin — verifies providers, moderates reviews, manages service categories, and views platform analytics.


A signature feature is the Trust Score — a transparent, data-driven credibility rating (0–100) calculated from customer ratings (40%), completed jobs (25%), profile completeness (15%), response rate (10%), and verification status (10%).


2. Tech Stack

LayerTechnologyFrontendReact.js, Tailwind CSS, React RouterBackendNode.js, Express.jsDatabasePostgreSQL (hosted on Neon)AuthenticationJWT (JSON Web Tokens) + bcrypt password hashingValidationZodAPI StyleRESTDev EnvironmentGitHub Codespaces


3. Current Status (Preliminary Version)

This is the initial working version for the capstone milestone. What works end-to-end today:


* Responsive public pages: Landing, About, Contact
* User registration (customer & provider) with role selection
* Login / logout with JWT authentication
* Session persistence (stays logged in across refresh)
*Role-based, protected dashboards (customer vs provider)
* Live user identity on dashboards (greeting, avatar, profile)
* PostgreSQL database deployed on Neon with full schema + seed data


Planned for later iterations: live dashboard data (bookings, reviews, stats wired to the database), provider search API, booking workflow, reviews, admin dashboard, and portfolio image uploads.


4. Project Structure

inzira-works/
├── frontend/                  # React + Vite + Tailwind
│   └── src/
│       ├── api/               # API client + auth requests
│       ├── context/           # AuthContext (login state)
│       ├── components/shared/  # Navbar, ProtectedRoute, etc.
│       ├── pages/
│       │   ├── public/        # Home, About, Contact, Directory
│       │   ├── auth/          # Login, Signup, RoleSelect
│       │   ├── customer/      # Customer dashboard
│       │   └── provider/      # Provider dashboard
│       └── i18n/              # Language context (EN/RW/SW)
│
└── backend/                   # Node + Express REST API
    └── src/
        ├── config/            # env + database pool
        ├── db/                # schema.sql, seed data, runners
        ├── routes/            # API route definitions
        ├── controllers/       # request/response handlers
        ├── services/          # business logic
        ├── repositories/      # SQL queries
        ├── middleware/        # auth, role, validation
        ├── validators/        # Zod schemas
        └── utils/             # JWT, password hashing, errors


5. Setup & Installation

Prerequisites


Node.js v18+ and npm
A PostgreSQL database (this project uses a free Neon cloud database)


Step 1 — Clone the repository

bashgit clone https://github.com/your-username/inzira-works.git
cd inzira-works

Step 2 — Backend setup

bashcd backend
npm install
cp env.example .env

Open .env and set:


DATABASE_URL — your Neon connection string (append ?sslmode=require)
JWT_SECRET — any long random string
CLIENT_ORIGIN — your frontend URL (e.g. http://localhost:5173)


Then create the tables and load demo data:

bashnpm run db:schema     # creates all tables
npm run db:seed       # loads demo users, providers, bookings
npm run dev           # starts API on http://localhost:5000

Verify it's running by visiting http://localhost:5000/api/health — you should see {"status":"ok"}.

Step 3 — Frontend setup

In a new terminal:

bashcd frontend
npm install

Create a .env file in the frontend/ root:

VITE_API_URL=http://localhost:5000

Then start it:

bashnpm run dev           # starts on http://localhost:5173

Demo accounts (seeded)

All seeded accounts use the password Password123:

EmailRoleclarisse@example.comProvider (Trust Score 94)jean@example.comCustomeradmin@inzira.worksAdmin


Note for GitHub Codespaces: the backend (port 5000) and frontend (port 5173) get forwarded URLs ending in .app.github.dev. Set both ports to Public in the PORTS tab, then put the forwarded backend URL in the frontend's VITE_API_URL, and the forwarded frontend URL in the backend's CLIENT_ORIGIN.




6. API Endpoints (current)

MethodEndpointDescriptionAuthGET/api/healthServer health check—POST/api/auth/registerRegister a customer or provider—POST/api/auth/loginLog in, returns JWT—GET/api/auth/meGet the current logged-in userJWT

Planned: /api/providers, /api/bookings, /api/reviews, /api/admin/*.


7. Database Schema

The PostgreSQL schema models the full platform domain. Core tables and relationships:


users — all accounts (customer / provider / admin)
provider_profiles — 1:1 with provider users (headline, bio, trust score, verification)
categories + provider_categories — service categories (many-to-many)
provider_specialties — skill tags per provider
services — services a provider offers
portfolio_items — provider work samples
bookings — customer ↔ provider bookings (status: pending → confirmed → completed)
reviews — one review per completed booking (1–5 rating)
saved_providers — customer bookmarks
verification_requests — provider verification, reviewed by admin


users ──1:1── provider_profiles ──1:M── services
  │                  │  ├──1:M── portfolio_items
  │                  │  ├──1:M── provider_specialties
  │                  │  └──M:M── categories
  ├──1:M── bookings ──1:1── reviews
  └──1:M── saved_providers

The full schema lives in backend/src/db/schema.sql.


8. Deployment Plan

The application is currently developed and demonstrated in GitHub Codespaces. The production deployment plan is as follows:

Frontend → Vercel


Connect the GitHub repo to Vercel and select the frontend/ directory.
Build command npm run build, output dist/.
Set the environment variable VITE_API_URL to the deployed backend URL.
Vercel provides automatic HTTPS, a global CDN, and redeploys on every push.


Backend → Render (Web Service)


Create a Render Web Service from the backend/ directory.
Build command npm install, start command npm start.
Configure environment variables (DATABASE_URL, JWT_SECRET, CLIENT_ORIGIN = the Vercel URL).
Render provides HTTPS and health-check-based restarts.


Database → Neon (already cloud-hosted)


The PostgreSQL database already runs on Neon's serverless platform.
For production, use a dedicated Neon project/branch, run schema.sql once, and keep credentials only in the backend host's environment variables.


CI/CD & configuration


git push to the main branch triggers automatic redeploys on both Vercel and Render.
Secrets are never committed (.env is gitignored); each host stores its own environment variables.
After deploy: set the backend's CLIENT_ORIGIN to the Vercel domain so CORS allows the frontend.


Why this stack

Vercel, Render, and Neon all offer free tiers suitable for a pilot, require no server administration, and provide HTTPS out of the box — letting the project move from pilot to a publicly accessible URL with minimal cost and operational overhead.