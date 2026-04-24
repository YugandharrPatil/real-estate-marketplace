"use server";

import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { Property } from "@/types/types";
import { auth, currentUser } from "@clerk/nextjs/server";

// --- CHATS ---

export async function getUserChatsAction() {
	const { userId } = await auth();
	if (!userId) return { error: "Unauthorized", data: null };

	try {
		const { data, error } = await supabase.from(TABLE_NAMES.chats).select("*").eq("user_id", userId).order("updated_at", { ascending: false });

		if (error) throw error;
		return { data };
	} catch (error) {
		console.error("Error fetching chats:", error);
		return { error: "Failed to fetch chats", data: null };
	}
}

export async function getOrCreateUserChatAction() {
	const { userId } = await auth();
	const user = await currentUser();
	if (!userId || !user) return { error: "Unauthorized", data: null };

	try {
		// Try to find existing active chat
		const { data: existing } = await supabase.from(TABLE_NAMES.chats).select("*").eq("user_id", userId).eq("is_active", true).order("updated_at", { ascending: false }).limit(1).single();

		if (existing) return { data: existing };

		// Create new chat
		const { data: chat, error } = await supabase
			.from(TABLE_NAMES.chats)
			.insert({
				user_id: userId,
				user_name: user.fullName || "User",
				user_email: user.emailAddresses[0]?.emailAddress || "",
				is_active: true,
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) throw error;
		return { data: chat };
	} catch (error) {
		console.error("Error creating chat:", error);
		return { error: "Failed to create chat", data: null };
	}
}

export async function getUserActiveChatAction() {
	const { userId } = await auth();
	if (!userId) return { error: "Unauthorized", data: null };

	try {
		const { data: chat, error } = await supabase.from(TABLE_NAMES.chats).select("*").eq("user_id", userId).eq("is_active", true).order("updated_at", { ascending: false }).limit(1).single();

		if (error && error.code !== "PGRST116") throw error;
		return { data: chat || null };
	} catch (error) {
		console.error("Error fetching user chat:", error);
		return { error: "Failed to fetch chat", data: null };
	}
}

export async function getChatMessagesAction(chatId: string) {
	try {
		const { data: messages, error } = await supabase.from(TABLE_NAMES.messages).select("*").eq("chat_id", chatId).order("created_at", { ascending: true });

		if (error) throw error;
		return { data: messages };
	} catch (error) {
		console.error("Error fetching messages:", error);
		return { error: "Failed to fetch messages", data: null };
	}
}

export async function sendMessageUserAction(chatId: string, message: string) {
	const { userId } = await auth();
	if (!userId) return { error: "Unauthorized", data: null };

	try {
		const { data: msg, error: msgError } = await supabase
			.from(TABLE_NAMES.messages)
			.insert({
				chat_id: chatId,
				sender_id: userId,
				sender_role: "user",
				content: message,
			})
			.select()
			.single();

		if (msgError) throw msgError;

		await supabase.from(TABLE_NAMES.chats).update({ updated_at: new Date().toISOString() }).eq("id", chatId);

		return { data: msg };
	} catch (error) {
		console.error("Error sending message:", error);
		return { error: "Failed to send message", data: null };
	}
}

// --- VISITS ---

interface BookVisitInput {
	propertyId: string;
	visitDate: string;
	visitTime: string;
	userName: string;
	userEmail: string;
}

export async function bookVisitAction(data: BookVisitInput) {
	const { userId } = await auth();
	if (!userId) return { error: "Please sign in to book a visit" };
	if (!data.propertyId || !data.visitDate || !data.visitTime) return { error: "Please select a date and time" };

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

export async function getUserVisitsAction() {
	const { userId } = await auth();
	if (!userId) return { error: "Please sign in", data: [] };

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
          state,
          images
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
	if (!userId) return { error: "Please sign in" };

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
	if (!userId) return { error: "Please sign in" };

	try {
		const { error } = await supabase.from(TABLE_NAMES.visits).update({ visit_date: visitDate, visit_time: visitTime, status: "pending" }).eq("id", visitId).eq("user_id", userId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error("Error rescheduling visit:", error);
		return { error: "Failed to reschedule visit" };
	}
}

// --- SAVED PROPERTIES ---

export async function toggleSaveAction(propertyId: string) {
	const { userId } = await auth();
	if (!userId) return { error: "Please sign in to save properties" };

	try {
		const { data: existing } = await supabase.from(TABLE_NAMES.savedProperties).select("id").eq("property_id", propertyId).eq("user_id", userId).limit(1);

		const isSaved = (existing ?? []).length > 0;

		if (isSaved) {
			const { error } = await supabase.from(TABLE_NAMES.savedProperties).delete().eq("property_id", propertyId).eq("user_id", userId);

			if (error) throw error;
			return { saved: false };
		} else {
			const { error } = await supabase.from(TABLE_NAMES.savedProperties).insert({ property_id: propertyId, user_id: userId });

			if (error) throw error;
			return { saved: true };
		}
	} catch (error) {
		console.error("Error toggling save:", error);
		return { error: "Something went wrong" };
	}
}

export async function getSavedPropertyIdsAction() {
	const { userId } = await auth();
	if (!userId) return { error: "Please sign in", data: [] };

	try {
		const { data: saved, error } = await supabase.from(TABLE_NAMES.savedProperties).select("property_id").eq("user_id", userId);

		if (error) throw error;
		return { data: (saved ?? []).map((s) => s.property_id) };
	} catch (error) {
		console.error("Error fetching saved property IDs:", error);
		return { error: "Failed to fetch saved property IDs", data: [] };
	}
}

export async function getSavedPropertiesAction() {
	const { userId } = await auth();
	if (!userId) return { error: "Please sign in", data: [] };

	try {
		const { data: saved, error } = await supabase
			.from(TABLE_NAMES.savedProperties)
			.select(
				`
        ${TABLE_NAMES.properties} (*)
      `,
			)
			.eq("user_id", userId);

		if (error) throw error;

		const items = (saved ?? []).map((s) => s[TABLE_NAMES.properties] as Property | null).filter((p): p is Property => p !== null);

		return { data: items };
	} catch (error) {
		console.error("Error fetching saved properties:", error);
		return { error: "Failed to fetch saved properties", data: [] };
	}
}

// --- INQUIRIES ---

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
