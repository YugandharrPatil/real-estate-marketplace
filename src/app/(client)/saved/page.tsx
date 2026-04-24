"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSavedPropertiesAction } from "@/actions/user";
import { PropertyCard } from "@/components/property-card";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery({
		queryKey: ["saved-properties"],
		queryFn: async () => {
			const res = await getSavedPropertiesAction();
			if (res.error) throw new Error(res.error);
			return res.data;
		},
	});

	const handleToggleSave = () => {
		// Revalidate the query to reflect the removal/addition immediately
		queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-muted-foreground animate-pulse">Loading your saved properties...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-32 text-center space-y-4">
				<p className="text-destructive font-medium">Error: {error instanceof Error ? error.message : "Failed to load saved properties"}</p>
				<button 
					onClick={() => queryClient.invalidateQueries({ queryKey: ["saved-properties"] })}
					className="text-primary hover:underline"
				>
					Try again
				</button>
			</div>
		);
	}

	const items = data ?? [];

	return (
		<div className="container mx-auto px-4 py-8 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Saved Properties</h1>
				<p className="text-muted-foreground">Properties you&apos;ve saved for later.</p>
			</div>

			{items.length === 0 ? (
				<div className="text-center py-16">
					<Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<p className="text-lg text-muted-foreground">No saved properties yet.</p>
					<Link href="/properties" className="text-primary hover:underline text-sm mt-1 inline-block">
						Browse properties →
					</Link>
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((p) => (
						<PropertyCard 
							key={p.id} 
							property={p} 
							isSaved={true} 
							onToggleSave={handleToggleSave}
						/>
					))}
				</div>
			)}
		</div>
	);
}
