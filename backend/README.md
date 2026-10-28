# 🏛️ AWAHAAN Backend - Supabase Database & Storage Setup

This folder contains the complete SQL database migration script and instructions for **AWAHAAN Annual Sports Festival (GCEK)**.

---

## 📋 Step-by-Step Supabase Setup

### 1. Run the Database SQL Script

1. Open your [Supabase Dashboard](https://app.supabase.com) and select your project (`ioyvfigbxyoexyqcaxsj`).
2. In the left navigation sidebar, click **SQL Editor**.
3. Click **New Query**.
4. Open [`backend/schema.sql`](file:///c:/Users/skcsa/OneDrive/Desktop/aahwan/backend/schema.sql), copy the entire SQL script, and paste it into the editor.
5. Click **Run** (or press `Ctrl + Enter`).

This script creates:
- `site_settings` (Global config, festival name, year, stats counters, equipment inventory & logs)
- `sports` (Sports list, categories, rules, images)
- `dignitaries` (Chief guests, patrons, coordinators)
- `schedule` (Daily events & fixtures)
- `leaderboard` (Branch standings & medal tallies for CSE, EE, ME, CE)
- `gallery` (Photo highlights)
- `registrations` (Student event registrations)
- `equipment` (Sports gear inventory, quantities, locations, and condition)
- `equipment_logs` (Live equipment issue and return records with borrower roll no, phone, and return status)
- Public RLS read/write permissions & Supabase Realtime subscriptions.

---

### 2. Run Equipment & Issue/Return Setup (Stock Inventory)

If you are using the Equipment Stock Inventory & Issue/Return log features:
1. In Supabase **SQL Editor**, open [`backend/equipment_setup.sql`](file:///d:/website/awahaan/aahwan/backend/equipment_setup.sql).
2. Copy and paste the script into the query box.
3. Click **Run**.

This script sets up:
- `public.equipment` table with `total_qty`, `condition`, `location`, `notes`
- `public.equipment_logs` table with `borrower_name`, `roll_no`, `issue_date`, `return_date`, `status`
- Row Level Security (RLS) policies allowing frontend reads and writes
- Realtime publication `ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment, public.equipment_logs;`
- Initial seed data matching the sports festival inventory.

---

### 3. Create the Storage Bucket (for Image Uploads)

1. In Supabase Dashboard, click **Storage** in the left sidebar.
2. Click **New Bucket**.
3. Set **Bucket Name:** `AWAHAAN`
4. Toggle **Public Bucket** to **ON** (so images are viewable by everyone).
5. Click **Save**.

---

## 🚀 Connecting to the Frontend

Ensure your Netlify site has the environment variable set under **Site Configuration -> Environment Variables**:

- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** *(Your Supabase Anon API Key from Supabase Dashboard -> Project Settings -> API)*
