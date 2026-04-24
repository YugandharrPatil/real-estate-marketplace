import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { VisitWithProperty } from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import { VisitsClient } from "./visits-client";

export default async function VisitsPage() {
	const { userId } = await auth();

	let visits: VisitWithProperty[] = [];

	if (userId) {
		const { data } = await supabase
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

		visits = data || [];
	}

	return <VisitsClient initialVisits={visits} />;
}
