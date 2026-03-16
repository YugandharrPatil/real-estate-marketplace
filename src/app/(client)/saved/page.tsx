export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function SavedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: saved } = await supabase
    .from(TABLE_NAMES.savedProperties)
    .select(`
      ${TABLE_NAMES.properties} (
        id,
        title,
        price,
        city,
        state,
        bedrooms,
        bathrooms,
        area_sqft,
        property_type,
        status,
        images
      )
    `)
    .eq("user_id", userId);

  // Flatten nested property objects
  type PropertyItem = {
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

  const items = (saved ?? [])
    .map((s: Record<string, unknown>) => s[TABLE_NAMES.properties] as PropertyItem | null)
    .filter((p): p is PropertyItem => p !== null);


  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Properties</h1>
        <p className="text-muted-foreground">
          Properties you&apos;ve saved for later.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">
            No saved properties yet.
          </p>
          <Link
            href="/properties"
            className="text-primary hover:underline text-sm mt-1 inline-block"
          >
            Browse properties →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.id as string} property={p} isSaved />
          ))}
        </div>
      )}
    </div>
  );
}
