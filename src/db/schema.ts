import { sql } from "drizzle-orm";
import { integer, real, text, sqliteTable, foreignKey } from "drizzle-orm/sqlite-core";

export const reVisits = sqliteTable(
	"re_visits",
	{
		id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
		property_id: text("property_id").notNull(),
		user_id: text("user_id").notNull(),
		user_name: text("user_name").notNull(),
		user_email: text("user_email").notNull(),
		visit_date: text("visit_date").notNull(),
		visit_time: text("visit_time").notNull(),
		status: text("status").$type<"pending" | "confirmed" | "cancelled">().default("pending").notNull(),
		created_at: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.property_id],
			foreignColumns: [reProperties.id],
			name: "re_visits_property_id_fkey",
		}).onDelete("cascade"),
	],
);

export const reSavedProperties = sqliteTable(
	"re_saved_properties",
	{
		id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
		property_id: text("property_id").notNull(),
		user_id: text("user_id").notNull(),
		created_at: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.property_id],
			foreignColumns: [reProperties.id],
			name: "re_saved_properties_property_id_fkey",
		}).onDelete("cascade"),
	],
);

export const reProperties = sqliteTable("re_properties", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	description: text("description"),
	price: real("price").notNull(),
	address: text("address").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
	zip: text("zip").notNull(),
	bedrooms: integer("bedrooms").default(0).notNull(),
	bathrooms: integer("bathrooms").default(0).notNull(),
	area_sqft: integer("area_sqft").default(0).notNull(),
	property_type: text("property_type").$type<"house" | "apartment" | "condo" | "townhouse" | "land" | "commercial">().default("house").notNull(),
	status: text("status").$type<"available" | "sold" | "pending">().default("available").notNull(),
	latitude: real("latitude"),
	longitude: real("longitude"),
	images: text("images", { mode: "json" }).$type<string[]>().default([]),
	created_at: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
	updated_at: text("updated_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export const reChats = sqliteTable(
	"re_chats",
	{
		id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
		user_id: text("user_id").notNull(),
		user_name: text("user_name").notNull(),
		user_email: text("user_email").notNull(),
		property_id: text("property_id"),
		is_active: integer("is_active", { mode: "boolean" }).default(true).notNull(),
		created_at: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
		updated_at: text("updated_at").$defaultFn(() => new Date().toISOString()).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.property_id],
			foreignColumns: [reProperties.id],
			name: "re_chats_property_id_fkey",
		}).onDelete("set null"),
	],
);

export const reMessages = sqliteTable(
	"re_messages",
	{
		id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
		chat_id: text("chat_id").notNull(),
		sender_id: text("sender_id").notNull(),
		sender_role: text("sender_role").$type<"user" | "admin">().notNull(),
		content: text("content").notNull(),
		created_at: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.chat_id],
			foreignColumns: [reChats.id],
			name: "re_messages_chat_id_fkey",
		}).onDelete("cascade"),
	],
);

export const reInquiries = sqliteTable(
	"re_inquiries",
	{
		id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
		user_id: text("user_id"),
		name: text("name").notNull(),
		email: text("email").notNull(),
		phone: text("phone"),
		message: text("message").notNull(),
		property_id: text("property_id"),
		created_at: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.property_id],
			foreignColumns: [reProperties.id],
			name: "re_inquiries_property_id_fkey",
		}).onDelete("set null"),
	],
);
