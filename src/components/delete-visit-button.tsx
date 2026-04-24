"use client";

import { deleteVisitAdminAction } from "@/actions/admin";
import { DeleteAlertDialog } from "./delete-alert-dialog";

export function DeleteVisitButton({ visitId }: { visitId: string }) {
	return (
		<DeleteAlertDialog
			action={() => deleteVisitAdminAction(visitId)}
			title="Delete Visit Request?"
			description="Are you sure you want to delete this visit request? This action cannot be undone."
			successMessage="Visit request deleted"
			errorMessage="Failed to delete visit request"
		/>
	);
}
