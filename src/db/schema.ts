import { sql } from "drizzle-orm";
import { boolean, date, foreignKey, integer, numeric, pgEnum, pgSequence, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const propertyStatus = pgEnum("property_status", ["available", "sold", "pending"]);
export const propertyType = pgEnum("property_type", ["house", "apartment", "condo", "townhouse", "land", "commercial"]);
export const senderRole = pgEnum("sender_role", ["user", "admin"]);
export const visitStatus = pgEnum("visit_status", ["pending", "confirmed", "cancelled"]);

export const petMessagesIdSeq = pgSequence("pet_messages_id_seq", { startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false });
export const agencyProjectsIdSeq = pgSequence("agency_projects_id_seq", { startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false });
export const agencyMessagesIdSeq = pgSequence("agency_messages_id_seq", { startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false });

export const reVisits = pgTable(
	"re_visits",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		propertyId: uuid("property_id").notNull(),
		userId: text("user_id").notNull(),
		userName: text("user_name").notNull(),
		userEmail: text("user_email").notNull(),
		visitDate: date("visit_date").notNull(),
		visitTime: text("visit_time").notNull(),
		status: visitStatus().default("pending").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.propertyId],
			foreignColumns: [reProperties.id],
			name: "re_visits_property_id_fkey",
		}).onDelete("cascade"),
	],
);

export const reSavedProperties = pgTable(
	"re_saved_properties",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		propertyId: uuid("property_id").notNull(),
		userId: text("user_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.propertyId],
			foreignColumns: [reProperties.id],
			name: "re_saved_properties_property_id_fkey",
		}).onDelete("cascade"),
	],
);

export const reProperties = pgTable("re_properties", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	price: numeric({ precision: 12, scale: 2 }).notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zip: text().notNull(),
	bedrooms: integer().default(0).notNull(),
	bathrooms: integer().default(0).notNull(),
	areaSqft: integer("area_sqft").default(0).notNull(),
	propertyType: propertyType("property_type").default("house").notNull(),
	status: propertyStatus().default("available").notNull(),
	latitude: numeric({ precision: 10, scale: 7 }),
	longitude: numeric({ precision: 10, scale: 7 }),
	images: text().array().default([""]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});

export const reChats = pgTable(
	"re_chats",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: text("user_id").notNull(),
		userName: text("user_name").notNull(),
		userEmail: text("user_email").notNull(),
		propertyId: uuid("property_id"),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.propertyId],
			foreignColumns: [reProperties.id],
			name: "re_chats_property_id_fkey",
		}).onDelete("set null"),
	],
);

export const reMessages = pgTable(
	"re_messages",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		chatId: uuid("chat_id").notNull(),
		senderId: text("sender_id").notNull(),
		senderRole: senderRole("sender_role").notNull(),
		content: text().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.chatId],
			foreignColumns: [reChats.id],
			name: "re_messages_chat_id_fkey",
		}).onDelete("cascade"),
	],
);

export const reInquiries = pgTable(
	"re_inquiries",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: text("user_id"),
		name: text().notNull(),
		email: text().notNull(),
		phone: text(),
		message: text().notNull(),
		propertyId: uuid("property_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.propertyId],
			foreignColumns: [reProperties.id],
			name: "re_inquiries_property_id_fkey",
		}).onDelete("set null"),
	],
);
