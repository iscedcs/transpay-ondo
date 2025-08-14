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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { CreateLGAData, GeoJSONPolygon } from "@/types/lga";

const createLGASchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  stateId: z.string().min(1, "State is required"),
  fee: z.number().min(1, "Fee must be greater than 0"),
});

interface LGACreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLGAData) => Promise<void>;
}

export function LGACreateModal({
  isOpen,
  onClose,
  onSubmit,
}: LGACreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [boundary, setBoundary] = useState<GeoJSONPolygon | undefined>();

  const form = useForm<any>({
    resolver: zodResolver(createLGASchema),
    defaultValues: {
      name: "",
      stateId: "",
      fee: 0,
    },
  });

  const handleSubmit = async (data: Omit<CreateLGAData, "boundary">) => {
    if (!boundary) {
      form.setError("root", {
        message: "Please draw the LGA boundary on the map",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ ...data, boundary });
      form.reset();
      setBoundary(undefined);
      onClose();
    } catch (error) {
      form.setError("root", {
        message: "Failed to create LGA. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setBoundary(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New LGA</DialogTitle>
          <DialogDescription>
            Add a new Local Government Area to the system.
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
                  name="stateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">{STATE_CONFIG.name}</SelectItem>
                        </SelectContent>
                      </Select>
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
                  // @ts-expect-error: don't know what the erro should be.
                  onBoundaryChange={setBoundary}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create LGA"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
