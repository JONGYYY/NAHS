import { createBrowserClient } from "@supabase/ssr";

// Supabase's newer publishable key (sb_publishable_...) or the legacy anon key.
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_KEY);
}
