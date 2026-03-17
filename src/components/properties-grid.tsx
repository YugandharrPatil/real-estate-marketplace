"use client";

import { PropertyCard } from "@/components/property-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface PropertiesGridProps {
  properties: {
    id: string;
    title: string;
    price: string;
    city: string;
    state: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    property_type: string;
    status: string;
    images: string[] | null;
  }[];
  savedIds: string[];
}

export function PropertiesGrid({ properties, savedIds }: PropertiesGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    router.push("/properties");
  };

  const hasFilters = search || city || type || minPrice || maxPrice || bedrooms;

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
        </Button>
        <Button onClick={applyFilters}>Search</Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-lg border p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4 bg-muted/30">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">City</label>
            <Input
              placeholder="Any city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Property Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                {["house", "apartment", "condo", "townhouse", "land", "commercial"].map(
                  (t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Min Price</label>
            <Input
              type="number"
              placeholder="₹0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Max Price</label>
            <Input
              type="number"
              placeholder="No limit"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Min Bedrooms</label>
            <Input
              type="number"
              placeholder="Any"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2 sm:col-span-3">
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      )}

      {hasFilters && (
        <p className="text-sm text-muted-foreground">
          Showing {properties.length} result{properties.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No properties found.</p>
          {hasFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isSaved={savedIds.includes(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
