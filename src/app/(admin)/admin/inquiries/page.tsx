export const dynamic = "force-dynamic";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/db";
import { reInquiries, reProperties } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import DeleteInquiryAlertDialog from "../../../../components/delete-inquiry-alert-dialog";

interface Inquiry {
	id: string;
	property_id: string | null;
	name: string;
	email: string;
	phone: string | null;
	message: string;
	created_at: string;
	re_properties: {
		title: string;
	} | null;
}

export default async function AdminInquiriesPage() {
	let items: Inquiry[] = [];
	let dbError: string | null = null;

	try {
		const result = await db.select({
			id: reInquiries.id,
			property_id: reInquiries.property_id,
			name: reInquiries.name,
			email: reInquiries.email,
			phone: reInquiries.phone,
			message: reInquiries.message,
			created_at: reInquiries.created_at,
			re_properties: {
				title: reProperties.title,
			}
		})
		.from(reInquiries)
		.leftJoin(reProperties, eq(reInquiries.property_id, reProperties.id))
		.orderBy(desc(reInquiries.created_at));

		items = result as Inquiry[];
	} catch (error: any) {
		console.error("Drizzle error fetching inquiries:", error);
		dbError = error.message;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Inquiries</h1>
				<p className="text-muted-foreground">All contact form submissions.</p>
			</div>

			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Property</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Message</TableHead>
							<TableHead>Date</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dbError ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center text-destructive py-8">
									Error loading inquiries: {dbError}. Please check database connectivity.
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center text-muted-foreground py-8">
									No inquiries yet.
								</TableCell>
							</TableRow>
						) : (
							items.map((inq: Inquiry) => {
								const property = inq.re_properties;
								return (
									<TableRow key={inq.id}>
										<TableCell className="font-medium max-w-[150px] truncate outline-none">{property?.title || "General"}</TableCell>
										<TableCell>{inq.name}</TableCell>
										<TableCell>{inq.email}</TableCell>
										<TableCell>{inq.phone || "—"}</TableCell>
										<TableCell className="max-w-xs truncate">{inq.message}</TableCell>
										<TableCell>{format(new Date(inq.created_at), "MMM dd, yyyy")}</TableCell>
										<TableCell className="text-right">
											<DeleteInquiryAlertDialog inquiryId={inq.id} />
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
