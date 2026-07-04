"use server";

import { db } from "@/db";
import { reProperties, reVisits, reSavedProperties, reChats, reMessages, reInquiries } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

// --- CHATS ---

export async function getUserChatsAction() {
	const { userId } = await auth();
	if (!userId) return { error: "Unauthorized", data: null };

	try {
		const data = await db.select()
			.from(reChats)
			.where(eq(reChats.user_id, userId))
			.orderBy(desc(reChats.updated_at));

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
		const [existing] = await db.select()
			.from(reChats)
			.where(and(eq(reChats.user_id, userId), eq(reChats.is_active, true)))
			.orderBy(desc(reChats.updated_at))
			.limit(1);

		if (existing) return { data: existing };

		// Create new chat
		const [chat] = await db.insert(reChats)
			.values({
				user_id: userId,
				user_name: user.fullName || "User",
				user_email: user.emailAddresses[0]?.emailAddress || "",
				is_active: true,
				updated_at: new Date().toISOString(),
			})
			.returning();

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
		const [chat] = await db.select()
			.from(reChats)
			.where(and(eq(reChats.user_id, userId), eq(reChats.is_active, true)))
			.orderBy(desc(reChats.updated_at))
			.limit(1);

		return { data: chat || null };
	} catch (error) {
		console.error("Error fetching user chat:", error);
		return { error: "Failed to fetch chat", data: null };
	}
}

export async function getChatMessagesAction(chatId: string) {
	try {
		const messages = await db.select()
			.from(reMessages)
			.where(eq(reMessages.chat_id, chatId))
			.orderBy(asc(reMessages.created_at));

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
		const [msg] = await db.insert(reMessages)
			.values({
				chat_id: chatId,
				sender_id: userId,
				sender_role: "user",
				content: message,
			})
			.returning();

		await db.update(reChats)
			.set({ updated_at: new Date().toISOString() })
			.where(eq(reChats.id, chatId));

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
		await db.insert(reVisits)
			.values({
				property_id: data.propertyId,
				user_id: userId,
				user_name: data.userName || "User",
				user_email: data.userEmail || "",
				visit_date: data.visitDate,
				visit_time: data.visitTime,
			});

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
		const rows = await db.select({
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

		return { data: rows || [] };
	} catch (error) {
		console.error("Error fetching user visits:", error);
		return { error: "Failed to fetch visits", data: [] };
	}
}

export async function cancelVisitAction(visitId: string) {
	const { userId } = await auth();
	if (!userId) return { error: "Please sign in" };

	try {
		await db.update(reVisits)
			.set({ status: "cancelled" })
			.where(and(eq(reVisits.id, visitId), eq(reVisits.user_id, userId)));

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
		await db.update(reVisits)
			.set({ visit_date: visitDate, visit_time: visitTime, status: "pending" })
			.where(and(eq(reVisits.id, visitId), eq(reVisits.user_id, userId)));

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
		const existing = await db.select({ id: reSavedProperties.id })
			.from(reSavedProperties)
			.where(and(eq(reSavedProperties.property_id, propertyId), eq(reSavedProperties.user_id, userId)))
			.limit(1);

		const isSaved = existing.length > 0;

		if (isSaved) {
			await db.delete(reSavedProperties)
				.where(and(eq(reSavedProperties.property_id, propertyId), eq(reSavedProperties.user_id, userId)));

			return { saved: false };
		} else {
			await db.insert(reSavedProperties)
				.values({
					property_id: propertyId,
					user_id: userId,
				});

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
		const saved = await db.select({ property_id: reSavedProperties.property_id })
			.from(reSavedProperties)
			.where(eq(reSavedProperties.user_id, userId));

		return { data: saved.map((s) => s.property_id) };
	} catch (error) {
		console.error("Error fetching saved property IDs:", error);
		return { error: "Failed to fetch saved property IDs", data: [] };
	}
}

export async function getSavedPropertiesAction() {
	const { userId } = await auth();
	if (!userId) return { error: "Please sign in", data: [] };

	try {
		const saved = await db.select({
			re_properties: reProperties,
		})
		.from(reSavedProperties)
		.innerJoin(reProperties, eq(reSavedProperties.property_id, reProperties.id))
		.where(eq(reSavedProperties.user_id, userId));

		const items = saved.map((s) => s.re_properties);

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
		await db.insert(reInquiries)
			.values({
				user_id: userId || null,
				name: data.name,
				email: data.email,
				phone: data.phone || null,
				message: data.message,
				property_id: data.propertyId || null,
			});

		return { success: true };
	} catch (error) {
		console.error("Error creating inquiry:", error);
		return { error: "Failed to send inquiry" };
	}
}
