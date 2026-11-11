# Gallant Line Haul Corp — Enterprise Logistics & Dispatch Platform

A modern, production-ready web application for **Gallant Line Haul Corp**, a premier Canadian freight brokerage and C-TPAT & CARB certified bonded carrier operating across North America.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Three.js**, **Express**, and **Supabase**.

---

## 🚀 Key Features

### 1. Interactive Three.js 3D Semi-Truck Visualizer
- **Realistic PBR 3D Vehicle**: Procedural Freightliner Cascadia-style Class 8 tractor with a 53ft dry-van / refrigerated trailer featuring official Gallant Line Haul Corp livery.
- **Physical Materials & Lighting**: Metallic cab paint, high-reflection chrome package (grille, bull bumper, dual exhaust stacks, fuel tanks, alloy rims), and tinted aerodynamic glass.
- **Dynamic Physics & Motion**: Real-time wheel rotation, animated highway lane divider dashes, and subtle suspension vibration.
- **Interactive Mouse Tilt**: Responsive cursor parallax with spring damping.
- **Input Focus Reactivity**: When users type into email or password fields, the truck's LED projector headlights flare into high-beam mode.

### 2. Dual Theme Engine (Dark & Light Mode)
- **Instant Toggle**: Integrated Sun/Moon switch in the top navigation bar and all portal headers.
- **Deep Navy-Slate Dark Theme**: High-contrast, fatigue-free dark palette (`#090d16` canvas, `#0f172a` surfaces, `#1e293b` borders) with glowing teal accents.
- **Persistence**: Remembers user preference across sessions via `localStorage` with automatic system preference detection.

### 3. Dedicated Self-Service Portals
- **Client & Shipper Portal (`/login/client` → `/portal/client`)**:
  - Live GPS freight tracking with a 4-stage interactive milestone tracker (Dispatched → In Transit → Customs / Border Inspection → Delivered).
  - Instant quote request history and rate confirmations.
  - Header **Notification Center** bell popover with unread count badges and status filtering.
- **Driver Portal (`/login/careers` → `/portal/driver`)**:
  - Active haul assignments, assigned tractor/trailer numbers, and delivery ETAs.
  - Driver-side live status updater to progress runs to the next milestone in real time.
  - Driver qualification file compliance (CDL-A, FAST card, Medical card).
  - 24/7 direct safety dispatch hotline link.
- **Master Admin Command Center (`/login/admin` → `/portal/admin`)**:
  - Full CRUD operations for drivers and shippers with instant deletion and addition.
  - Dispatch assignment engine: assign loads to specific drivers and shippers.
  - Live status updater syncing across client and driver dashboards.
  - Broadcast notification engine to send global alerts or targeted notifications.

### 4. Page Transitions
- Top glowing teal progress bar (`from-teal-500 via-teal-400 to-emerald-400`) during route navigation.
- Smooth page entrance fade transitions (`section-fade`).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Three.js, Lucide Icons
- **Backend / Proxy**: Express, Node.js (`server.ts`), Nodemailer for rate confirmation emails
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security and Auth)
- **Deployment**: Vercel (Frontend & Serverless API) + Supabase (Database & Auth)

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# Clone or copy repository
git clone <repository-url>
cd gallant-line-haul

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
# Application Port
PORT=3000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional Email Dispatch (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@gallant-corp.com
SMTP_PASS=your-app-password
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🚢 Deploying to Vercel with Supabase

For a complete step-by-step production deployment guide, refer to **[PUBLISH.md](./PUBLISH.md)**.
For the complete PostgreSQL database schema, refer to **[supabase-schema.sql](./supabase-schema.sql)**.

---

## 🏢 Company Credentials
- **Operating Authority**: Canadian Bonded Carrier & Freight Brokerage
- **Certifications**: C-TPAT Security Certified, CARB California Compliant, FAST Approved
- **Master Admin Login**: `info@gallant-corp.com`
- **Headquarters**: Toronto, ON, Canada | Cross-Border North America
