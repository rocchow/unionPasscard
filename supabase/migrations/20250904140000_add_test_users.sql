-- Add test users for permissions system testing
-- Note: These are mock auth users for development/testing only
-- In production, users would be created through Supabase Auth

-- Clean up any existing test users first
DELETE FROM users WHERE email IN ('john.staff@sgv.com', 'jane.admin@sgv.com', 'alice.customer@email.com', 'bob.staff@metro.com', 'mike.manager@urban.com');
DELETE FROM auth.users WHERE email IN ('john.staff@sgv.com', 'jane.admin@sgv.com', 'alice.customer@email.com', 'bob.staff@metro.com', 'mike.manager@urban.com');

-- Create test users with proper auth integration
DO $$
DECLARE
    user_id_1 uuid := gen_random_uuid();
    user_id_2 uuid := gen_random_uuid();
    user_id_3 uuid := gen_random_uuid();
    user_id_4 uuid := gen_random_uuid();
    user_id_5 uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users (simplified for testing)
    INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
    VALUES 
        (user_id_1, 'john.staff@sgv.com', now(), now(), now()),
        (user_id_2, 'jane.admin@sgv.com', now(), now(), now()),
        (user_id_3, 'alice.customer@email.com', now(), now(), now()),
        (user_id_4, 'bob.staff@metro.com', now(), now(), now()),
        (user_id_5, 'mike.manager@urban.com', now(), now(), now());

    -- Then insert into public.users
    INSERT INTO users (id, email, phone, full_name, role) 
    VALUES 
        (user_id_1, 'john.staff@sgv.com', '+16471234567', 'John Smith', 'staff'),
        (user_id_2, 'jane.admin@sgv.com', '+16471234568', 'Jane Doe', 'company_admin'),
        (user_id_3, 'alice.customer@email.com', '+16471234570', 'Alice Johnson', 'customer'),
        (user_id_4, 'bob.staff@metro.com', '+16471234569', 'Bob Wilson', 'staff'),
        (user_id_5, 'mike.manager@urban.com', '+16471234571', 'Mike Chen', 'company_admin');
END $$;
