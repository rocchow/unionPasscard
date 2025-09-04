-- Add SGV company and its venues for demo purposes

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create venue_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE venue_type AS ENUM ('ktv', 'restaurant', 'basketball_court', 'badminton_court', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create venues table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.venues (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type venue_type NOT NULL,
  address text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert SGV company
INSERT INTO public.companies (id, name, description, created_at, updated_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'SGV', 'SGV Entertainment Group - Premium hospitality and entertainment venues', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert SGV venues
INSERT INTO public.venues (company_id, name, type, address, phone, created_at, updated_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'ET', 'ktv', '123 Entertainment District, Toronto, ON', '+1 (416) 555-0101', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Gfunk', 'ktv', '456 Nightlife Ave, Toronto, ON', '+1 (416) 555-0102', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Party K', 'ktv', '789 Party Street, Toronto, ON', '+1 (416) 555-0103', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Long Feng Hotpot', 'restaurant', '321 Culinary Row, Toronto, ON', '+1 (416) 555-0104', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Playbase', 'other', '654 Gaming Plaza, Toronto, ON', '+1 (416) 555-0105', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'SOS', 'other', '987 Entertainment Hub, Toronto, ON', '+1 (416) 555-0106', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Wave', 'other', '147 Waterfront Blvd, Toronto, ON', '+1 (416) 555-0107', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Zui Beer (K town)', 'restaurant', '258 Koreatown Ave, Toronto, ON', '+1 (416) 555-0108', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Zui Beer (North York)', 'restaurant', '369 North York Blvd, North York, ON', '+1 (647) 555-0109', now(), now())
ON CONFLICT DO NOTHING;
