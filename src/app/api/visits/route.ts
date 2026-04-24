import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { data, error } = await supabase
			.from(TABLE_NAMES.visits)
			.select(`
				id,
				property_id,
				visit_date,
				visit_time,
				status,
				created_at,
				${TABLE_NAMES.properties} (
					title,
					city,
					state,
					images
				)
			`)
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return NextResponse.json({ data: data || [] });
	} catch (error) {
		console.error("Error fetching visits:", error);
		return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
	}
}
