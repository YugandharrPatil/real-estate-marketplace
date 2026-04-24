import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";

export async function getAllProperties() {
	const { data: allProperties, error } = await supabase
		.from(TABLE_NAMES.properties)
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching properties:", error);
		return [];
	}

	return allProperties ?? [];
}
