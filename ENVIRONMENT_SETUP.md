# Environment Setup

## Required Environment Variables

The application requires Supabase environment variables to function properly.

### Step 1: Create .env.local file

Create a file named `.env.local` in the root directory with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 2: Get your Supabase credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys > anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Example values

Your `.env.local` should look like this:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Restart the development server

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Database Setup

Make sure your Supabase database has the required tables. You can run the migration files in the `supabase/migrations/` directory or use the `supabase-schema.sql` file to set up your database schema.
