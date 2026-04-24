"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DeleteAlertDialogProps {
	action: () => Promise<{ error?: string } | any>;
	title?: string;
	description?: string;
	successMessage?: string;
	errorMessage?: string;
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
	buttonSize?: React.ComponentProps<typeof Button>["size"];
	buttonClassName?: string;
	iconClassName?: string;
}

export function DeleteAlertDialog({
	action,
	title = "Are you absolutely sure?",
	description = "This action cannot be undone.",
	successMessage = "Deleted successfully",
	errorMessage = "Failed to delete",
	buttonVariant = "outline",
	buttonSize = "icon",
	buttonClassName = "h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10",
	iconClassName = "h-4 w-4",
}: DeleteAlertDialogProps) {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		setLoading(true);
		try {
			const res = await action();
			if (res?.error) throw new Error(res.error);
			toast.success(successMessage);
			router.refresh();
		} catch {
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant={buttonVariant} size={buttonSize} className={buttonClassName} disabled={loading}>
					{loading ? <Loader2 className={`animate-spin ${iconClassName}`} /> : <Trash2 className={iconClassName} />}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							handleDelete();
						}}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						disabled={loading}
						variant="destructive"
					>
						{loading ? "Deleting..." : "Delete Permanently"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
