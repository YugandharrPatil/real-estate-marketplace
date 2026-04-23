export const dynamic = "force-dynamic";

import { PropertyDetail } from "@/components/property-detail";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { userId } = await auth();

	const { data: property, error } = await supabase.from(TABLE_NAMES.properties).select("*").eq("id", id).single();

	if (error || !property) notFound();

	let isSaved = false;
	if (userId) {
		const { data: saved } = await supabase.from(TABLE_NAMES.savedProperties).select("id").eq("property_id", id).eq("user_id", userId).limit(1);
		isSaved = (saved ?? []).length > 0;
	}

	return <PropertyDetail property={property} isSaved={isSaved} isLoggedIn={!!userId} />;
}
