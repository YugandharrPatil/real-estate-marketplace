"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";

interface BookVisitInput {
	propertyId: string;
	visitDate: string;
	visitTime: string;
	userName: string;
	userEmail: string;
}

export async function bookVisitAction(data: BookVisitInput) {
	const { userId } = await auth();
	if (!userId) {
		return { error: "Please sign in to book a visit" };
	}

	if (!data.propertyId || !data.visitDate || !data.visitTime) {
		return { error: "Please select a date and time" };
	}

	try {
		const { error } = await supabase.from(TABLE_NAMES.visits).insert({
			property_id: data.propertyId,
			user_id: userId,
			user_name: data.userName || "User",
			user_email: data.userEmail || "",
			visit_date: data.visitDate,
			visit_time: data.visitTime,
		});

		if (error) throw error;

		return { success: true };
	} catch (error) {
		console.error("Error creating visit:", error);
		return { error: "Failed to book visit" };
	}
}

export async function toggleSaveAction(propertyId: string) {
	const { userId } = await auth();
	if (!userId) {
		return { error: "Please sign in to save properties" };
	}

	try {
		// Check if already saved
		const { data: existing } = await supabase
			.from(TABLE_NAMES.savedProperties)
			.select("id")
			.eq("property_id", propertyId)
			.eq("user_id", userId)
			.limit(1);

		const isSaved = (existing ?? []).length > 0;

		if (isSaved) {
			const { error } = await supabase
				.from(TABLE_NAMES.savedProperties)
				.delete()
				.eq("property_id", propertyId)
				.eq("user_id", userId);

			if (error) throw error;
			return { saved: false };
		} else {
			const { error } = await supabase
				.from(TABLE_NAMES.savedProperties)
				.insert({ property_id: propertyId, user_id: userId });

			if (error) throw error;
			return { saved: true };
		}
	} catch (error) {
		console.error("Error toggling save:", error);
		return { error: "Something went wrong" };
	}
}

interface SubmitInquiryInput {
	name: string;
	email: string;
	phone?: string;
	message: string;
	propertyId?: string;
}

export async function submitInquiryAction(data: SubmitInquiryInput) {
	const { userId } = await auth();

	try {
		const { error } = await supabase.from(TABLE_NAMES.inquiries).insert({
			user_id: userId || null,
			name: data.name,
			email: data.email,
			phone: data.phone || null,
			message: data.message,
			property_id: data.propertyId || null,
		});

		if (error) throw error;

		return { success: true };
	} catch (error) {
		console.error("Error creating inquiry:", error);
		return { error: "Failed to send inquiry" };
	}
}

export async function getSavedPropertiesAction() {
	const { userId } = await auth();
	if (!userId) {
		return { error: "Please sign in", data: [] };
	}

	try {
		const { data: saved, error } = await supabase
			.from(TABLE_NAMES.savedProperties)
			.select(
				`
				${TABLE_NAMES.properties} (
					id,
					title,
					price,
					city,
					state,
					bedrooms,
					bathrooms,
					area_sqft,
					property_type,
					status,
					images
				)
			`,
			)
			.eq("user_id", userId);

		if (error) throw error;

		type PropertyItem = {
			id: string;
			title: string;
			price: string;
			city: string;
			state: string;
			bedrooms: number;
			bathrooms: number;
			area_sqft: number;
			property_type: string;
			status: string;
			images: string[] | null;
		};

		const items = (saved ?? [])
			.map((s: Record<string, unknown>) => s[TABLE_NAMES.properties] as PropertyItem | null)
			.filter((p): p is PropertyItem => p !== null);

		return { data: items };
	} catch (error) {
		console.error("Error fetching saved properties:", error);
		return { error: "Failed to fetch saved properties", data: [] };
	}
}

export async function getUserVisitsAction() {
	const { userId } = await auth();
	if (!userId) {
		return { error: "Please sign in", data: [] };
	}

	try {
		const { data: userVisits, error } = await supabase
			.from(TABLE_NAMES.visits)
			.select(
				`
				id,
				property_id,
				visit_date,
				visit_time,
				status,
				created_at,
				${TABLE_NAMES.properties} (
					title,
					city,
					state
				)
			`,
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return { data: userVisits || [] };
	} catch (error) {
		console.error("Error fetching user visits:", error);
		return { error: "Failed to fetch visits", data: [] };
	}
}

export async function cancelVisitAction(visitId: string) {
	const { userId } = await auth();
	if (!userId) {
		return { error: "Please sign in" };
	}

	try {
		const { error } = await supabase.from(TABLE_NAMES.visits).update({ status: "cancelled" }).eq("id", visitId).eq("user_id", userId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error("Error cancelling visit:", error);
		return { error: "Failed to cancel visit" };
	}
}

export async function rescheduleVisitAction(visitId: string, visitDate: string, visitTime: string) {
	const { userId } = await auth();
	if (!userId) {
		return { error: "Please sign in" };
	}

	try {
		const { error } = await supabase.from(TABLE_NAMES.visits).update({ visit_date: visitDate, visit_time: visitTime, status: "pending" }).eq("id", visitId).eq("user_id", userId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error("Error rescheduling visit:", error);
		return { error: "Failed to reschedule visit" };
	}
}

