export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { DeletePropertyButton } from "./delete-button";

export default async function AdminPropertiesPage() {
  const { data: allProperties } = await supabase
    .from(TABLE_NAMES.properties)
    .select("*")
    .order("created_at", { ascending: false });

  const items = allProperties ?? [];

  const statusColor = (s: string) => {
    switch (s) {
      case "available":
        return "default";
      case "pending":
        return "secondary";
      case "sold":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground">
            Manage all property listings.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/properties/new">
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No properties yet. Create your first listing!
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.city}</TableCell>
                  <TableCell className="capitalize">{p.property_type}</TableCell>
                  <TableCell>₹{Number(p.price).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(p.status) as "default" | "secondary" | "destructive"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/properties/${p.id}/edit`}>Edit</Link>
                    </Button>
                    <DeletePropertyButton propertyId={p.id} />
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
