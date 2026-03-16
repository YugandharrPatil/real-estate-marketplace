import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (used in API routes and server components)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);
