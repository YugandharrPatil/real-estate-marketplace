export const dynamic = "force-dynamic";

import { PropertiesGrid } from "@/components/properties-grid";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { getAllProperties } from "@/lib/data/properties";
import { supabase } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export default async function PropertiesPage() {
	const { userId } = await auth();

	// Fetch all properties
	const items = await getAllProperties();

	// Get saved property IDs for logged-in user
	let savedIds: string[] = [];
	if (userId) {
		const { data: saved } = await supabase
			.from(TABLE_NAMES.savedProperties)
			.select("property_id")
			.eq("user_id", userId);
		savedIds = (saved ?? []).map((s) => s.property_id);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Properties</h1>
				<p className="text-muted-foreground">Find your dream home with instant filtering</p>
			</div>

			<PropertiesGrid properties={items} savedIds={savedIds} />
		</div>
	);
}
