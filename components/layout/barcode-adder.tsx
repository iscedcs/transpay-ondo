import ScanToAddSticker from "@/components/pages/agents/scan-to-add-sticker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Scan } from "lucide-react";

export default function BarcodeAdder({ id }: { id: string }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Scan className="h-4 w-4" />
            Add Barcode
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan Sticker QR </DialogTitle>
            <DialogDescription>
              Point your camera to the sticker barcode to scan and add.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid place-items-center gap-4">
              <ScanToAddSticker id={id} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
