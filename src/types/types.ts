import { TABLE_NAMES } from "@/lib/data/table-names";
import type { Tables } from "./database.types";

export type Property = Tables<typeof TABLE_NAMES.properties>;
export type Chats = Tables<typeof TABLE_NAMES.chats>;
export type Inquiries = Tables<typeof TABLE_NAMES.inquiries>;
export type Visits = Tables<typeof TABLE_NAMES.visits>;

export type VisitWithProperty = Pick<Visits, "id" | "property_id" | "visit_date" | "visit_time" | "status" | "created_at"> & {
	[K in typeof TABLE_NAMES.properties]: Pick<Property, "title" | "city" | "state" | "images"> | null;
};
