"use client";

import { useState } from "react";
import Image from "next/image";
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
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { InquiryForm } from "@/components/inquiry-form";
import { bookVisitAction, toggleSaveAction } from "@/lib/actions/user";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const visitFormSchema = z.object({
  visitDate: z.date({ error: "Please select a date" }),
  visitTime: z.string().min(1, "Please select a time"),
});

type VisitFormValues = z.infer<typeof visitFormSchema>;

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
  const { user } = useUser();
  const [saved, setSaved] = useState(initialSaved);
  const [currentImage, setCurrentImage] = useState(0);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitDate: undefined,
      visitTime: "10:00",
    },
  });

  const images = property.images || [];

  const toggleSave = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to save properties");
      return;
    }
    const result = await toggleSaveAction(property.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      setSaved(result.saved ?? false);
      toast.success(result.saved ? "Property saved!" : "Removed from saved");
    }
  };

  const onSubmit = async (data: VisitFormValues) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to book a visit");
      return;
    }

    const result = await bookVisitAction({
      propertyId: property.id,
      visitDate: format(data.visitDate, "yyyy-MM-dd"),
      visitTime: data.visitTime,
      userName: user?.fullName || "User",
      userEmail: user?.emailAddresses?.[0]?.emailAddress || "",
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Visit booked! We'll confirm your appointment soon.");
      reset();
      setShowVisitForm(false);
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <FieldGroup className="flex-row">
                    <Field data-invalid={!!errors.visitDate}>
                      <FieldLabel htmlFor="visit-date">Date</FieldLabel>
                      <Controller
                        name="visitDate"
                        control={control}
                        render={({ field }) => (
                          <Popover
                            open={datePickerOpen}
                            onOpenChange={setDatePickerOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                id="visit-date"
                                className="w-full justify-between font-normal"
                              >
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Select date"}
                                <ChevronDownIcon />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto overflow-hidden p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                captionLayout="dropdown"
                                defaultMonth={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setDatePickerOpen(false);
                                }}
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                      {errors.visitDate && (
                        <FieldError>{errors.visitDate.message}</FieldError>
                      )}
                    </Field>
                    <Field data-invalid={!!errors.visitTime}>
                      <FieldLabel htmlFor="visit-time">Time</FieldLabel>
                      <Controller
                        name="visitTime"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="time"
                            id="visit-time"
                            {...field}
                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        )}
                      />
                      {errors.visitTime && (
                        <FieldError>{errors.visitTime.message}</FieldError>
                      )}
                    </Field>
                  </FieldGroup>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Booking..." : "Confirm"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setShowVisitForm(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
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
