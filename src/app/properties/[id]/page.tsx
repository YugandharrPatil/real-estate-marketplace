export const dynamic = "force-dynamic";

import { PropertyDetail } from "@/components/property-detail";
import { db } from "@/db";
import { reProperties, reSavedProperties } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { userId } = await auth();

	const [property] = await db.select().from(reProperties).where(eq(reProperties.id, id)).limit(1);

	if (!property) notFound();

	let isSaved = false;
	if (userId) {
		const saved = await db.select({ id: reSavedProperties.id })
			.from(reSavedProperties)
			.where(and(eq(reSavedProperties.property_id, id), eq(reSavedProperties.user_id, userId)))
			.limit(1);
		isSaved = saved.length > 0;
	}

	return <PropertyDetail property={property} isSaved={isSaved} isLoggedIn={!!userId} />;
}
