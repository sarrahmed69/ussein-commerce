import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = "https://koqztlrfxeiolpwyxgum.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvcXp0bHJmeGVpb2xwd3l4Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjMzNjYsImV4cCI6MjA5MDczOTM2Nn0.yjWiPieTaO6sOmTWFSI81DYEds_jKvv2Wnvvr_n4WSI"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  )
}