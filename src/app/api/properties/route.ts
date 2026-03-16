import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city");
    const type = url.searchParams.get("type");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const bedrooms = url.searchParams.get("bedrooms");
    const bathrooms = url.searchParams.get("bathrooms");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let query = supabase
      .from(TABLE_NAMES.properties)
      .select("*")
      .order("created_at", { ascending: false });

    if (city) query = query.ilike("city", `%${city}%`);
    if (type) query = query.eq("property_type", type);
    if (minPrice) query = query.gte("price", minPrice);
    if (maxPrice) query = query.lte("price", maxPrice);
    if (bedrooms) query = query.gte("bedrooms", parseInt(bedrooms));
    if (bathrooms) query = query.gte("bathrooms", parseInt(bathrooms));
    if (status) query = query.eq("status", status);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from(TABLE_NAMES.properties)
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
