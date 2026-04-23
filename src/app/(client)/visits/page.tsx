"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2, MapPin, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { getUserVisitsAction, cancelVisitAction, rescheduleVisitAction } from "@/lib/actions/user";
import { TABLE_NAMES } from "@/lib/data/table-names";

const rescheduleSchema = z.object({
	visitDate: z.date({ error: "Please select a date" }),
	visitTime: z.string().min(1, "Please select a time"),
});

type RescheduleValues = z.infer<typeof rescheduleSchema>;

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

export default function VisitsPage() {
	const queryClient = useQueryClient();
	const [rescheduleVisit, setRescheduleVisit] = useState<{ id: string; date: Date; time: string } | null>(null);
	const [cancelVisitId, setCancelVisitId] = useState<string | null>(null);

	const { data, isLoading, error } = useQuery({
		queryKey: ["user-visits"],
		queryFn: async () => {
			const res = await getUserVisitsAction();
			if (res.error) throw new Error(res.error);
			return res.data;
		},
	});

	const handleCancel = async () => {
		if (!cancelVisitId) return;

		const result = await cancelVisitAction(cancelVisitId);
		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Visit cancelled successfully");
			queryClient.invalidateQueries({ queryKey: ["user-visits"] });
		}
		setCancelVisitId(null);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-muted-foreground animate-pulse">Loading your visits...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-32 text-center space-y-4">
				<p className="text-destructive font-medium">Error: {error instanceof Error ? error.message : "Failed to load visits"}</p>
				<Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["user-visits"] })}>
					Try again
				</Button>
			</div>
		);
	}

	const items = data || [];

	return (
		<div className="container mx-auto px-4 py-8 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">My Visits</h1>
				<p className="text-muted-foreground">Track all your scheduled property visits.</p>
			</div>

			{items.length === 0 ? (
				<div className="text-center py-16">
					<CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<p className="text-lg text-muted-foreground">No visits scheduled yet.</p>
					<Link href="/properties" className="text-primary hover:underline text-sm mt-1 inline-block">
						Browse properties →
					</Link>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((v: any) => {
						const property = v[TABLE_NAMES.properties] as { title: string; city: string; state: string } | null;
						return (
							<Card key={v.id}>
								<CardContent className="p-5 space-y-3">
									<div className="flex items-start justify-between">
										<h3 className="font-semibold line-clamp-1">{property?.title || "Property"}</h3>
										<Badge variant={statusColor(v.status) as any}>{v.status}</Badge>
									</div>
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<MapPin className="h-3.5 w-3.5" />
										{property?.city}, {property?.state}
									</p>
									<div className="flex items-center gap-4 text-sm">
										<span className="flex items-center gap-1">
											<CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
											{format(new Date(v.visit_date), "MMM dd, yyyy")}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="h-3.5 w-3.5 text-muted-foreground" />
											{v.visit_time}
										</span>
									</div>
									<div className="flex gap-2 pt-2">
										<Button 
											variant="outline" 
											size="sm" 
											className="flex-1"
											onClick={() => setRescheduleVisit({ id: v.id, date: new Date(v.visit_date), time: v.visit_time })}
											disabled={v.status === 'cancelled'}
										>
											Reschedule
										</Button>
										<Button 
											variant="destructive" 
											size="sm" 
											className="flex-1"
											onClick={() => setCancelVisitId(v.id)}
											disabled={v.status === 'cancelled'}
										>
											Cancel
										</Button>
										<Button variant="secondary" size="sm" asChild>
											<Link href={`/properties/${v.property_id}`}>
												<MapPin className="h-4 w-4" />
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Reschedule Dialog */}
			<RescheduleDialog 
				visit={rescheduleVisit} 
				onOpenChange={(open) => !open && setRescheduleVisit(null)} 
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ["user-visits"] });
					setRescheduleVisit(null);
				}}
			/>

			{/* Cancel Alert Dialog */}
			<AlertDialog open={!!cancelVisitId} onOpenChange={(open) => !open && setCancelVisitId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will cancel your scheduled appointment. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Go Back</AlertDialogCancel>
						<AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Confirm Cancellation
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function RescheduleDialog({ visit, onOpenChange, onSuccess }: { visit: { id: string; date: Date; time: string } | null, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
	const [datePickerOpen, setDatePickerOpen] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset
	} = useForm<RescheduleValues>({
		resolver: zodResolver(rescheduleSchema),
		values: visit ? {
			visitDate: visit.date,
			visitTime: visit.time
		} : undefined
	});

	const onSubmit = async (data: RescheduleValues) => {
		if (!visit) return;

		const result = await rescheduleVisitAction(
			visit.id,
			format(data.visitDate, "yyyy-MM-dd"),
			data.visitTime
		);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Visit rescheduled successfully");
			onSuccess();
		}
	};

	return (
		<Dialog open={!!visit} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Reschedule Visit</DialogTitle>
					<DialogDescription>
						Choose a new date and time for your property visit.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<FieldGroup className="flex-col">
						<Field data-invalid={!!errors.visitDate}>
							<FieldLabel htmlFor="reschedule-date">New Date</FieldLabel>
							<Controller
								name="visitDate"
								control={control}
								render={({ field }) => (
									<Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
										<PopoverTrigger asChild>
											<Button
												type="button"
												variant="outline"
												id="reschedule-date"
												className="w-full justify-between font-normal"
											>
												{field.value ? format(field.value, "PPP") : "Select date"}
												<CalendarIcon className="h-4 w-4 ml-2 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<CalendarComponent
												mode="single"
												selected={field.value}
												onSelect={(date) => {
													field.onChange(date);
													setDatePickerOpen(false);
												}}
												disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								)}
							/>
							{errors.visitDate && <FieldError>{errors.visitDate.message}</FieldError>}
						</Field>
						<Field data-invalid={!!errors.visitTime}>
							<FieldLabel htmlFor="reschedule-time">New Time</FieldLabel>
							<Controller
								name="visitTime"
								control={control}
								render={({ field }) => (
									<Input
										type="time"
										id="reschedule-time"
										{...field}
										className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
									/>
								)}
							/>
							{errors.visitTime && <FieldError>{errors.visitTime.message}</FieldError>}
						</Field>
					</FieldGroup>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Updating..." : "Update Appointment"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
