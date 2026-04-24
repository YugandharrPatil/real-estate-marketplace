"use client";

import { updateVisitStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Check, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function VisitStatusActions({ visitId, currentStatus }: { visitId: string; currentStatus: string }) {
	const router = useRouter();

	const updateStatus = async (status: string) => {
		try {
			const res = await updateVisitStatusAction(visitId, status);
			if (res.error) throw new Error(res.error);
			toast.success(`Visit ${status}`);
			router.refresh();
		} catch {
			toast.error("Failed to update status");
		}
	};

	if (currentStatus !== "pending") return null;

	return (
		<div className="flex gap-1 justify-end">
			<Button variant="default" size="sm" onClick={() => updateStatus("confirmed")}>
				<Check className="h-3.5 w-3.5 mr-1" /> Confirm
			</Button>
			<Button variant="destructive" size="sm" onClick={() => updateStatus("cancelled")}>
				<XIcon className="h-3.5 w-3.5 mr-1" /> Cancel
			</Button>
		</div>
	);
}
