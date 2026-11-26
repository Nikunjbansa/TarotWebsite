# Akansha.Predicts — Astrology, Tarot Reading, Spiritual Guidance & Energy Healing

A full-stack Astrology, Tarot Reading, Spiritual Guidance, and Energy Healing web application for **Akansha.Predicts** (founded by **Akansha Bansal**), built with React, TypeScript, Tailwind CSS, Express, and Node's native SQLite (`node:sqlite`).

## Key Capabilities

- **Luxury Spiritual Brand Experience**: Soft ivory, lavender, dusty rose, and deep plum editorial aesthetic combining `Cormorant Garamond`, `Playfair Display`, and `Plus Jakarta Sans`.
- **10 Seeded Sacred Services**:
  - `Akashik Tarot Reading`, `Tarot Reading`, `Astrology`, `Rituals`, `Shiv–Shakti Healing`, `Maa Tara Healing`, `Lama Fera Healing`, `M.E.V Healing`, `Mahakali Healing`, `Hoomkar with Halaum`
- **Direct WhatsApp Service Booking**:
  - Browse services with names, descriptions, durations, and prices
  - Click **Book Now** on any service card (or inside its details modal) to open WhatsApp directly with a pre-filled booking message containing **Akansha.Predicts**, the selected service name, and the service price
  - No multi-step booking forms, date/time pickers, or client login barriers
- **Separate Admin Portal (`/admin/login`, `/admin`)**:
  - Dedicated role-protected Admin authentication
  - Dashboard KPIs, upcoming schedule, and modality demand breakdown
  - Full service catalog CRUD (create, edit prices/descriptions/categories/benefits, toggle visibility, delete)
  - Configurable **Akansha.Predicts** brand settings & WhatsApp Business Number

## Important Operational Design

- **No payment gateways** (no Razorpay/Stripe/online checkout).
- **No Google Meet integration** on the website.
- **Manual WhatsApp Coordination**: Booking confirmations, payment discussions/transfers, and private Google Meet links are handled manually by **Akansha Bansal** through WhatsApp after the client manually sends their pre-filled message.

## Getting Started

1. Copy `.env.example` to `.env` if you wish to customize port, JWT secret, or WhatsApp number.
2. Install dependencies:
   ```bash
   npm install
   npm --prefix client install
   ```
3. Run development servers (Express API on `:4000` + Vite client on `:5173`):
   ```bash
   npm run dev
   ```
4. Build & run in production mode:
   ```bash
   npm run build
   npm start
   ```
5. Run automated backend integration tests:
   ```bash
   npm test
   ```

## Default Seeded Admin Account (Local Setup)

- **Admin Portal (`/admin/login`)**: `admin@akanshapredicts.com` / `ChandraAdmin@2026`

