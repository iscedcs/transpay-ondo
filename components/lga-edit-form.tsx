"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { type LGA, updateLGAFee } from "@/actions/lga";
import { TransactionCategories } from "@prisma/client";

// Vehicle categories enum
const VEHICLE_CATEGORIES = Object.keys(TransactionCategories);
// Fee interface
interface VehicleFee {
  vehicleCategory: (typeof VEHICLE_CATEGORIES)[number];
  fee: number;
}

// Individual fee update schema
const feeUpdateSchema = z.object({
  vehicleCategory: z.nativeEnum(TransactionCategories),
  fee: z.number().min(0, "Fee must be positive").max(1000000, "Fee too high"),
});

type FeeUpdateData = z.infer<typeof feeUpdateSchema>;

interface LGAEditFormProps {
  lga: LGA;
}

export function LGAEditForm({ lga }: LGAEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingFees, setEditingFees] = useState<Record<string, boolean>>({});
  const [showAddFee, setShowAddFee] = useState(false);

  // Parse the fee data if it's a string
  const parseFees = (feeData: string | VehicleFee[]): VehicleFee[] => {
    if (typeof feeData === "string") {
      try {
        return JSON.parse(feeData);
      } catch (error) {
        return [];
      }
    }
    return Array.isArray(feeData) ? feeData : [];
  };

  const currentFees = parseFees(lga.fee);

  // Get available categories for adding new fees
  const getAvailableCategories = () => {
    const usedCategories = currentFees.map((fee) => fee.vehicleCategory);
    return VEHICLE_CATEGORIES.filter(
      (category) => !usedCategories.includes(category)
    );
  };

  // Form for adding new fee
  const addFeeForm = useForm<FeeUpdateData>({
    resolver: zodResolver(feeUpdateSchema),
    defaultValues: {
      vehicleCategory: "TRICYCLE",
      fee: 0,
    },
  });

  // Update individual fee
  const updateFee = async (vehicleCategory: string, newFee: number) => {
    startTransition(async () => {
      try {
        const result = await updateLGAFee(lga.id, vehicleCategory, newFee);

        if (result.success) {
          toast.success("Fee Updated", {
            description: `${vehicleCategory.replace(
              /_/g,
              " "
            )} fee updated to ₦${newFee.toLocaleString()}`,
          });
          setEditingFees((prev) => ({ ...prev, [vehicleCategory]: false }));
          router.refresh();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast.error("Update Failed", {
          description:
            error instanceof Error ? error.message : "Failed to update fee",
        });
      }
    });
  };

  // Add new fee
  const addNewFee = async (data: FeeUpdateData) => {
    startTransition(async () => {
      try {
        const result = await updateLGAFee(
          lga.id,
          data.vehicleCategory,
          data.fee
        );

        if (result.success) {
          toast.success("Fee Added", {
            description: `${data.vehicleCategory.replace(
              /_/g,
              " "
            )} fee set to ₦${data.fee.toLocaleString()}`,
          });
          setShowAddFee(false);
          addFeeForm.reset();
          router.refresh();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast.error("Add Failed", {
          description:
            error instanceof Error ? error.message : "Failed to add fee",
        });
      }
    });
  };

  // Individual fee row component
  const FeeRow = ({ fee }: { fee: VehicleFee }) => {
    const [tempFee, setTempFee] = useState(fee.fee);
    const isEditing = editingFees[fee.vehicleCategory];

    const handleSave = () => {
      if (tempFee !== fee.fee) {
        updateFee(fee.vehicleCategory, tempFee);
      } else {
        setEditingFees((prev) => ({ ...prev, [fee.vehicleCategory]: false }));
      }
    };

    const handleCancel = () => {
      setTempFee(fee.fee);
      setEditingFees((prev) => ({ ...prev, [fee.vehicleCategory]: false }));
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Vehicle Category</Label>
          <div className="flex h-10 items-center px-3 py-2 text-sm bg-muted rounded-md">
            {fee.vehicleCategory.replace(/_/g, " ")}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Fee (₦)</Label>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={tempFee}
              onChange={(e) => setTempFee(Number(e.target.value))}
              placeholder="0.00"
              className="w-full"
            />
          ) : (
            <div className="flex h-10 items-center px-3 py-2 text-sm bg-muted rounded-md">
              ₦{fee.fee.toLocaleString()}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Actions</Label>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setEditingFees((prev) => ({
                    ...prev,
                    [fee.vehicleCategory]: true,
                  }))
                }
                className="w-full"
              >
                Edit Fee
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex h-10 items-center px-3 py-2 text-sm">
            {isEditing ? (
              <span className="text-orange-600">Editing...</span>
            ) : (
              <span className="text-green-600">Active</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/lgas/${lga.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to LGA
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{lga.name}</h1>
          <p className="text-muted-foreground">Edit vehicle category fees</p>
        </div>
      </div>

      {/* Current Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Category Fees</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddFee(true)}
              disabled={getAvailableCategories().length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentFees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No fees configured for this LGA
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAddFee(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Fee
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentFees.map((fee) => (
                <FeeRow key={fee.vehicleCategory} fee={fee} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Fee Form */}
      {showAddFee && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Fee Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={addFeeForm.handleSubmit(addNewFee)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Category</Label>
                  <select
                    {...addFeeForm.register("vehicleCategory")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {getAvailableCategories().map((category) => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {addFeeForm.formState.errors.vehicleCategory && (
                    <p className="text-sm text-destructive">
                      {addFeeForm.formState.errors.vehicleCategory.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Fee Amount (₦)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...addFeeForm.register("fee", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {addFeeForm.formState.errors.fee && (
                    <p className="text-sm text-destructive">
                      {addFeeForm.formState.errors.fee.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Add Fee
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddFee(false);
                    addFeeForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{currentFees.length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₦
                {currentFees
                  .reduce((sum, fee) => sum + fee.fee, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Fees</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₦
                {currentFees.length > 0
                  ? Math.round(
                      currentFees.reduce((sum, fee) => sum + fee.fee, 0) /
                        currentFees.length
                    ).toLocaleString()
                  : 0}
              </p>
              <p className="text-sm text-muted-foreground">Average Fee</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {getAvailableCategories().length}
              </p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
