"use client";

import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Property } from "@/types/types";

type PropertiesGridProps = {
	properties: Property[];
	savedIds: string[];
};

export function PropertiesGrid({ properties: allProperties, savedIds }: PropertiesGridProps) {
	const [showFilters, setShowFilters] = useState(false);

	const [search, setSearch] = useState("");
	const [city, setCity] = useState("");
	const [type, setType] = useState("");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [bedrooms, setBedrooms] = useState("");

	const uniqueCities = useMemo(() => {
		return Array.from(new Set(allProperties.map((p) => p.city))).sort();
	}, [allProperties]);

	const globalMaxPrice = useMemo(() => {
		if (allProperties.length === 0) return 100000000;
		return Math.max(...allProperties.map((p) => p.price || 0));
	}, [allProperties]);

	const currentMinPrice = minPrice ? parseInt(minPrice) : 0;
	const currentMaxPrice = maxPrice ? parseInt(maxPrice) : globalMaxPrice;

	const filteredProperties = useMemo(() => {
		return allProperties.filter((p) => {
			if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
			if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
			if (type && p.property_type !== type) return false;
			if (minPrice && p.price < parseInt(minPrice)) return false;
			if (maxPrice && p.price > parseInt(maxPrice)) return false;
			if (bedrooms && p.bedrooms < parseInt(bedrooms)) return false;
			return true;
		});
	}, [allProperties, search, city, type, minPrice, maxPrice, bedrooms]);

	const clearFilters = () => {
		setSearch("");
		setCity("");
		setType("");
		setMinPrice("");
		setMaxPrice("");
		setBedrooms("");
	};

	const hasFilters = search || city || type || minPrice || maxPrice || bedrooms;

	return (
		<div className="space-y-6">
			{/* Search bar */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
				</div>
				<Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
					<SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
				</Button>
			</div>

			{/* Filters panel */}
			{showFilters && (
				<div className="rounded-lg border p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4 bg-muted/30">
					<div className="space-y-1.5">
						<label className="text-sm font-medium">City</label>
						<Select value={city || "none"} onValueChange={(val) => setCity(val === "none" ? "" : val)}>
							<SelectTrigger>
								<SelectValue placeholder="All cities" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" className="text-muted-foreground">
									All cities
								</SelectItem>
								{uniqueCities.map((c) => (
									<SelectItem key={c} value={c}>
										{c}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Property Type</label>
						<Select value={type || "none"} onValueChange={(val) => setType(val === "none" ? "" : val)}>
							<SelectTrigger>
								<SelectValue placeholder="All types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" className="text-muted-foreground">
									All types
								</SelectItem>
								{["house", "apartment", "condo", "townhouse", "land", "commercial"].map((t) => (
									<SelectItem key={t} value={t}>
										{t.charAt(0).toUpperCase() + t.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-4 sm:col-span-2">
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium">Price Range</label>
							<span className="text-sm text-muted-foreground">
								₹{currentMinPrice.toLocaleString("en-IN")} - ₹{currentMaxPrice.toLocaleString("en-IN")}
							</span>
						</div>
						<Slider
							min={0}
							max={globalMaxPrice}
							step={100000}
							value={[currentMinPrice, currentMaxPrice]}
							onValueChange={([min, max]) => {
								setMinPrice(min.toString());
								setMaxPrice(max.toString());
							}}
						/>
					</div>
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Min Bedrooms</label>
						<Input
							type="number"
							min={0}
							placeholder="Any"
							value={bedrooms}
							onChange={(e) => {
								let value = Number(e.target.value);
								if (value < 0) value = 0;
								if (value > 100) value = 100;
								setBedrooms(value.toString());
							}}
						/>
					</div>
					<div className="flex items-end gap-2 sm:col-span-3">
						<Button variant="outline" onClick={clearFilters}>
							<X className="h-4 w-4 mr-1" /> Clear all filters
						</Button>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">{`Showing ${filteredProperties.length} of ${allProperties.length} properties`}</p>
			</div>

			{/* Grid */}
			{filteredProperties.length === 0 ? (
				<div className="text-center py-16">
					<p className="text-lg text-muted-foreground">No properties found.</p>
					{hasFilters && (
						<Button variant="link" onClick={clearFilters} className="mt-2">
							Clear all filters
						</Button>
					)}
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredProperties.map((p) => (
						<PropertyCard key={p.id} property={p} isSaved={savedIds.includes(p.id)} />
					))}
				</div>
			)}
		</div>
	);
}
