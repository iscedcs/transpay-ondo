"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LGABoundaryMap } from "./lga-boundary-map";
import { STATE_CONFIG } from "@/lib/constants";
import type { LGA, GeoJSONPolygon } from "@/types/lga";

const editLGASchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  fee: z.number().min(1, "Fee must be greater than 0"),
});

interface LGAEditModalProps {
  lga: LGA;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    fee: number;
    boundary?: GeoJSONPolygon;
  }) => Promise<void>;
}

export function LGAEditModal({
  lga,
  isOpen,
  onClose,
  onSubmit,
}: LGAEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [boundary, setBoundary] = useState<any | undefined>(lga.boundary);

  const form = useForm<{ name: string; fee: number }>({
    resolver: zodResolver(editLGASchema),
    defaultValues: {
      name: lga.name,
      fee: lga.fee,
    },
  });

  const handleSubmit = async (data: { name: string; fee: number }) => {
    setIsLoading(true);
    try {
      await onSubmit({ ...data, boundary });
      onClose();
    } catch (error) {
      form.setError("root", {
        message: "Failed to update LGA. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit LGA: {lga.name}</DialogTitle>
          <DialogDescription>
            Update the LGA information and boundary.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LGA Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter LGA name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Levy Fee ({STATE_CONFIG.currencySymbol})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter levy fee"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="text-sm font-medium">State</div>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {lga.state} (Read-only)
                  </div>
                </div>

                {form.formState.errors.root && (
                  <div className="text-sm text-red-600">
                    {form.formState.errors.root.message}
                  </div>
                )}
              </div>

              {/* Right Column - Map */}
              <div>
                <LGABoundaryMap
                  boundary={boundary}
                  editable
                  onBoundaryChange={setBoundary}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update LGA"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
