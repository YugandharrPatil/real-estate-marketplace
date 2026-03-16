import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all"); // admin flag

    if (all === "true") {
      // Admin: get all chats
      const { data, error } = await supabase
        .from(TABLE_NAMES.chats)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // User: get own chats
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(TABLE_NAMES.chats)
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
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

    // Check for existing active chat for this user
    const { data: existing } = await supabase
      .from(TABLE_NAMES.chats)
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(existing);
    }

    const { data: chat, error } = await supabase
      .from(TABLE_NAMES.chats)
      .insert({
        user_id: userId,
        user_name: body.userName,
        user_email: body.userEmail,
        property_id: body.propertyId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
