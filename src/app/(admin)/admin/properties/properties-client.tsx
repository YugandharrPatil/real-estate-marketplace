"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { DeletePropertyButton } from "./delete-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropertyForm } from "@/components/property-form";

interface Property {
  id: string;
  title: string;
  city: string;
  property_type: string;
  price: number;
  status: string;
  area_sqft?: number;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  latitude?: string;
  longitude?: string;
  description?: string;
}

interface PropertiesClientProps {
  initialProperties: Property[];
}

export function PropertiesClient({ initialProperties }: PropertiesClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

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

  const handleOpenCreate = () => {
    setEditingProperty(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground">Manage all property listings.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
            <div className="bg-background rounded-lg border shadow-lg p-6 md:p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl">
                  {editingProperty ? "Edit Property" : "Add New Property"}
                </DialogTitle>
              </DialogHeader>
              <PropertyForm
                mode={editingProperty ? "edit" : "create"}
                initialData={editingProperty ? {
                  ...editingProperty,
                  price: editingProperty.price.toString(),
                  propertyType: editingProperty.property_type as "house" | "apartment" | "condo" | "townhouse" | "land" | "commercial",
                  status: editingProperty.status as "available" | "sold" | "pending",
                  areaSqft: editingProperty.area_sqft,
                } : undefined}
                onSuccess={handleSuccess}
                onCancel={() => setIsDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
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
            {initialProperties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No properties yet. Create your first listing!
                </TableCell>
              </TableRow>
            ) : (
              initialProperties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.city}</TableCell>
                  <TableCell className="capitalize">{p.property_type}</TableCell>
                  <TableCell>₹{Number(p.price).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusColor(p.status) as
                          | "default"
                          | "secondary"
                          | "destructive"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(p)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
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
