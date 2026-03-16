import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { TABLE_NAMES } from "@/lib/data/table-names";

// ── Enums ──────────────────────────────────────────────
export const propertyTypeEnum = pgEnum("property_type", [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "land",
  "commercial",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "available",
  "sold",
  "pending",
]);

export const visitStatusEnum = pgEnum("visit_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const senderRoleEnum = pgEnum("sender_role", ["user", "admin"]);

// ── Properties ─────────────────────────────────────────
export const properties = pgTable(TABLE_NAMES.properties, {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  bedrooms: integer("bedrooms").notNull().default(0),
  bathrooms: integer("bathrooms").notNull().default(0),
  areaSqft: integer("area_sqft").notNull().default(0),
  propertyType: propertyTypeEnum("property_type").notNull().default("house"),
  status: propertyStatusEnum("status").notNull().default("available"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  images: text("images").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Visits ─────────────────────────────────────────────
export const visits = pgTable(TABLE_NAMES.visits, {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  visitDate: date("visit_date").notNull(),
  visitTime: text("visit_time").notNull(),
  status: visitStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Saved Properties ───────────────────────────────────
export const savedProperties = pgTable(TABLE_NAMES.savedProperties, {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Chats ──────────────────────────────────────────────
export const chats = pgTable(TABLE_NAMES.chats, {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Messages ───────────────────────────────────────────
export const messages = pgTable(TABLE_NAMES.messages, {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  senderId: text("sender_id").notNull(),
  senderRole: senderRoleEnum("sender_role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Inquiries ──────────────────────────────────────────
export const inquiries = pgTable(TABLE_NAMES.inquiries, {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
