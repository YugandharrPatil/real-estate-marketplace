export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/property-form";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: property, error } = await supabase
    .from(TABLE_NAMES.properties)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Property</h1>
        <p className="text-muted-foreground">Update property details.</p>
      </div>
      <PropertyForm
        mode="edit"
        initialData={{
          ...property,
          id: property.id,
          description: property.description || "",
          price: property.price,
          images: property.images || [],
          latitude: property.latitude?.toString() || "",
          longitude: property.longitude?.toString() || "",
        }}
      />
    </div>
  );
}
