"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Define the form schema
const formSchema = z.object({
  bvn: z
    .string()
    .min(11, { message: "BVN must be 11 digits" })
    .max(11, { message: "BVN must be 11 digits" })
    .regex(/^\d+$/, { message: "BVN must contain only numbers" }),
  dob: z.date({
    required_error: "Date of birth is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface GenerateAccountModalProps {
  walletId: string;
  bvn?: string;
  dob?: string;
}

export function GenerateAccountModal({
  walletId,
  bvn,
  dob,
}: GenerateAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bvn: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Format the date as YYYY-MM-DD
      const formattedDob = format(values.dob, "yyyy-MM-dd");

      // Make API request to create virtual account
      const response = await fetch("/api/vehicles/create-virtual-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletId,
          bvn: values.bvn,
          dob: formattedDob,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create virtual account"
        );
      }

      const data = await response.json();

      // Call success callback

      // Show success toast
      toast.success("Account Generated", {
        description: "Virtual account has been successfully created",
      });
    } catch (error) {
      console.error("Error creating virtual account:", error);

      // Show error toast
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create virtual account",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Generate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Virtual Account</DialogTitle>
          <DialogDescription>
            Enter BVN and date of birth to generate a virtual account for this
            vehicle.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bvn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BVN</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 11-digit BVN" {...field} />
                  </FormControl>
                  <FormDescription>
                    Bank Verification Number is required for account creation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value ? format(field.value, "yyyy-MM-dd") : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        field.onChange(date);
                      }}
                      max={format(new Date(), "yyyy-MM-dd")}
                      min="1900-01-01"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Date of birth associated with the BVN.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose type="button" disabled={isSubmitting}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  "Generate Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
