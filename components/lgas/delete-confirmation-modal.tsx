"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import type { LGA } from "@/types/lga";

interface DeleteConfirmationModalProps {
  lga: LGA | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lgaId: string, hardDelete: boolean) => Promise<void>;
}

export function DeleteConfirmationModal({
  lga,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [hardDelete, setHardDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!lga) return;

    setIsLoading(true);
    try {
      await onConfirm(lga.id, hardDelete);
      onClose();
      setHardDelete(false);
    } catch (error) {
      // NOTE: Optionally, you can show an error toast or message here
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setHardDelete(false);
    onClose();
  };

  if (!lga) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete LGA: {lga.name}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              You are about to delete the LGA "{lga.name}". This action will
              affect:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{lga.agentCount || 0} assigned agents</li>
              <li>{lga.vehicleCount || 0} registered vehicles</li>
              <li>{lga.scanCount || 0} compliance scan records</li>
              <li>All associated routes and boundaries</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hard-delete"
                  checked={hardDelete}
                  // onCheckedChange={setHardDelete}
                />
                <label htmlFor="hard-delete" className="text-sm font-medium">
                  Permanently delete (Hard Delete)
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {hardDelete
                  ? "This will permanently remove all data and cannot be undone."
                  : "This will soft delete the LGA, allowing recovery later."}
              </p>
            </div>

            <p className="text-sm font-medium text-red-600">
              {hardDelete
                ? "This action cannot be undone!"
                : "Are you sure you want to proceed?"}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              hardDelete
                ? "bg-red-600 hover:bg-red-700"
                : "bg-yellow-600 hover:bg-yellow-700"
            }
          >
            {isLoading
              ? "Deleting..."
              : hardDelete
              ? "Permanently Delete"
              : "Soft Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
