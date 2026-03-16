"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteVisitButton({ visitId }: { visitId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this visit request?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      
      toast.success("Visit request deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete visit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
