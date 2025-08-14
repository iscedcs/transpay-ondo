"use client";

import {
  attachStickerToVehicle,
  getAllStickers,
  type Sticker,
} from "@/actions/stickers";
import { type Vehicle } from "@/actions/vehicles";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import BarcodeAdder from "../layout/barcode-adder";

interface NotificationAddStickersProps {
  vehicle: Vehicle;
}

interface StickersData {
  stickers: Sticker[];
  stats: {
    total: number;
    used: number;
    available: number;
    deleted: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function NotificationAddStickers({
  vehicle,
}: NotificationAddStickersProps) {
  const [data, setData] = useState<StickersData | null>(null);
  const [cancel, setCancel] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [vehicleId, setVehicleId] = useState(vehicle.id);

  const now = new Date();

  const router = useRouter();

  const handleAssignSticker = async () => {
    if (!selectedSticker || !vehicleId) return;

    setAssignLoading(true);
    try {
      const result = await attachStickerToVehicle(selectedSticker, vehicleId);

      if (result.success) {
        toast.success("Sticker assigned", {
          description: `Sticker ${selectedSticker} assigned to vehicle successfully`,
        });
        setAssignDialogOpen(false);
        setSelectedSticker("");
        setVehicleId("");
        router.refresh();
      } else {
        toast.error("Assignment failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Assignment failed", {
        description: "Failed to assign sticker",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    loadStickers();
  }, []);

  const loadStickers = async () => {
    // setLoading(true);
    try {
      const result = await getAllStickers({
        status: "available",
        limit: 20,
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error("Error loading stickers", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error loading stickers", {
        description: "Failed to load stickers",
      });
    } finally {
      //   setLoading(false);
    }
  };

  return (
    <div>
      {!vehicle.barcode?.code && !cancel && (
        <Card className="py-[20px] gap-5 flex md:flex-row md:text-left flex-col text-center items-center px-[30px] bg-red-700/25">
          <div className="w-[40px] flex items-center justify-center h-[40px] rounded-full text-white bg-red-700">
            <IoClose className="w-[20px] h-[20px]" />
          </div>
          <div className="flex gap-5 items-center md:flex-row flex-col w-full justify-between">
            <div>
              <p className="font-bold">Next Steps?</p>
              <p>Assign a sticker to this vehicle</p>
            </div>
            <div className="flex gap-3">
              <BarcodeAdder id={vehicle.id} />
              <Button onClick={() => setCancel(true)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Sticker to Vehicle</DialogTitle>
            <DialogDescription>
              Assign sticker to this vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-id">Vehicle ID</Label>
              <Input
                id="vehicle-id"
                placeholder="Enter vehicle ID"
                disabled
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-id">
                Available Stickers (Showing 20){" "}
              </Label>
              {/* <Input
                id="vehicle-id"
                placeholder="Enter vehicle ID"
                disabled
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              /> */}
              <Select onValueChange={(e) => setSelectedSticker(e)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sticker" />
                </SelectTrigger>
                <SelectContent>
                  {data?.stickers.map((sticker) => (
                    <SelectItem key={sticker.id} value={sticker.code}>
                      {sticker.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                disabled={assignLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignSticker}
                disabled={!vehicleId || assignLoading}
              >
                {assignLoading ? "Assigning..." : "Assign Sticker"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
