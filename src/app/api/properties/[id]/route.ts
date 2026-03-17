import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from(TABLE_NAMES.properties)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Map camelCase to snake_case for DB
    // We only include fields that should be updated
    const updateData: any = {
      title: body.title,
      description: body.description,
      price: body.price,
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      area_sqft: body.areaSqft,
      property_type: body.propertyType,
      status: body.status,
      latitude: body.latitude,
      longitude: body.longitude,
      images: body.images,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined fields to avoid overwriting with nulls if not provided
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data, error } = await supabase
      .from(TABLE_NAMES.properties)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Supabase error (PUT /api/properties/${id}):`, error);
      return NextResponse.json(
        { error: error.message || "Property not found" },
        { status: error.code === "PGRST116" ? 404 : 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from(TABLE_NAMES.properties)
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
