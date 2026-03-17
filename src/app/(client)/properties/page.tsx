export const dynamic = "force-dynamic";

import { PropertiesGrid } from "@/components/properties-grid";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export default async function PropertiesPage({
	searchParams,
}: {
	searchParams: Promise<{
		city?: string;
		type?: string;
		minPrice?: string;
		maxPrice?: string;
		bedrooms?: string;
		search?: string;
	}>;
}) {
	const params = await searchParams;
	const { userId } = await auth();

	let query = supabase.from(TABLE_NAMES.properties).select("*").order("created_at", { ascending: false });

	if (params.city) query = query.ilike("city", `%${params.city}%`);
	if (params.type) query = query.eq("property_type", params.type);
	if (params.minPrice) query = query.gte("price", params.minPrice);
	if (params.maxPrice) query = query.lte("price", params.maxPrice);
	if (params.bedrooms) query = query.gte("bedrooms", parseInt(params.bedrooms));
	if (params.search) query = query.ilike("title", `%${params.search}%`);

	const { data: allProperties } = await query;
	const items = allProperties ?? [];

	// Get saved property IDs for logged-in user
	let savedIds: string[] = [];
	if (userId) {
		const { data: saved } = await supabase.from(TABLE_NAMES.savedProperties).select("property_id").eq("user_id", userId);
		savedIds = (saved ?? []).map((s) => s.property_id);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Properties</h1>
				<p className="text-muted-foreground">Browse {items.length} available properties</p>
			</div>

			<PropertiesGrid properties={items} savedIds={savedIds} />
		</div>
	);
}
