"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { Car, Search, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import {
  addVehicleExemption,
  removeVehicleExemption,
  checkVehicleExemption,
} from "@/actions/vehicle-settings";
import {
  vehicleExemptionSchema,
  type VehicleExemptionFormData,
} from "@/lib/validations/vehicle-settings";
import type { VehicleExemptionStatus } from "@/types/vehicle-settings";

interface VehicleExemptionDialogProps {
  onSuccess: () => void;
}

export function VehicleExemptionDialog({
  onSuccess,
}: VehicleExemptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(false);
  const [exemptionStatus, setExemptionStatus] =
    useState<VehicleExemptionStatus | null>(null);

  const form = useForm<VehicleExemptionFormData>({
    resolver: zodResolver(vehicleExemptionSchema),
    defaultValues: {
      vehicleId: "",
    },
  });

  const checkExemptionStatus = async (vehicleId: string) => {
    if (!vehicleId.trim()) return;

    setIsChecking(true);
    try {
      const result = await checkVehicleExemption(vehicleId);
      if (result.success) {
        setExemptionStatus(result.data!);
      } else {
        toast.error(result.error || "Failed to check exemption status");
        setExemptionStatus(null);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to check exemption status"
      );
      setExemptionStatus(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddExemption = async (vehicleId: string) => {
    startTransition(async () => {
      try {
        const result = await addVehicleExemption(vehicleId);
        if (result.success) {
          toast.success("Vehicle exemption added successfully");
          await checkExemptionStatus(vehicleId); // Refresh status
          onSuccess();
        } else {
          toast.error(result.error || "Failed to add exemption");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add exemption"
        );
      }
    });
  };

  const handleRemoveExemption = async (vehicleId: string) => {
    startTransition(async () => {
      try {
        const result = await removeVehicleExemption(vehicleId);
        if (result.success) {
          toast.success("Vehicle exemption removed successfully");
          await checkExemptionStatus(vehicleId); // Refresh status
          onSuccess();
        } else {
          toast.error(result.error || "Failed to remove exemption");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove exemption"
        );
      }
    });
  };

  const onSubmit = async (data: VehicleExemptionFormData) => {
    await checkExemptionStatus(data.vehicleId);
  };

  const handleClose = () => {
    setOpen(false);
    setExemptionStatus(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Shield className="h-4 w-4" />
          Manage Exemptions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle CVOF Exemption
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle ID</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Enter vehicle UUID..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setExemptionStatus(null); // Clear status when ID changes
                        }}
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={isChecking || !field.value.trim()}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Exemption Status Display */}
        {exemptionStatus && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {exemptionStatus.isExempted ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldX className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Exemption Status</span>
              </div>
              <Badge
                variant={exemptionStatus.isExempted ? "outline" : "destructive"}
              >
                {exemptionStatus.isExempted ? "Exempted" : "Not Exempted"}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Vehicle ID:</strong> {exemptionStatus.vehicleId}
              </p>
              <p>
                <strong>Reason:</strong> {exemptionStatus.reason}
              </p>
              <p>
                <strong>Type:</strong> {exemptionStatus.exemptionType}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {exemptionStatus.isExempted ? (
                <Button
                  onClick={() =>
                    handleRemoveExemption(exemptionStatus.vehicleId)
                  }
                  disabled={isPending}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  {isPending ? "Removing..." : "Remove Exemption"}
                </Button>
              ) : (
                <Button
                  onClick={() => handleAddExemption(exemptionStatus.vehicleId)}
                  disabled={isPending}
                  size="sm"
                  className="flex-1"
                >
                  {isPending ? "Adding..." : "Add Exemption"}
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} size="sm">
                Close
              </Button>
            </div>
          </div>
        )}

        {isChecking && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Checking exemption status...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
