"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface PropertyCardProps {
  property: {
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
  };
  isSaved?: boolean;
  onToggleSave?: (id: string, saved: boolean) => void;
}

export function PropertyCard({
  property,
  isSaved: initialSaved = false,
  onToggleSave,
}: PropertyCardProps) {
  const { isSignedIn } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const image = property.images?.[0];

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to save properties");
      return;
    }

    setSaving(true);
    try {
      if (saved) {
        await fetch(`/api/saved?propertyId=${property.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: property.id }),
        });
      }
      setSaved(!saved);
      onToggleSave?.(property.id, !saved);
      toast.success(saved ? "Removed from saved" : "Property saved!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border">
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-3 left-3 capitalize">
            {property.property_type}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur hover:bg-background"
            onClick={toggleSave}
            disabled={saving}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                saved ? "fill-red-500 text-red-500" : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
        <CardContent className="p-4 space-y-2">
          <p className="text-xl font-bold text-primary">
            ₹{Number(property.price).toLocaleString()}
          </p>
          <h3 className="font-semibold text-sm line-clamp-1">{property.title}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {property.city}, {property.state}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms} Bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms} Bath
            </span>
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {property.area_sqft} sqft
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
