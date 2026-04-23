"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { TABLE_NAMES } from "@/lib/data/table-names";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Chat {
  id: string;
  user_name: string;
  user_email: string;
  is_active: boolean;
  updated_at: string;
}

export default function AdminChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.chats)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Listen for new chats or status updates
    const channel = supabase
      .channel("admin-chat-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE_NAMES.chats,
        },
        () => {
          fetchChats(); // Re-fetch list on any change to chats table
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chats</h1>
        <p className="text-muted-foreground">All user chat conversations.</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chats.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No chats yet.
                </TableCell>
              </TableRow>
            ) : (
              chats.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.user_name}</TableCell>
                  <TableCell>{c.user_email}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "default" : "secondary"}>
                      {c.is_active ? "Active" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(c.updated_at), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/chats/${c.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View →
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
