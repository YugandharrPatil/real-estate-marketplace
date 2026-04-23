"use client";

import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { submitInquiryAction } from "@/lib/actions/user";

const inquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  propertyId?: string;
}

export function InquiryForm({ propertyId }: InquiryFormProps) {
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: user?.fullName || "",
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: InquiryFormValues) => {
    const result = await submitInquiryAction({ ...data, propertyId });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Inquiry sent! We'll get back to you soon.");
      reset({ ...data, phone: "", message: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="inquiry-name">Name</FieldLabel>
          <Input id="inquiry-name" {...register("name")} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="inquiry-email">Email</FieldLabel>
          <Input id="inquiry-email" type="email" {...register("email")} />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor="inquiry-phone">Phone (optional)</FieldLabel>
          <Input id="inquiry-phone" {...register("phone")} />
        </Field>
        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="inquiry-message">Message</FieldLabel>
          <Textarea
            id="inquiry-message"
            rows={3}
            placeholder="I'm interested in this property..."
            {...register("message")}
          />
          {errors.message && <FieldError>{errors.message.message}</FieldError>}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Send Inquiry
      </Button>
    </form>
  );
}
