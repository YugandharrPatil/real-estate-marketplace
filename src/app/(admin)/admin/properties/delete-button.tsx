"use client";

import { deletePropertyAction } from "@/actions/admin";
import { DeleteAlertDialog } from "@/components/delete-alert-dialog";

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
	return (
		<DeleteAlertDialog
			action={() => deletePropertyAction(propertyId)}
			title="Are you absolutely sure?"
			description="This action cannot be undone. This will permanently delete the property listing from our database."
			successMessage="Property deleted"
			errorMessage="Failed to delete property"
			buttonVariant="destructive"
			buttonSize="sm"
			buttonClassName=""
			iconClassName="h-3.5 w-3.5"
		/>
	);
}
