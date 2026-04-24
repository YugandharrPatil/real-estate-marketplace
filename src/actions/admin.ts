"use server";

import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";

// --- PROPERTIES ---

export async function createPropertyAction(data: any) {
	try {
		const insertData = {
			title: data.title,
			description: data.description,
			price: data.price,
			address: data.address,
			city: data.city,
			state: data.state,
			zip: data.zip,
			bedrooms: data.bedrooms,
			bathrooms: data.bathrooms,
			area_sqft: data.areaSqft,
			property_type: data.propertyType,
			status: data.status,
			latitude: data.latitude,
			longitude: data.longitude,
			images: data.images,
		};

		const { data: created, error } = await supabase.from(TABLE_NAMES.properties).insert(insertData).select().single();

		if (error) throw error;
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
			price: data.price,
			address: data.address,
			city: data.city,
			state: data.state,
			zip: data.zip,
			bedrooms: data.bedrooms,
			bathrooms: data.bathrooms,
			area_sqft: data.areaSqft,
			property_type: data.propertyType,
			status: data.status,
			latitude: data.latitude,
			longitude: data.longitude,
			images: data.images,
			updated_at: new Date().toISOString(),
		};

		Object.keys(updateData).forEach((key) => {
			if (updateData[key] === undefined) {
				delete updateData[key];
			}
		});

		const { data: updated, error } = await supabase.from(TABLE_NAMES.properties).update(updateData).eq("id", id).select().single();

		if (error) throw error;
		return { data: updated };
	} catch (error) {
		console.error("Error updating property:", error);
		return { error: "Failed to update property" };
	}
}

export async function deletePropertyAction(id: string) {
	try {
		const { error } = await supabase.from(TABLE_NAMES.properties).delete().eq("id", id);

		if (error) throw error;
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
		const { error } = await supabase.from(TABLE_NAMES.inquiries).delete().eq("id", id);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error("Error deleting inquiry:", error);
		return { error: "Failed to delete inquiry" };
	}
}

// --- VISITS ---

export async function updateVisitStatusAction(id: string, status: string) {
	try {
		const { data, error } = await supabase
			.from(TABLE_NAMES.visits)
			.update({ status: status as any })
			.eq("id", id)
			.select()
			.single();

		if (error || !data) throw error || new Error("Not found");
		return { data };
	} catch (error) {
		console.error("Error updating visit:", error);
		return { error: "Failed to update visit" };
	}
}

export async function deleteVisitAdminAction(id: string) {
	try {
		const { error } = await supabase.from(TABLE_NAMES.visits).delete().eq("id", id);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error("Error deleting visit:", error);
		return { error: "Failed to delete visit" };
	}
}

// --- CHATS ---

export async function getAdminChatDetailsAction(id: string) {
	try {
		const { data: chat, error: chatError } = await supabase.from(TABLE_NAMES.chats).select("*").eq("id", id).single();

		if (chatError || !chat) throw chatError || new Error("Chat not found");

		const { data: messages, error: msgError } = await supabase.from(TABLE_NAMES.messages).select("*").eq("chat_id", id).order("created_at", { ascending: true });

		if (msgError) throw msgError;

		return { data: { chat, messages } };
	} catch (error) {
		console.error("Error fetching admin chat:", error);
		return { error: "Failed to fetch chat details" };
	}
}

export async function updateChatStatusAction(id: string, isActive: boolean) {
	try {
		const { data: chat, error } = await supabase
			.from(TABLE_NAMES.chats)
			.update({
				is_active: isActive,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return { data: chat };
	} catch (error) {
		console.error("Error updating chat status:", error);
		return { error: "Failed to update chat status" };
	}
}

export async function sendMessageAdminAction(chatId: string, message: string) {
	try {
		const { data: msg, error: msgError } = await supabase
			.from(TABLE_NAMES.messages)
			.insert({
				chat_id: chatId,
				sender_id: "admin",
				sender_role: "admin",
				content: message,
			})
			.select()
			.single();

		if (msgError) throw msgError;

		await supabase.from(TABLE_NAMES.chats).update({ updated_at: new Date().toISOString() }).eq("id", chatId);

		return { data: msg };
	} catch (error) {
		console.error("Error sending admin message:", error);
		return { error: "Failed to send message" };
	}
}
