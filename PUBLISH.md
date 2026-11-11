# Production Deployment Guide: Vercel & Supabase

This guide provides end-to-end, step-by-step instructions for deploying **Gallant Line Haul Corp** to **Vercel** with a connected **Supabase** database and authentication backend.

---

## 📋 Architecture Overview

- **Hosting & CDN**: [Vercel](https://vercel.com) (Global Edge CDN, automatic HTTPS, SPA rewrites, Git continuous deployment)
- **Database & Authentication**: [Supabase](https://supabase.com) (Managed PostgreSQL, Row Level Security, Auth service, storage)
- **Frontend SPA**: React 19 + Vite 6 + Tailwind CSS v4 + Three.js

---

## 🗄️ Step 1: Set Up Supabase (Database & Auth)

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **"New Project"**.
2. Enter your project details:
   - **Name**: `gallant-line-haul`
   - **Database Password**: Generate a secure password and save it securely.
   - **Region**: Choose a region close to your primary customers (e.g., `East US (North Virginia)` or `Central Canada`).
3. Click **"Create new project"** and wait 1–2 minutes for the database to provision.

### 2. Run the Database Schema
1. In your Supabase Dashboard, open the left sidebar and click **"SQL Editor"**.
2. Click **"+ New Query"**.
3. Open the file **[`supabase-schema.sql`](./supabase-schema.sql)** from this repository.
4. Copy the entire contents of `supabase-schema.sql` and paste them into the Supabase SQL Editor.
5. Click **"Run"** (or press `Cmd/Ctrl + Enter`).
6. Verify that all tables, Row Level Security (RLS) policies, indexes, and triggers were created successfully:
   - `profiles`
   - `driver_accounts`
   - `shipper_accounts`
   - `shipments`
   - `quote_submissions`
   - `portal_notifications`

### 3. Configure Supabase Authentication
1. In the Supabase Dashboard, navigate to **Authentication** → **Providers** → **Email**.
2. Ensure **Email provider** is **Enabled**.
3. *(Recommended for staging/testing)*: Under **"Confirm email"**, you can temporarily turn off **"Confirm email"** if you want clients and drivers to log in immediately upon registration without waiting for confirmation emails.
4. If you want production email verification, configure custom SMTP under **Project Settings** → **Auth** → **SMTP Settings**.

### 4. Retrieve Supabase API Keys
1. In your Supabase Dashboard, click on **Project Settings** (gear icon at the bottom of the left sidebar).
2. Click on **"API"**.
3. Locate and copy the following two values:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **anon / public key** (starts with `ey...`)

---

## 🌐 Step 2: Configure SPA Routing on Vercel (`vercel.json`)

To ensure that deep links (e.g., `/portal/client`, `/portal/driver`, `/admin`, `/quote`) do not trigger `404 Not Found` errors when directly visited or refreshed, a `vercel.json` file is included in the project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This routes all incoming requests to the client-side router (`index.html`).

---

## 🚀 Step 3: Deploy to Vercel

You can deploy using either the **Vercel Web Dashboard** (recommended) or the **Vercel CLI**.

### Method A: Deploy via Vercel Web Dashboard (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Gallant Line Haul enterprise deployment"
   git branch -M main
   git remote add origin https://github.com/your-username/gallant-line-haul.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New..."** → **"Project"**.
4. Import your `gallant-line-haul` repository from GitHub.
5. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Expand the **"Environment Variables"** section and add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Your Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | `ey...` | Your Supabase public `anon` API Key |
   | `PORT` | `3000` | Application port |
7. Click **"Deploy"**.
8. Vercel will build the project, compile the Three.js 3D assets and Tailwind CSS styles, and deploy the application to a high-speed global CDN edge within 60 seconds.

---

### Method B: Deploy via Vercel CLI

If you prefer deploying from your local terminal:

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to your Vercel account:
   ```bash
   vercel login
   ```
3. Link and deploy your project:
   ```bash
   vercel
   ```
4. Follow the interactive terminal prompts:
   - Set up and deploy: **Yes**
   - Which scope: Select your personal or team account
   - Link to existing project: **No**
   - What's your project's name: `gallant-line-haul`
   - In which directory: `./`
5. Set environment variables via CLI:
   ```bash
   vercel env add VITE_SUPABASE_URL production
   # (Paste your Supabase URL when prompted)

   vercel env add VITE_SUPABASE_ANON_KEY production
   # (Paste your Supabase Anon Key when prompted)
   ```
6. Trigger the production deployment:
   ```bash
   vercel --prod
   ```

---

## 🔒 Step 4: Master Admin Access Setup

The Master Admin portal allows dispatchers to manage drivers, approve shippers, assign loads, and broadcast live alerts:

1. In Supabase, create the Master Admin account by either:
   - Registering an account with `info@gallant-corp.com` via the app's sign-up page.
   - Or manually creating a user under **Authentication** → **Users** with email `info@gallant-corp.com`.
2. Once the user is created, execute this query in the Supabase SQL Editor to grant admin privileges:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'info@gallant-corp.com';
   ```
3. You can now access the Master Admin Portal at `/login/admin` or `/admin` using `info@gallant-corp.com`.

---

## 🌐 Step 5: Custom Domain Configuration (Optional)

To connect your custom company domain (e.g., `gallantlinehaul.com`):

1. Go to your project on the Vercel Dashboard.
2. Navigate to **Settings** → **Domains**.
3. Enter your domain (e.g., `www.gallantlinehaul.com` or `gallant-corp.com`) and click **"Add"**.
4. Configure the DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains):
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`
   - **Type**: `A`
   - **Name**: `@`
   - **Value**: `76.76.21.21`
5. Vercel will automatically provision a free SSL/TLS certificate with automatic renewal.

---

## ✅ Step 6: Post-Deployment Verification Checklist

- [ ] **Home Page**: Verify hero section, services, Canadian Bonded Carrier badges, and customer reviews.
- [ ] **3D Truck Visualizer**: Visit `/login/client`, `/login/careers`, and `/admin`. Confirm the realistic Three.js 3D semi-truck renders, wheels rotate, road dashes animate, and mouse movement tilts the scene smoothly.
- [ ] **Dark & Light Mode**: Click the Sun/Moon toggle in the navigation header. Confirm the site transitions cleanly between bright white and deep navy-slate (`#090d16`).
- [ ] **Notification Center**: Click the bell icon in the portal header. Confirm notifications display unread counters and status filters.
- [ ] **Quote Engine**: Submit a test freight quote request on `/quote`. Confirm the submission succeeds and generates a reference code (e.g. `GLH-Q...`).
- [ ] **Live Dispatch Tracking**: Check `/portal/client` and `/portal/driver` to confirm real-time multi-stage status tracking (Dispatched, In Transit, Customs, Delivered).
