"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  getOrCreateUserChatAction, 
  getUserActiveChatAction, 
  getChatMessagesAction, 
  sendMessageUserAction 
} from "@/actions/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: chatData, isLoading: chatLoading } = useQuery({
    queryKey: ["activeChat"],
    queryFn: async () => {
      const res = await getUserActiveChatAction();
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    enabled: isOpen && !!isSignedIn,
  });

  const chat = chatData as Chat | null;

  const { data: messagesData } = useQuery({
    queryKey: ["chatMessages", chat?.id],
    queryFn: async () => {
      if (!chat?.id) return [];
      const res = await getChatMessagesAction(chat.id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    enabled: !!chat?.id,
  });

  const messages = (messagesData as Message[]) || [];

  const startChatMutation = useMutation({
    mutationFn: async () => {
      const res = await getOrCreateUserChatAction();
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["activeChat"], data);
    },
    onError: () => {
      toast.error("Failed to start chat");
    },
  });

  const startNewChat = () => {
    startChatMutation.mutate();
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
          queryClient.setQueryData(["chatMessages", chat.id], (old: Message[] | undefined) => {
            return old ? [...old, payload.new as Message] : [payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat?.id, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!chat?.id || !newMsg.trim()) return;
      const res = await sendMessageUserAction(chat.id, newMsg);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      setNewMsg("");
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const sendMessage = () => {
    if (!newMsg.trim() || !chat || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate();
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
            ) : chatLoading || startChatMutation.isPending ? (
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
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  size="icon" 
                  className="h-9 w-9 shrink-0" 
                  onClick={sendMessage} 
                  disabled={sendMessageMutation.isPending || !newMsg.trim()}
                >
                  {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
