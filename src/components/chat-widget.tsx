"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { toast } from "sonner";
import { format } from "date-fns";

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
  updated_at: string;
}

export function ChatWidget() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, []);

  const initChat = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      // Get or create chat
      const res = await fetch("/api/chats/me");
      const { chat: existingChat } = await res.json();
      
      if (existingChat) {
        setChat(existingChat);
        fetchMessages(existingChat.id);
      }
    } catch (err) {
      console.error("Failed to init chat:", err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, fetchMessages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const startNewChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chats/me", { method: "POST" });
      const { chat: newChat } = await res.json();
      setChat(newChat);
    } catch {
      toast.error("Failed to start chat");
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!chat?.id) return;

    const channel = supabase
      .channel(`chat:${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLE_NAMES.messages,
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat?.id]);

  useEffect(() => {
    if (isOpen && isSignedIn && !chat) {
      initChat();
    }
  }, [isOpen, isSignedIn, chat, initChat]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !chat || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chats/${chat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMsg,
          senderId: user?.id,
          senderRole: "user",
        }),
      });
      if (!res.ok) throw new Error();
      setNewMsg("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!isLoaded) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-transform hover:scale-110 active:scale-95"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-80 sm:w-96 shadow-2xl z-50 transition-all duration-300 origin-bottom-right ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-primary text-primary-foreground rounded-t-xl">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat with EstateHub
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
          <CardContent className="p-0 flex flex-col h-[calc(100%-112px)]">
            {!isSignedIn ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />
                <div className="space-y-1">
                  <p className="font-medium">Direct Chat</p>
                  <p className="text-xs text-muted-foreground">Sign in to start a real-time conversation with our agents.</p>
                </div>
                <SignInButton mode="modal">
                  <Button size="sm">Sign In to Chat</Button>
                </SignInButton>
              </div>
            ) : loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !chat ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="space-y-1">
                  <p className="font-medium">No active chat</p>
                  <p className="text-xs text-muted-foreground">Start a conversation with our team.</p>
                </div>
                <Button onClick={startNewChat}>Start Conversation</Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Send a message to start the conversation!
                  </p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_role === "admin" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.sender_role === "admin"
                          ? "bg-muted text-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className={`text-[10px] mt-1 opacity-60 ${m.sender_role === "admin" ? "text-muted-foreground" : "text-primary-foreground"}`}>
                        {format(new Date(m.created_at), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
          
          {isSignedIn && chat && (
            <div className="p-3 border-t bg-background rounded-b-xl">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="h-9 text-sm"
                  disabled={sending}
                />
                <Button 
                  size="icon" 
                  className="h-9 w-9 shrink-0" 
                  onClick={sendMessage} 
                  disabled={sending || !newMsg.trim()}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
