"use client";

import { getAdminChatDetailsAction, sendMessageAdminAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
	const [newMsg, setNewMsg] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const { data: chatData, isLoading } = useQuery({
		queryKey: ["adminChatDetails", chatId],
		queryFn: async () => {
			const res = await getAdminChatDetailsAction(chatId);
			if (res.error) throw new Error(res.error);
			return res.data;
		},
	});

	const chat = chatData?.chat as Chat | null | undefined;
	const messages = (chatData?.messages as Message[]) || [];

	useEffect(() => {
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
					queryClient.setQueryData(["adminChatDetails", chatId], (old: any) => {
						if (!old) return old;
						return {
							...old,
							messages: [...old.messages, payload.new as Message],
						};
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [chatId, queryClient]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessageMutation = useMutation({
		mutationFn: async () => {
			if (!newMsg.trim()) return;
			const res = await sendMessageAdminAction(chatId, newMsg);
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
		if (!newMsg.trim() || sendMessageMutation.isPending) return;
		sendMessageMutation.mutate();
	};

	if (isLoading) {
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
					<h1 className="text-2xl font-bold">Chat with {chat?.user_name || "User"}</h1>
					<p className="text-sm text-muted-foreground">{chat?.user_email}</p>
				</div>
				<Badge variant={chat?.is_active ? "default" : "secondary"}>{chat?.is_active ? "Active" : "Closed"}</Badge>
			</div>

			<Card className="h-[60vh] flex flex-col">
				<CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
					{messages.map((m) => (
						<div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
							<div className={`rounded-lg px-4 py-2 max-w-[70%] ${m.sender_role === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
								<p className="text-sm">{m.content}</p>
								<p className={`text-xs mt-1 ${m.sender_role === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{format(new Date(m.created_at), "HH:mm")}</p>
							</div>
						</div>
					))}
					<div ref={bottomRef} />
				</CardContent>

				{chat?.is_active && (
					<div className="border-t p-4">
						<div className="flex gap-2">
							<Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." />
							<Button onClick={sendMessage} disabled={sendMessageMutation.isPending}>
								<Send className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}
