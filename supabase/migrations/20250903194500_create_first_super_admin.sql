-- Create first super admin user
-- Replace 'YOUR_PHONE_NUMBER' with your actual phone number

-- First, let's see what users exist
-- You can run: SELECT id, phone, email, role FROM public.users;

-- Update a specific user to be super admin
-- Replace '+16479659665' with your actual phone number
UPDATE public.users 
SET role = 'super_admin'
WHERE phone = '+16479659665';

-- Alternative: Update by email if you used email login
-- UPDATE public.users 
-- SET role = 'super_admin'
-- WHERE email = 'your-email@example.com';

-- Alternative: If you know the user ID
-- UPDATE public.users 
-- SET role = 'super_admin'
-- WHERE id = 'your-user-id-here';

-- Verify the update
SELECT id, phone, email, role, created_at 
FROM public.users 
WHERE role = 'super_admin';
