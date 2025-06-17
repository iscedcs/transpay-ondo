"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SimpleImageUploader } from "@/components/simple-image-uploader";
import { Loader2, Save, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { updateVehicle } from "@/actions/vehicles";
import { getVehicleCategories, getVehicleTypes } from "@/lib/constants";

// Permission check
const canEditVehicle = (role: string): boolean => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "LGA_AGENT"];
  return allowedRoles.includes(role);
};

// Validation schema
const vehicleEditSchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Plate number is required")
    .regex(
      /^[A-Z]{2,3}[0-9]{2,3}[A-Z]{2,3}$/,
      "Plate number must be 2-3 letters, 2-3 numbers, 2-3 letters (e.g., ABC123XYZ)"
    )
    .transform((val) => val.toUpperCase()),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  color: z.string().min(1, "Color is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]),
  registeredLgaId: z.string().min(1, "Registered LGA is required"),
  vin: z.string().optional(),
  stateCode: z.string().optional(),
  image: z.string().optional(),
  fairFlexImei: z.string().optional(),
  vCode: z.string().optional(),
  securityCode: z.string().optional(),
  startDate: z.string().optional(),
  groupId: z.string().optional(),
});

type VehicleEditFormData = z.infer<typeof vehicleEditSchema>;

interface VehicleEditFormProps {
  vehicle: any;
  lgas: any[];
}

export function VehicleEditForm({ vehicle, lgas }: VehicleEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(
    vehicle.image || null
  );

  // Mock user role - replace with actual auth
  const userRole = "ADMIN"; // This should come from your auth system

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<VehicleEditFormData>({
    resolver: zodResolver(vehicleEditSchema),
    defaultValues: {
      plateNumber: vehicle.plateNumber || "",
      category: vehicle.category || "",
      type: vehicle.type || "",
      color: vehicle.color || "",
      status: vehicle.status || "ACTIVE",
      registeredLgaId: vehicle.registeredLgaId || "",
      vin: vehicle.vin || "",
      stateCode: vehicle.stateCode || "",
      image: vehicle.image || "",
      fairFlexImei: vehicle.fairFlexImei || "",
      vCode: vehicle.vCode || "",
      securityCode: vehicle.securityCode || "",
      startDate: vehicle.startDate
        ? new Date(vehicle.startDate).toISOString().split("T")[0]
        : "",
      groupId: vehicle.groupId || "",
    },
  });

  // Check permissions
  if (!canEditVehicle(userRole)) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to edit vehicles. Contact your
          administrator.
        </AlertDescription>
      </Alert>
    );
  }

  const onSubmit = async (data: VehicleEditFormData) => {
    startTransition(async () => {
      try {
        // Include the current image URL if it exists
        const updateData = {
          ...data,
          image: imageUrl || undefined,
        };

        const result = await updateVehicle(vehicle.id, updateData);

        if (result) {
          toast.success("Vehicle updated successfully");
          router.push(`/vehicles/${vehicle.id}`);
          router.refresh();
        }
      } catch (error) {
        console.error("Error updating vehicle:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update vehicle"
        );
      }
    });
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setValue("image", url, { shouldDirty: true });
  };

  const handleImageRemove = () => {
    setImageUrl(null);
    setValue("image", "", { shouldDirty: true });
  };

  const vehicleCategories = getVehicleCategories();
  const vehicleTypes = getVehicleTypes();

  const colors = [
    "RED",
    "BLUE",
    "GREEN",
    "YELLOW",
    "BLACK",
    "WHITE",
    "SILVER",
    "GRAY",
    "BROWN",
    "ORANGE",
    "PURPLE",
    "PINK",
    "GOLD",
    "MAROON",
    "NAVY",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plate Number */}
            <div className="space-y-2">
              <Label htmlFor="plateNumber">
                Plate Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plateNumber"
                {...register("plateNumber")}
                placeholder="ABC123XYZ"
                className={errors.plateNumber ? "border-destructive" : ""}
              />
              {errors.plateNumber && (
                <p className="text-sm text-destructive">
                  {errors.plateNumber.message}
                </p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">
                Color <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("color")}
                onValueChange={(value) =>
                  setValue("color", value, { shouldDirty: true })
                }
              >
                <SelectTrigger
                  className={errors.color ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.color && (
                <p className="text-sm text-destructive">
                  {errors.color.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("category")}
                onValueChange={(value) =>
                  setValue("category", value, { shouldDirty: true })
                }
              >
                <SelectTrigger
                  className={errors.category ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) =>
                  setValue("type", value, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) =>
                  setValue("status", value as any, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Registered LGA */}
            <div className="space-y-2">
              <Label htmlFor="registeredLgaId">
                Registered LGA <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("registeredLgaId")}
                onValueChange={(value) =>
                  setValue("registeredLgaId", value, { shouldDirty: true })
                }
              >
                <SelectTrigger
                  className={errors.registeredLgaId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select LGA" />
                </SelectTrigger>
                <SelectContent>
                  {lgas.map((lga) => (
                    <SelectItem key={lga.id} value={lga.id}>
                      {lga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.registeredLgaId && (
                <p className="text-sm text-destructive">
                  {errors.registeredLgaId.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vehicle Image</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleImageUploader
            currentImageUrl={imageUrl}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
          />
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VIN */}
            <div className="space-y-2">
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input
                id="vin"
                {...register("vin")}
                placeholder="Vehicle Identification Number"
              />
            </div>

            {/* State Code */}
            <div className="space-y-2">
              <Label htmlFor="stateCode">State Code (Optional)</Label>
              <Input
                id="stateCode"
                {...register("stateCode")}
                placeholder="State registration code"
              />
            </div>

            {/* FairFlex IMEI */}
            <div className="space-y-2">
              <Label htmlFor="fairFlexImei">FairFlex IMEI</Label>
              <Input
                id="fairFlexImei"
                {...register("fairFlexImei")}
                placeholder="FairFlex device IMEI"
              />
            </div>

            {/* V Code */}
            <div className="space-y-2">
              <Label htmlFor="vCode">V Code</Label>
              <Input
                id="vCode"
                {...register("vCode")}
                placeholder="Vehicle code"
              />
            </div>

            {/* Security Code */}
            <div className="space-y-2">
              <Label htmlFor="securityCode">Security Code</Label>
              <Input
                id="securityCode"
                {...register("securityCode")}
                placeholder="Security code"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Information */}
      {vehicle.barcode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Barcode Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Current Barcode</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.barcode.code}
                </p>
              </div>
              <Badge>Scanning Only</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Barcode can only be updated through scanning. Visit the vehicle
              details page to scan a new barcode.
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
