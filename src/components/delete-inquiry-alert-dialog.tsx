"use client";

import { deleteInquiryAction } from "@/actions/admin";
import { DeleteAlertDialog } from "./delete-alert-dialog";

export default function DeleteInquiryButton({ inquiryId }: { inquiryId: string }) {
	return (
		<DeleteAlertDialog
			action={() => deleteInquiryAction(inquiryId)}
			title="Delete Inquiry?"
			description="Are you sure you want to delete this inquiry? This action cannot be undone."
			successMessage="Inquiry deleted"
			errorMessage="Failed to delete inquiry"
		/>
	);
}
