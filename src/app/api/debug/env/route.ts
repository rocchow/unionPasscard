import { NextResponse } from 'next/server'

export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    ALLOW_DEMO_ROLE_UPGRADE: process.env.ALLOW_DEMO_ROLE_UPGRADE,
    ALLOW_USER_MANAGEMENT: process.env.ALLOW_USER_MANAGEMENT,
    HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    HAS_SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
  }

  return NextResponse.json({
    environment: env,
    message: 'Environment check for debugging',
    recommendations: {
      development: env.NODE_ENV === 'development' ? '✅ Development mode' : '❌ Not in development mode',
      roleUpgrade: env.ALLOW_DEMO_ROLE_UPGRADE === 'true' ? '✅ Role upgrade enabled' : '❌ Role upgrade disabled - set ALLOW_DEMO_ROLE_UPGRADE=true',
      userManagement: env.ALLOW_USER_MANAGEMENT === 'true' ? '✅ User management enabled' : '❌ User management disabled - set ALLOW_USER_MANAGEMENT=true',
      supabase: env.HAS_SUPABASE_URL && env.HAS_SUPABASE_KEY ? '✅ Supabase configured' : '❌ Supabase not configured'
    }
  })
}
