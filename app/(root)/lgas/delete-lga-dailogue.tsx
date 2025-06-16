"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { LGA, hardDeleteLGA, softDeleteLGA } from "@/actions/lga";

interface DeleteLGADialogProps {
  lga: LGA | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteLGADialog({
  lga,
  isOpen,
  onClose,
  onSuccess,
}: DeleteLGADialogProps) {
  const [deleteType, setDeleteType] = useState<"soft" | "hard" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!lga) return null;

  const handleDeleteTypeSelect = (type: "soft" | "hard") => {
    setDeleteType(type);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteType || !lga) return;

    setIsDeleting(true);
    try {
      let result;
      if (deleteType === "soft") {
        result = await softDeleteLGA(lga.id);
      } else {
        result = await hardDeleteLGA(lga.id);
      }

      toast.success("Success", {
        description: result.message,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete LGA",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setDeleteType(null);
    setShowConfirmation(false);
    onClose();
  };

  const isAlreadyDeleted = lga.deletedAt !== null;

  return (
    <>
      {/* Delete Type Selection Dialog */}
      <Dialog open={isOpen && !showConfirmation} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete LGA: {lga.name}
            </DialogTitle>
            <DialogDescription>
              Choose how you want to delete this LGA. This action will affect
              the LGA and its associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* LGA Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">LGA Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{lga.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={isAlreadyDeleted ? "destructive" : "default"}>
                    {isAlreadyDeleted ? "Soft Deleted" : "Active"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Created:
                  </span>
                  <span className="text-sm">
                    {new Date(lga.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {isAlreadyDeleted && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Deleted:
                    </span>
                    <span className="text-sm">
                      {new Date(lga.deletedAt!).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delete Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Soft Delete */}
              {!isAlreadyDeleted && (
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Soft Delete
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Recommended for most cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Mark the LGA as deleted without removing it from the
                      database. This allows for data recovery and maintains
                      referential integrity.
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Can be restored later</li>
                      <li>• Maintains data relationships</li>
                      <li>• Hidden from normal views</li>
                      <li>• Preserves audit trail</li>
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTypeSelect("soft")}
                      className="w-full"
                    >
                      Soft Delete
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Hard Delete */}
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-destructive/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Permanent Delete
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Use with extreme caution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Permanently remove the LGA from the database. This action
                    cannot be undone and may affect related data.
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Cannot be restored</li>
                    <li>• Removes all data permanently</li>
                    <li>• May break data relationships</li>
                    <li>• No audit trail preserved</li>
                  </ul>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTypeSelect("hard")}
                    className="w-full"
                  >
                    Permanent Delete
                  </Button>
                </CardContent>
              </Card>
            </div>

            {isAlreadyDeleted && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Already Soft Deleted
                  </span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  This LGA has already been soft deleted. You can only perform a
                  permanent deletion at this point.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm {deleteType === "soft" ? "Soft" : "Permanent"} Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "soft" ? (
                <>
                  Are you sure you want to soft delete{" "}
                  <strong>{lga.name}</strong>? The LGA will be hidden from
                  normal views but can be restored later if needed.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{" "}
                  <strong>{lga.name}</strong>? This action cannot be undone and
                  will remove all data associated with this LGA.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className={
                deleteType === "hard"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {isDeleting
                ? "Deleting..."
                : `${deleteType === "soft" ? "Soft" : "Permanently"} Delete`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
