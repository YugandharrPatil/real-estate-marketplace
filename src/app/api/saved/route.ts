import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(TABLE_NAMES.savedProperties)
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching saved:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved properties" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { data, error } = await supabase
      .from(TABLE_NAMES.savedProperties)
      .insert({ property_id: body.propertyId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error saving property:", error);
    return NextResponse.json(
      { error: "Failed to save property" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Missing propertyId" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from(TABLE_NAMES.savedProperties)
      .delete()
      .eq("property_id", propertyId)
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsaving property:", error);
    return NextResponse.json(
      { error: "Failed to unsave property" },
      { status: 500 }
    );
  }
}
