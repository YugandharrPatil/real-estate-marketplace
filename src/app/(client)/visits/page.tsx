export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function VisitsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: userVisits } = await supabase
    .from(TABLE_NAMES.visits)
    .select(`
      id,
      property_id,
      visit_date,
      visit_time,
      status,
      created_at,
      ${TABLE_NAMES.properties} (
        title,
        city,
        state
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const items = userVisits ?? [];

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Visits</h1>
        <p className="text-muted-foreground">
          Track all your scheduled property visits.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">
            No visits scheduled yet.
          </p>
          <Link
            href="/properties"
            className="text-primary hover:underline text-sm mt-1 inline-block"
          >
            Browse properties →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v: Record<string, unknown>) => {
            const property = v[TABLE_NAMES.properties] as { title: string; city: string; state: string } | null;
            return (
              <Link key={v.id as string} href={`/properties/${v.property_id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold line-clamp-1">
                        {property?.title || "Property"}
                      </h3>
                      <Badge
                        variant={
                          statusColor(v.status as string) as
                            | "default"
                            | "secondary"
                            | "destructive"
                        }
                      >
                        {v.status as string}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {property?.city}, {property?.state}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(new Date(v.visit_date as string), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {v.visit_time as string}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
