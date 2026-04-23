export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { PropertiesClient } from "./properties-client";

export default async function AdminPropertiesPage() {
  const { data: allProperties } = await supabase
    .from(TABLE_NAMES.properties)
    .select("*")
    .order("created_at", { ascending: false });

  const items = allProperties ?? [];

  return <PropertiesClient initialProperties={items} />;
}
