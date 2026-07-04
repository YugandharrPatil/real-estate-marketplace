import { TABLE_NAMES } from "@/lib/data/table-names";
import type { reProperties, reChats, reInquiries, reVisits } from "@/db/schema";

export type Property = typeof reProperties.$inferSelect;
export type Chats = typeof reChats.$inferSelect;
export type Inquiries = typeof reInquiries.$inferSelect;
export type Visits = typeof reVisits.$inferSelect;

export type VisitWithProperty = Pick<Visits, "id" | "property_id" | "visit_date" | "visit_time" | "status" | "created_at"> & {
	[K in typeof TABLE_NAMES.properties]: Pick<Property, "title" | "city" | "state" | "images"> | null;
};
