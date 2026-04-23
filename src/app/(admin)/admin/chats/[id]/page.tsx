"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { useCallback } from "react";

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  is_active: boolean;
}

export default function AdminChatDetailPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      const data = await res.json();
      setChat(data.chat);
      setMessages(data.messages || []);
    } catch {
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchChat();

    // Realtime subscription
    const channel = supabase
      .channel(`admin-chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLE_NAMES.messages,
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, fetchChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMsg,
          senderId: "admin",
          senderRole: "admin",
        }),
      });
      if (!res.ok) throw new Error();
      setNewMsg("");
      fetchChat();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Chat with {chat?.user_name || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">{chat?.user_email}</p>
        </div>
        <Badge variant={chat?.is_active ? "default" : "secondary"}>
          {chat?.is_active ? "Active" : "Closed"}
        </Badge>
      </div>

      <Card className="h-[60vh] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender_role === "admin" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[70%] ${
                  m.sender_role === "admin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{m.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    m.sender_role === "admin"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(new Date(m.created_at), "HH:mm")}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>

        {chat?.is_active && (
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              <Button onClick={sendMessage} disabled={sending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
