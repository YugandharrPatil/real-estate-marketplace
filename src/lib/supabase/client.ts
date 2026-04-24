import type { Database } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client (used in browser components)
export const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!);
