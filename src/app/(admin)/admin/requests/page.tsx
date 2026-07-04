export const dynamic = "force-dynamic";

import { DeleteVisitButton } from "@/components/delete-visit-button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/db";
import { reVisits, reProperties } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import { VisitStatusActions } from "./visit-actions";

interface Visit {
	id: string;
	user_name: string;
	user_email: string;
	visit_date: string;
	visit_time: string;
	status: string;
	created_at: string;
	re_properties: {
		title: string;
	} | null;
}

export default async function AdminRequestsPage() {
	let items: Visit[] = [];
	let dbError: string | null = null;

	try {
		const result = await db.select({
			id: reVisits.id,
			user_name: reVisits.user_name,
			user_email: reVisits.user_email,
			visit_date: reVisits.visit_date,
			visit_time: reVisits.visit_time,
			status: reVisits.status,
			created_at: reVisits.created_at,
			re_properties: {
				title: reProperties.title
			}
		})
		.from(reVisits)
		.leftJoin(reProperties, eq(reVisits.property_id, reProperties.id))
		.orderBy(desc(reVisits.created_at));

		items = result as Visit[];
	} catch (error: any) {
		console.error("Drizzle error fetching visits:", error);
		dbError = error.message;
	}

	const statusColor = (s: string) => {
		switch (s) {
			case "confirmed":
				return "default";
			case "pending":
				return "secondary";
			case "cancelled":
				return "destructive";
			default:
				return "secondary";
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Visit Requests</h1>
				<p className="text-muted-foreground">Manage property visit requests from users.</p>
			</div>

			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Property</TableHead>
							<TableHead>Visitor</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Time</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dbError ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center text-destructive py-8">
									Error loading visit requests: {dbError}. Please check database connectivity.
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center text-muted-foreground py-8">
									No visit requests yet.
								</TableCell>
							</TableRow>
						) : (
							items.map((v: Visit) => {
								const property = v.re_properties;
								return (
									<TableRow key={v.id}>
										<TableCell className="font-medium">{property?.title || "—"}</TableCell>
										<TableCell>{v.user_name}</TableCell>
										<TableCell>{v.user_email}</TableCell>
										<TableCell>{format(new Date(v.visit_date), "MMM dd, yyyy")}</TableCell>
										<TableCell>{v.visit_time}</TableCell>
										<TableCell>
											<Badge variant={statusColor(v.status) as "default" | "secondary" | "destructive"}>{v.status}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<VisitStatusActions visitId={v.id} currentStatus={v.status} />
												<DeleteVisitButton visitId={v.id} />
											</div>
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
