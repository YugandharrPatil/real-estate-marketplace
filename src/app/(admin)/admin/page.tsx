export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { Building2, CalendarCheck, MessageSquare, FileQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [
    { count: propertiesCount },
    { count: visitsCount },
    { count: chatsCount },
    { count: inquiriesCount },
  ] = await Promise.all([
    supabase.from(TABLE_NAMES.properties).select("*", { count: "exact", head: true }),
    supabase.from(TABLE_NAMES.visits).select("*", { count: "exact", head: true }),
    supabase.from(TABLE_NAMES.chats).select("*", { count: "exact", head: true }),
    supabase.from(TABLE_NAMES.inquiries).select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Properties", value: propertiesCount ?? 0, icon: Building2 },
    { label: "Visit Requests", value: visitsCount ?? 0, icon: CalendarCheck },
    { label: "Chats", value: chatsCount ?? 0, icon: MessageSquare },
    { label: "Inquiries", value: inquiriesCount ?? 0, icon: FileQuestion },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketplace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
