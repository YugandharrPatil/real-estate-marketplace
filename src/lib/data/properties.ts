import { db } from "@/db";
import { reProperties } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getAllProperties() {
	try {
		const allProperties = await db.select()
			.from(reProperties)
			.orderBy(desc(reProperties.created_at));

		return allProperties ?? [];
	} catch (error) {
		console.error("Error fetching properties:", error);
		return [];
	}
}
