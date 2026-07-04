import { db } from "@/db";
import { reProperties, reVisits } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const data = await db.select({
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

		return NextResponse.json({ data: data || [] });
	} catch (error) {
		console.error("Error fetching visits:", error);
		return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
	}
}
