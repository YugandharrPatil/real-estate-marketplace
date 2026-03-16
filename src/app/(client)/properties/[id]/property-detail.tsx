"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Heart,
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { InquiryForm } from "@/components/inquiry-form";

interface PropertyDetailProps {
  property: {
    id: string;
    title: string;
    description: string | null;
    price: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    property_type: string;
    status: string;
    latitude: string | null;
    longitude: string | null;
    images: string[] | null;
  };
  isSaved: boolean;
  isLoggedIn: boolean;
}

export function PropertyDetail({
  property,
  isSaved: initialSaved,
  isLoggedIn,
}: PropertyDetailProps) {
  const router = useRouter();
  const { user } = useUser();
  const [saved, setSaved] = useState(initialSaved);
  const [currentImage, setCurrentImage] = useState(0);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [booking, setBooking] = useState(false);

  const images = property.images || [];

  const toggleSave = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to save properties");
      return;
    }
    try {
      if (saved) {
        await fetch(`/api/saved?propertyId=${property.id}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: property.id }),
        });
      }
      setSaved(!saved);
      toast.success(saved ? "Removed from saved" : "Property saved!");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const bookVisit = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to book a visit");
      return;
    }
    if (!visitDate || !visitTime) {
      toast.error("Please select a date and time");
      return;
    }
    setBooking(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          visitDate,
          visitTime,
          userName: user?.fullName || "User",
          userEmail: user?.emailAddresses?.[0]?.emailAddress || "",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Visit booked! We'll confirm your appointment soon.");
      setShowVisitForm(false);
      setVisitDate("");
      setVisitTime("");
    } catch {
      toast.error("Failed to book visit");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Image Gallery */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-muted">
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImage]}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage(
                      (currentImage - 1 + images.length) % images.length
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur rounded-full p-2 hover:bg-background transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((currentImage + 1) % images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur rounded-full p-2 hover:bg-background transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`h-2 w-2 rounded-full transition ${
                        i === currentImage
                          ? "bg-white"
                          : "bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Property Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="capitalize">{property.property_type}</Badge>
                <Badge
                  variant={
                    property.status === "available"
                      ? "default"
                      : property.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {property.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.address}, {property.city}, {property.state}{" "}
                {property.zip}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={toggleSave}>
                <Heart
                  className={`h-4 w-4 ${
                    saved ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-3xl font-bold text-primary">
            ₹{Number(property.price).toLocaleString()}
          </p>

          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-5 w-5 text-muted-foreground" />
              <strong>{property.bedrooms}</strong> Bedrooms
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <strong>{property.bathrooms}</strong> Bathrooms
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize className="h-5 w-5 text-muted-foreground" />
              <strong>{property.area_sqft}</strong> sq ft
            </span>
          </div>

          <Separator />

          {property.description && (
            <div>
              <h2 className="text-xl font-semibold mb-3">About this property</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          {/* Book Visit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" /> Book a Visit
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showVisitForm ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={bookVisit}
                      disabled={booking}
                    >
                      {booking ? "Booking..." : "Confirm"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowVisitForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowVisitForm(true)}
                >
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" /> Contact Broker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InquiryForm propertyId={property.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
