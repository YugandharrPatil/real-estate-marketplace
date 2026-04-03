import { relations } from "drizzle-orm/relations";
import { reProperties, reVisits, reSavedProperties, reChats, reMessages, reInquiries } from "./schema";

export const reVisitsRelations = relations(reVisits, ({one}) => ({
	reProperty: one(reProperties, {
		fields: [reVisits.propertyId],
		references: [reProperties.id]
	}),
}));

export const rePropertiesRelations = relations(reProperties, ({many}) => ({
	reVisits: many(reVisits),
	reSavedProperties: many(reSavedProperties),
	reChats: many(reChats),
	reInquiries: many(reInquiries),
}));

export const reSavedPropertiesRelations = relations(reSavedProperties, ({one}) => ({
	reProperty: one(reProperties, {
		fields: [reSavedProperties.propertyId],
		references: [reProperties.id]
	}),
}));

export const reChatsRelations = relations(reChats, ({one, many}) => ({
	reProperty: one(reProperties, {
		fields: [reChats.propertyId],
		references: [reProperties.id]
	}),
	reMessages: many(reMessages),
}));

export const reMessagesRelations = relations(reMessages, ({one}) => ({
	reChat: one(reChats, {
		fields: [reMessages.chatId],
		references: [reChats.id]
	}),
}));

export const reInquiriesRelations = relations(reInquiries, ({one}) => ({
	reProperty: one(reProperties, {
		fields: [reInquiries.propertyId],
		references: [reProperties.id]
	}),
}));