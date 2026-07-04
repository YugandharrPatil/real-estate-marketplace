import { db } from "@/db";
import { reVisits, reProperties } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { VisitWithProperty } from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import { VisitsClient } from "./visits-client";

export default async function VisitsPage() {
	const { userId } = await auth();

	let visits: VisitWithProperty[] = [];

	if (userId) {
		const result = await db.select({
			id: reVisits.id,
			property_id: reVisits.property_id,
			visit_date: reVisits.visit_date,
			visit_time: reVisits.visit_time,
			status: reVisits.status,
			created_at: reVisits.created_at,
			re_properties: {
				title: reProperties.title,
				city: reProperties.city,
				state: reProperties.state,
				images: reProperties.images,
			}
		})
		.from(reVisits)
		.leftJoin(reProperties, eq(reVisits.property_id, reProperties.id))
		.where(eq(reVisits.user_id, userId))
		.orderBy(desc(reVisits.created_at));

		visits = (result as unknown) as VisitWithProperty[];
	}

	return <VisitsClient initialVisits={visits} />;
}
