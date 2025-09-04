-- Add test users for permissions system testing (robust version)
-- Note: These are mock auth users for development/testing only

-- More thorough cleanup - remove any test users that might exist
DO $$
BEGIN
    -- Remove from public.users first (due to foreign key constraint)
    DELETE FROM users WHERE email LIKE '%@sgv.com' OR email LIKE '%@metro.com' OR email LIKE '%@urban.com' OR email = 'alice.customer@email.com';
    
    -- Remove from auth.users  
    DELETE FROM auth.users WHERE email LIKE '%@sgv.com' OR email LIKE '%@metro.com' OR email LIKE '%@urban.com' OR email = 'alice.customer@email.com';
    
    RAISE NOTICE 'Cleaned up all test users';
END $$;

-- Create test users with proper auth integration
DO $$
DECLARE
    user_id_1 uuid;
    user_id_2 uuid;
    user_id_3 uuid;
    user_id_4 uuid;
    user_id_5 uuid;
BEGIN
    -- Generate unique UUIDs
    user_id_1 := gen_random_uuid();
    user_id_2 := gen_random_uuid();
    user_id_3 := gen_random_uuid();
    user_id_4 := gen_random_uuid();
    user_id_5 := gen_random_uuid();
    
    -- Insert into auth.users (simple approach)
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
    
    RAISE NOTICE 'Created test users successfully';
END $$;
