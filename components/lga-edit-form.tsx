"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { LGA, updateLGA } from "@/actions/lga";

// Vehicle categories enum
const VEHICLE_CATEGORIES = [
  "TRICYCLE",
  "MOTORCYCLE",
  "CAR",
  "BUS_INTRASTATE",
  "BUS_INTERSTATE",
  "TRUCKS",
  "TRAILER",
  "TANKER",
] as const;

// Form validation schema
const lgaEditSchema = z.object({
  name: z.string().min(1, "LGA name is required").max(100, "Name too long"),
  fees: z
    .array(
      z.object({
        vehicleCategory: z.enum(VEHICLE_CATEGORIES, {
          required_error: "Vehicle category is required",
        }),
        fee: z
          .number()
          .min(0, "Fee must be positive")
          .max(1000000, "Fee too high"),
      })
    )
    .min(1, "At least one fee is required"),
  boundary: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.array(z.number().array().length(2)))),
  }),
});

type LGAEditFormData = z.infer<typeof lgaEditSchema>;

interface LGAEditFormProps {
  lga: LGA;
}

export function LGAEditForm({ lga }: LGAEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [boundaryText, setBoundaryText] = useState(
    JSON.stringify(lga.boundary, null, 2)
  );

  const form = useForm<LGAEditFormData>({
    resolver: zodResolver(lgaEditSchema),
    defaultValues: {
      name: lga.name,
      fees: Array.isArray(lga.fee) ? lga.fee : [],
      // @ts-expect-error: test error
      boundary: lga.boundary,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fees",
  });

  const onSubmit = ({ fees, boundary, name }: LGAEditFormData) => {
    startTransition(async () => {
      try {
        // Parse boundary from text
        let parsedBoundary;
        try {
          parsedBoundary = JSON.parse(boundaryText);
        } catch {
          toast.error("Invalid Boundary", {
            description: "Please provide valid JSON for boundary coordinates",
          });
          return;
        }

        const result = await updateLGA(lga.id, {
          name,
          // @ts-expect-error: test
          boundary,
          fees,
        });

        if (result.success) {
          toast.success("Success", {
            description: "LGA updated successfully",
          });
          router.push(`/lgas/${lga.id}`);
          router.refresh();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Error updating LGA:", error);
        toast.error("Error", {
          description:
            error instanceof Error ? error.message : "Failed to update LGA",
        });
      }
    });
  };

  const addFee = () => {
    append({
      vehicleCategory: "TRICYCLE",
      fee: 0,
    });
  };

  const getAvailableCategories = (currentIndex: number) => {
    const usedCategories = form
      .watch("fees")
      .map((fee, index) =>
        index !== currentIndex ? fee.vehicleCategory : null
      )
      .filter(Boolean);

    return VEHICLE_CATEGORIES.filter(
      (category) => !usedCategories.includes(category)
    );
  };

  return (
    // @ts-expect-error: test
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/lgas/${lga.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to LGA
          </Link>
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">LGA Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter LGA name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Fees</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFee}
              disabled={fields.length >= VEHICLE_CATEGORIES.length}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Fee
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No fees configured. Click "Add Fee" to add vehicle category fees.
            </p>
          )}

          {fields.map((field, index) => {
            const availableCategories = getAvailableCategories(index);
            const currentCategory = form.watch(`fees.${index}.vehicleCategory`);

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <Label>Vehicle Category</Label>
                  <select
                    {...form.register(`fees.${index}.vehicleCategory`)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {currentCategory &&
                      !availableCategories.includes(currentCategory) && (
                        <option value={currentCategory}>
                          {currentCategory}
                        </option>
                      )}
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.fees?.[index]?.vehicleCategory && (
                    <p className="text-sm text-destructive">
                      {
                        form.formState.errors.fees[index]?.vehicleCategory
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Fee Amount (₦)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register(`fees.${index}.fee`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.fees?.[index]?.fee && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.fees[index]?.fee?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {form.formState.errors.fees && (
            <p className="text-sm text-destructive">
              {form.formState.errors.fees.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Boundary Coordinates */}
      <Card>
        <CardHeader>
          <CardTitle>Boundary Coordinates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="boundary">Boundary JSON</Label>
            <Textarea
              id="boundary"
              value={boundaryText}
              onChange={(e) => setBoundaryText(e.target.value)}
              placeholder="Enter boundary coordinates as GeoJSON"
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Provide boundary coordinates in GeoJSON Polygon format
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Separator />

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Update LGA
        </Button>

        <Button variant="outline" asChild>
          <Link href={`/lgas/${lga.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
