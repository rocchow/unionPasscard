# UnionPasscard Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Quick Start

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Copy the example environment file and configure your credentials:
   ```bash
   cp env.local.example .env.local
   ```
   
   Then edit `.env.local` with your actual values. At minimum, you need:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Twilio Configuration (for SMS OTP)
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token-here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Set up Supabase Database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL schema from `supabase-schema.sql` to create all necessary tables and policies

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Wait for the project to be fully initialized

### 2. Get Your Credentials
1. Go to Project Settings > API
2. Copy your Project URL and anon/public key
3. Add them to your `.env.local` file

### 3. Set up the Database Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the query to create all tables, types, and policies

### 4. Enable Authentication
1. Go to Authentication > Settings
2. Enable Phone and Email authentication
3. Configure your auth providers as needed

## Twilio Setup (for SMS OTP)

### 1. Create a Twilio Account
1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Verify your phone number

### 2. Get Your Credentials
1. Go to the Twilio Console Dashboard
2. Find your Account SID and Auth Token
3. Go to Phone Numbers > Manage > Active numbers
4. Copy your Twilio phone number

### 3. Optional: Set up Twilio Verify (Recommended)
1. Go to Verify > Services in the Twilio Console
2. Create a new Verify Service
3. Copy the Service SID
4. Add it to your `.env.local` as `TWILIO_VERIFY_SERVICE_SID`

### 4. Configure Supabase for Twilio
1. In your Supabase project, go to Authentication > Settings
2. Under "Phone Auth", enable phone authentication
3. Configure the phone provider settings if needed

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── memberships/       # Membership management
│   ├── transactions/      # Transaction history
│   ├── venues/           # Venue listings and details
│   ├── qr-code/          # QR code display
│   └── staff/            # Staff portal
├── components/           # Reusable React components
└── lib/                 # Utility functions and configurations
    ├── auth.ts          # Authentication helpers
    ├── supabase.ts      # Supabase client configuration
    ├── utils.ts         # General utilities
    └── database.types.ts # TypeScript types for database
```

## Key Features

### For Customers
- **Authentication**: Phone/Email OTP login
- **Memberships**: Purchase and manage memberships across multiple companies
- **QR Payments**: Generate QR codes for seamless payments at venues
- **Transaction History**: Track all purchases and usage
- **Venue Discovery**: Find and explore participating venues

### For Staff
- **QR Scanner**: Scan customer QR codes to process payments
- **Transaction Management**: View and manage venue transactions
- **Customer Lookup**: Access customer information and balances

### For Admins (Future Implementation)
- **Company Management**: Manage venues and staff
- **Analytics**: View business insights and reports
- **User Management**: Manage customer accounts and permissions

## Database Schema Overview

The application uses the following main tables:

- **users**: User profiles and authentication data
- **companies**: Business entities (KTV, restaurants, sports venues, etc.)
- **venues**: Individual locations under companies
- **memberships**: User membership cards for different companies
- **transactions**: All financial transactions (purchases, usage, refunds)
- **user_venues**: Staff access permissions for venues
- **user_companies**: Company admin permissions

## Environment Variables Reference

### Required
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### Recommended for Full Functionality
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID (for SMS OTP)
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

### Optional
- `SUPABASE_SERVICE_ROLE_KEY`: For server-side operations
- `TWILIO_VERIFY_SERVICE_SID`: For Twilio Verify service (recommended)
- `NEXT_PUBLIC_APP_URL`: Your app's public URL
- `JWT_SECRET`: For custom JWT operations
- `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY`: For payment processing
- `SENDGRID_API_KEY`: For email notifications
- `GOOGLE_ANALYTICS_ID`: For analytics integration

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js applications:
- Netlify
- AWS Amplify
- Railway
- Render

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify your environment variables are correct
   - Check that your Supabase project is active
   - Ensure the database schema has been applied

2. **Authentication Issues**
   - Verify phone/email auth is enabled in Supabase
   - Check that RLS policies are properly set up
   - Ensure the users table exists

3. **Build Errors**
   - Run `npm run lint` to check for code issues
   - Verify all dependencies are installed
   - Check that TypeScript types are correct

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Review the Supabase logs in your project dashboard
3. Verify your database schema matches the provided SQL file

## Next Steps

After basic setup, consider:
1. Customizing the branding and colors
2. Adding real payment processing integration
3. Implementing push notifications
4. Adding analytics and monitoring
5. Setting up automated backups

## Security Notes

- Never commit `.env.local` files to version control
- Use Row Level Security (RLS) policies in production
- Regularly rotate API keys and secrets
- Implement proper error handling for production use
