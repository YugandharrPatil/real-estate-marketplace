import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!);

async function check() {
  const { count: visitsCount, error: vError } = await supabase.from("re_visits").select("*", { count: "exact", head: true });
  const { count: inqCount, error: iError } = await supabase.from("re_inquiries").select("*", { count: "exact", head: true });
  console.log("Visits count:", visitsCount, "Error:", vError);
  console.log("Inquiries count:", inqCount, "Error:", iError);
}
check();
