-- Create the custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE staff_role AS ENUM ('staff', 'manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE company_role AS ENUM ('admin', 'manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_venues table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_venues (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  role staff_role not null,
  created_at timestamp with time zone default now(),
  unique(user_id, venue_id)
);

-- Create user_companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  role company_role not null,
  created_at timestamp with time zone default now(),
  unique(user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.user_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Add company_id and venue_id to users table for primary association (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_id') THEN
        ALTER TABLE public.users ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'venue_id') THEN
        ALTER TABLE public.users ADD COLUMN venue_id UUID REFERENCES public.venues(id);
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_venue_id ON public.users(venue_id);
CREATE INDEX IF NOT EXISTS idx_user_venues_user_id ON public.user_venues(user_id);
CREATE INDEX IF NOT EXISTS idx_user_venues_venue_id ON public.user_venues(venue_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON public.user_companies(company_id);

-- Create a view for user permissions that includes all associations
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
    u.id as user_id,
    u.role as primary_role,
    u.company_id as primary_company_id,
    u.venue_id as primary_venue_id,
    
    -- Company associations
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'company_id', uc.company_id,
                'role', uc.role,
                'company_name', c.name
            )
        ) FILTER (WHERE uc.company_id IS NOT NULL),
        '[]'
    ) as company_associations,
    
    -- Venue associations  
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'venue_id', uv.venue_id,
                'role', uv.role,
                'venue_name', v.name,
                'company_id', v.company_id,
                'company_name', vc.name
            )
        ) FILTER (WHERE uv.venue_id IS NOT NULL),
        '[]'
    ) as venue_associations

FROM users u
LEFT JOIN user_companies uc ON u.id = uc.user_id
LEFT JOIN companies c ON uc.company_id = c.id
LEFT JOIN user_venues uv ON u.id = uv.user_id
LEFT JOIN venues v ON uv.venue_id = v.id
LEFT JOIN companies vc ON v.company_id = vc.id
GROUP BY u.id, u.role, u.company_id, u.venue_id;

-- Create helper functions for access control
CREATE OR REPLACE FUNCTION user_can_access_company(user_id UUID, company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admin can access everything
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id AND role = 'super_admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Check primary company association
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id AND company_id = company_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Check user_companies table
    IF EXISTS (SELECT 1 FROM user_companies WHERE user_id = user_id AND company_id = company_id) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_can_access_venue(user_id UUID, venue_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admin can access everything
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id AND role = 'super_admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Check primary venue association
    IF EXISTS (SELECT 1 FROM users WHERE id = user_id AND venue_id = venue_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Check user_venues table
    IF EXISTS (SELECT 1 FROM user_venues WHERE user_id = user_id AND venue_id = venue_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has company access to the venue's company
    IF EXISTS (
        SELECT 1 FROM venues v 
        WHERE v.id = venue_id 
        AND user_can_access_company(user_id, v.company_id)
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users to have proper associations (example data)
-- This should be customized based on your actual data needs
UPDATE users SET company_id = (SELECT id FROM companies WHERE name = 'SGV Entertainment' LIMIT 1) 
WHERE role IN ('company_admin', 'staff') AND company_id IS NULL;
