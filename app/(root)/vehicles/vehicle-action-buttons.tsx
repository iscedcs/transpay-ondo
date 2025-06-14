"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Eye, Ban, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Vehicle } from "@/actions/vehicles";

interface VehicleActionButtonsProps {
  vehicle: Vehicle;
  onVehicleUpdate?: () => void;
}

export function VehicleActionButtons({
  vehicle,
  onVehicleUpdate,
}: VehicleActionButtonsProps) {
  const router = useRouter();
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    router.push(`/vehicles/${vehicle.id}/edit`);
  };

  const handleView = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  const handleBlacklist = async () => {
    setIsLoading(true);
    try {
      //   await toggleVehicleBlacklist(vehicle.id, !vehicle.blacklisted);
      toast.success("Success", {
        description: `Vehicle ${
          vehicle.blacklisted ? "removed from blacklist" : "blacklisted"
        } successfully`,
      });
      onVehicleUpdate?.();
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update vehicle status",
      });
    } finally {
      setIsLoading(false);
      setShowBlacklistDialog(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <Button size={"icon"} variant={"ghost"} onClick={handleView}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button size={"icon"} variant={"ghost"} onClick={handleEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => setShowBlacklistDialog(true)}
        >
          {vehicle.blacklisted ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Ban className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Blacklist Confirmation Dialog */}
      <AlertDialog
        open={showBlacklistDialog}
        onOpenChange={setShowBlacklistDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {vehicle.blacklisted
                ? "Remove from Blacklist"
                : "Blacklist Vehicle"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {vehicle.blacklisted
                ? `This will remove vehicle ${vehicle.plateNumber} from the blacklist and restore its access to the system.`
                : `This will blacklist vehicle ${vehicle.plateNumber} and restrict its access to the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlacklist} disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : vehicle.blacklisted
                ? "Remove from Blacklist"
                : "Blacklist Vehicle"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
