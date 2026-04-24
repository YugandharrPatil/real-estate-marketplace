"use client";

import { Property } from "@/types/types";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./map-component"), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center h-full">
			<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	),
});

export function MapWrapper({ properties }: { properties: Property[] }) {
	return <MapComponent properties={properties} />;
}
