export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase/server";
import { TABLE_NAMES } from "@/lib/data/table-names";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { DeleteInquiryButton } from "./delete-inquiry-button";

export default async function AdminInquiriesPage() {
  const { data: allInquiries } = await supabase
    .from(TABLE_NAMES.inquiries)
    .select(`
      *,
      ${TABLE_NAMES.properties} (
        title
      )
    `)
    .order("created_at", { ascending: false });

  const items = allInquiries ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground">
          All contact form submissions.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No inquiries yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((inq: any) => {
                const property = inq[TABLE_NAMES.properties] as { title: string } | null;
                return (
                  <TableRow key={inq.id}>
                    <TableCell className="font-medium max-w-[150px] truncate outline-none">
                      {property?.title || "General"}
                    </TableCell>
                    <TableCell>{inq.name}</TableCell>
                    <TableCell>{inq.email}</TableCell>
                    <TableCell>{inq.phone || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {inq.message}
                    </TableCell>
                    <TableCell>
                      {format(new Date(inq.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteInquiryButton inquiryId={inq.id} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
