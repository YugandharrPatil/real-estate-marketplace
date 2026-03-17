export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/server";
import { format } from "date-fns";
import { DeleteVisitButton } from "../../../components/delete-visit-button";
import { VisitStatusActions } from "./visit-actions";

interface Visit {
	id: string;
	user_name: string;
	user_email: string;
	visit_date: string;
	visit_time: string;
	status: string;
	created_at: string;
	[key: string]: any;
}

export default async function AdminRequestsPage() {
	const { data: allVisits, error } = await supabase
		.from(TABLE_NAMES.visits)
		.select(
			`
      id,
      user_name,
      user_email,
      visit_date,
      visit_time,
      status,
      created_at,
      ${TABLE_NAMES.properties} (
        title
      )
    `,
		)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Supabase error fetching visits:", error);
	}

	const items = (allVisits as Visit[]) ?? [];

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
						{error ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center text-destructive py-8">
									Error loading visit requests: {error.message}. Please check RLS policies or database connectivity.
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center text-muted-foreground py-8">
									No visit requests yet.
								</TableCell>
							</TableRow>
						) : (
							items.map((v: Record<string, unknown>) => {
								const property = v[TABLE_NAMES.properties] as { title: string } | null;
								return (
									<TableRow key={v.id as string}>
										<TableCell className="font-medium">{property?.title || "—"}</TableCell>
										<TableCell>{v.user_name as string}</TableCell>
										<TableCell>{v.user_email as string}</TableCell>
										<TableCell>{format(new Date(v.visit_date as string), "MMM dd, yyyy")}</TableCell>
										<TableCell>{v.visit_time as string}</TableCell>
										<TableCell>
											<Badge variant={statusColor(v.status as string) as "default" | "secondary" | "destructive"}>{v.status as string}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<VisitStatusActions visitId={v.id as string} currentStatus={v.status as string} />
												<DeleteVisitButton visitId={v.id as string} />
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
