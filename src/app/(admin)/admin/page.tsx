export const dynamic = "force-dynamic";

import { db } from "@/db";
import { reProperties, reVisits, reChats, reInquiries } from "@/db/schema";
import { count } from "drizzle-orm";
import { Building2, CalendarCheck, MessageSquare, FileQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminDashboard() {
  const [pRes, vRes, cRes, iRes] = await Promise.all([
    db.select({ count: count() }).from(reProperties),
    db.select({ count: count() }).from(reVisits),
    db.select({ count: count() }).from(reChats),
    db.select({ count: count() }).from(reInquiries),
  ]);

  const propertiesCount = pRes[0]?.count ?? 0;
  const visitsCount = vRes[0]?.count ?? 0;
  const chatsCount = cRes[0]?.count ?? 0;
  const inquiriesCount = iRes[0]?.count ?? 0;

  const stats = [
    { label: "Properties", value: propertiesCount, icon: Building2 },
    { label: "Visit Requests", value: visitsCount, icon: CalendarCheck },
    { label: "Chats", value: chatsCount, icon: MessageSquare },
    { label: "Inquiries", value: inquiriesCount, icon: FileQuestion },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketplace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Link
            key={label}
            href={
              label === "Visit Requests"
                ? "/admin/requests"
                : label === "Inquiries"
                ? "/admin/inquiries"
                : label === "Chats"
                ? "/admin/chats"
                : "/admin/properties"
            }
          >
            <Card className="hover:border-primary transition-colors cursor-pointer">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
