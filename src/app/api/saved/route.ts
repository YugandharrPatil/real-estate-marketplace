import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data, error } = await supabase.from(TABLE_NAMES.savedProperties).select("*").eq("user_id", userId);

		if (error) throw error;
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching saved:", error);
		return NextResponse.json({ error: "Failed to fetch saved properties" }, { status: 500 });
	}
}
