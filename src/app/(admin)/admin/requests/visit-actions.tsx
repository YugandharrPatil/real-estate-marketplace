"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, XIcon } from "lucide-react";

export function VisitStatusActions({
  visitId,
  currentStatus,
}: {
  visitId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Visit ${status}`);
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (currentStatus !== "pending") return null;

  return (
    <div className="flex gap-1 justify-end">
      <Button
        variant="default"
        size="sm"
        onClick={() => updateStatus("confirmed")}
      >
        <Check className="h-3.5 w-3.5 mr-1" /> Confirm
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => updateStatus("cancelled")}
      >
        <XIcon className="h-3.5 w-3.5 mr-1" /> Cancel
      </Button>
    </div>
  );
}
