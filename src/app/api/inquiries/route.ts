import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.inquiries)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { error } = await supabase
      .from(TABLE_NAMES.inquiries)
      .delete()
      .eq("id", body.id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}

