import { getAllProperties } from "@/lib/data/properties";
import { Property } from "@/types/types";
import { MapWrapper } from "./map-wrapper";

export default async function MapPage() {
	const propertiesData = await getAllProperties();

	const properties = propertiesData.filter((p: Property) => p.latitude && p.longitude);

	return (
		<div className="h-[calc(100vh-4rem)]">
			<MapWrapper properties={properties} />
		</div>
	);
}
