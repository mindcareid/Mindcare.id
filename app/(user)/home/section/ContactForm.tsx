"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "sonner";
import { Send } from "lucide-react";
import Button from "@/app/components/reusable/Button";
import { cn } from "@/lib/utils";
import {
  contactUserSchema,
  type ContactUserFormData,
} from "@/lib/validations/auth";

function fieldClassName(invalid: boolean) {
  return cn(
    "w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground",
    "placeholder:text-muted-foreground transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
    invalid && "border-destructive focus:ring-destructive",
  );
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactUserFormData>({
    resolver: zodResolver(contactUserSchema),
  });

  const onSubmit = async (data: ContactUserFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to send message");
      }
      toast.success("Message sent successfully!", {
        description: "We'll get back to you soon.",
      });
      reset();
    } catch (err) {
      toast.error("Failed to send message", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-foreground"
        >
          Full name
        </label>
        <input
          id="contact-name"
          {...register("name")}
          placeholder="Your name"
          className={cn("mt-2", fieldClassName(Boolean(errors.name)))}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className={cn("mt-2", fieldClassName(Boolean(errors.email)))}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="block text-sm font-medium text-foreground"
          >
            Phone number
          </label>
          <div className="mt-2">
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  international
                  defaultCountry="ID"
                  numberInputProps={{ id: "contact-phone" }}
                  className={cn(
                    "phone-input",
                    errors.phoneNumber && "phone-error",
                  )}
                />
              )}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-destructive">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-medium text-foreground"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          {...register("Subject")}
          placeholder="How can we help?"
          className={cn("mt-2", fieldClassName(Boolean(errors.Subject)))}
        />
        {errors.Subject && (
          <p className="mt-1 text-xs text-destructive">
            {errors.Subject.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-foreground"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          {...register("Message")}
          placeholder="Tell us a little more about your enquiry..."
          className={cn(
            "mt-2 resize-y",
            fieldClassName(Boolean(errors.Message)),
          )}
        />
        {errors.Message && (
          <p className="mt-1 text-xs text-destructive">
            {errors.Message.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={loading}
        icon={Send}
        iconPosition="right"
        className="w-full"
      >
        Send message
      </Button>
    </form>
  );
}
