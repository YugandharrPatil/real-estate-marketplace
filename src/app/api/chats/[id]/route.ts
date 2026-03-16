import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: chat, error: chatError } = await supabase
      .from(TABLE_NAMES.chats)
      .select("*")
      .eq("id", id)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const { data: chatMessages, error: msgError } = await supabase
      .from(TABLE_NAMES.messages)
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: true });

    if (msgError) throw msgError;

    return NextResponse.json({ chat, messages: chatMessages });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
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

    if (body.message) {
      // Add a message
      const { data: msg, error: msgError } = await supabase
        .from(TABLE_NAMES.messages)
        .insert({
          chat_id: id,
          sender_id: body.senderId,
          sender_role: body.senderRole,
          content: body.message,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      await supabase
        .from(TABLE_NAMES.chats)
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);

      return NextResponse.json(msg);
    }

    if (body.isActive !== undefined) {
      // Close chat
      const { data: chat, error } = await supabase
        .from(TABLE_NAMES.chats)
        .update({
          is_active: body.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(chat);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}
