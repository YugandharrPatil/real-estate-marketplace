"use server";

import { db } from "@/db";
import { reProperties, reInquiries, reVisits, reChats, reMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

// --- PROPERTIES ---

export async function createPropertyAction(data: any) {
	try {
		const [created] = await db.insert(reProperties).values({
			title: data.title,
			description: data.description,
			price: Number(data.price),
			address: data.address,
			city: data.city,
			state: data.state,
			zip: data.zip,
			bedrooms: Number(data.bedrooms),
			bathrooms: Number(data.bathrooms),
			area_sqft: Number(data.areaSqft),
			property_type: data.propertyType,
			status: data.status,
			latitude: data.latitude ? Number(data.latitude) : null,
			longitude: data.longitude ? Number(data.longitude) : null,
			images: data.images || [],
		}).returning();

		return { data: created };
	} catch (error) {
		console.error("Error creating property:", error);
		return { error: "Failed to create property" };
	}
}

export async function updatePropertyAction(id: string, data: any) {
	try {
		const updateData: any = {
			title: data.title,
			description: data.description,
			price: data.price !== undefined ? Number(data.price) : undefined,
			address: data.address,
			city: data.city,
			state: data.state,
			zip: data.zip,
			bedrooms: data.bedrooms !== undefined ? Number(data.bedrooms) : undefined,
			bathrooms: data.bathrooms !== undefined ? Number(data.bathrooms) : undefined,
			area_sqft: data.areaSqft !== undefined ? Number(data.areaSqft) : undefined,
			property_type: data.propertyType,
			status: data.status,
			latitude: data.latitude !== undefined ? (data.latitude ? Number(data.latitude) : null) : undefined,
			longitude: data.longitude !== undefined ? (data.longitude ? Number(data.longitude) : null) : undefined,
			images: data.images,
			updated_at: new Date().toISOString(),
		};

		Object.keys(updateData).forEach((key) => {
			if (updateData[key] === undefined) {
				delete updateData[key];
			}
		});

		const [updated] = await db.update(reProperties)
			.set(updateData)
			.where(eq(reProperties.id, id))
			.returning();

		return { data: updated };
	} catch (error) {
		console.error("Error updating property:", error);
		return { error: "Failed to update property" };
	}
}

export async function deletePropertyAction(id: string) {
	try {
		await db.delete(reProperties).where(eq(reProperties.id, id));
		return { success: true };
	} catch (error) {
		console.error("Error deleting property:", error);
		return { error: "Failed to delete property" };
	}
}

// --- IMAGE UPLOAD ---

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageAction(formData: FormData) {
	try {
		const file = formData.get("file") as File;
		if (!file) return { error: "No file provided" };

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ folder: "real-estate-marketplace" }, (error, result) => {
					if (error) reject(error);
					else resolve(result as { secure_url: string; public_id: string });
				})
				.end(buffer);
		});

		return {
			url: result.secure_url,
			publicId: result.public_id,
		};
	} catch (error) {
		console.error("Upload error:", error);
		return { error: "Failed to upload image" };
	}
}

// --- INQUIRIES ---

export async function deleteInquiryAction(id: string) {
	try {
		await db.delete(reInquiries).where(eq(reInquiries.id, id));
		return { success: true };
	} catch (error) {
		console.error("Error deleting inquiry:", error);
		return { error: "Failed to delete inquiry" };
	}
}

// --- VISITS ---

export async function updateVisitStatusAction(id: string, status: string) {
	try {
		const [updated] = await db.update(reVisits)
			.set({ status: status as any })
			.where(eq(reVisits.id, id))
			.returning();

		if (!updated) throw new Error("Not found");
		return { data: updated };
	} catch (error) {
		console.error("Error updating visit:", error);
		return { error: "Failed to update visit" };
	}
}

export async function deleteVisitAdminAction(id: string) {
	try {
		await db.delete(reVisits).where(eq(reVisits.id, id));
		return { success: true };
	} catch (error) {
		console.error("Error deleting visit:", error);
		return { error: "Failed to delete visit" };
	}
}

// --- CHATS ---

export async function getAdminChatsAction() {
	try {
		const chats = await db.select()
			.from(reChats)
			.orderBy(desc(reChats.updated_at));

		return { data: chats };
	} catch (error) {
		console.error("Error fetching admin chats:", error);
		return { error: "Failed to fetch chats" };
	}
}

export async function getAdminChatDetailsAction(id: string) {
	try {
		const [chat] = await db.select().from(reChats).where(eq(reChats.id, id)).limit(1);

		if (!chat) throw new Error("Chat not found");

		const messages = await db.select()
			.from(reMessages)
			.where(eq(reMessages.chat_id, id))
			.orderBy(reMessages.created_at);

		return { data: { chat, messages } };
	} catch (error) {
		console.error("Error fetching admin chat:", error);
		return { error: "Failed to fetch chat details" };
	}
}

export async function updateChatStatusAction(id: string, isActive: boolean) {
	try {
		const [chat] = await db.update(reChats)
			.set({
				is_active: isActive,
				updated_at: new Date().toISOString(),
			})
			.where(eq(reChats.id, id))
			.returning();

		return { data: chat };
	} catch (error) {
		console.error("Error updating chat status:", error);
		return { error: "Failed to update chat status" };
	}
}

export async function sendMessageAdminAction(chatId: string, message: string) {
	try {
		const [msg] = await db.insert(reMessages)
			.values({
				chat_id: chatId,
				sender_id: "admin",
				sender_role: "admin",
				content: message,
			})
			.returning();

		await db.update(reChats)
			.set({ updated_at: new Date().toISOString() })
			.where(eq(reChats.id, chatId));

		return { data: msg };
	} catch (error) {
		console.error("Error sending admin message:", error);
		return { error: "Failed to send message" };
	}
}
