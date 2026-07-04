export const dynamic = "force-dynamic";

import { db } from "@/db";
import { reProperties } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PropertiesClient } from "./properties-client";

export default async function AdminPropertiesPage() {
  const allProperties = await db.select()
    .from(reProperties)
    .orderBy(desc(reProperties.created_at));

  const items = allProperties ?? [];

  return <PropertiesClient initialProperties={items} />;
}
