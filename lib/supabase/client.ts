import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
      "https://koqztlrfxeiolpwyxgum.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvcXp0bHJmeGVpb2xwd3l4Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjMzNjYsImV4cCI6MjA5MDczOTM2Nn0.yjWiPieTaO6sOmTWFSI81DYEds_jKvv2Wnvvr_n4WSI"
  )
}
