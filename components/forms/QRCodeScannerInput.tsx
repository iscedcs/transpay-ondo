"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog";
import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { CameraIcon, QrCodeIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { QrReader } from "react-qr-reader";

interface QRCodeScannerInputProps<
     TFieldValues extends FieldValues = FieldValues,
     TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
     form: UseFormReturn<TFieldValues>;
     name: TName;
}

interface Camera {
     deviceId: string;
     label: string;
}

export default function QRCodeScannerInput<
     TFieldValues extends FieldValues = FieldValues,
     TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ form, name }: QRCodeScannerInputProps<TFieldValues, TName>) {
     const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
     const [cameras, setCameras] = useState<Camera[]>([]);
     const [selectedCamera, setSelectedCamera] = useState<string>("");

     const getCameras = useCallback(async () => {
       try {
         const devices = await navigator.mediaDevices.enumerateDevices();
         const videoDevices = devices.filter(
           (device) => device.kind === "videoinput"
         );
         setCameras(
           videoDevices.map((device) => ({
             deviceId: device.deviceId,
             label: device.label,
           }))
         );
         if (videoDevices.length > 0) {
           setSelectedCamera(videoDevices[0].deviceId);
         }
       } catch (error) {
         setCameras([]);
         setSelectedCamera("");
       }
     }, []);

     useEffect(() => {
       getCameras();
     }, [getCameras]);

     const extractIdFromUrl = (url: string): string => {
       const match = url.match(/\/status\/(\d+)\/?$/);
       return match ? match[1] : "";
     };

     const handleScan = useCallback(
       (result: { text: string } | null | undefined) => {
         if (result?.text) {
           const extractedId = extractIdFromUrl(result.text);
           if (extractedId) {
             form.setValue(name, extractedId as any);
             setIsDialogOpen(false);
           }
         }
       },
       [form, name]
     );

     const handleError = (error: Error) => {
       // TODO: Optionally, you can show an error message to the user
       // NOTE: toast.error("Failed to scan QR code. Please try again.");
     };

     const handleCameraChange = (deviceId: string) => {
          setSelectedCamera(deviceId);
     };

     const handleDialogClose = useCallback(() => {
          setIsDialogOpen(false);
     }, []);

     return (
          <FormField
               name={name}
               control={form.control}
               render={({ field }) => (
                    <FormItem>
                         <FormLabel
                              className="text-base font-semibold"
                              htmlFor={name}
                         >
                              Sticker Number
                         </FormLabel>
                         <FormControl>
                              <div className="relative">
                                   <Input
                                        id={name}
                                        className="h-14 rounded-lg pl-10 pr-4 text-lg"
                                        {...field}
                                        disabled
                                        placeholder="Scan QR code"
                                        value={field.value || ""}
                                        aria-readonly="true"
                                   />
                                   <QrCodeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                   {!field.value && (
                                        <Button
                                             type="button"
                                             onClick={() =>
                                                  setIsDialogOpen(true)
                                             }
                                             className="absolute right-2 top-1/2 -translate-y-1/2 transform"
                                             aria-label="Scan QR Code"
                                        >
                                             Scan QR
                                        </Button>
                                   )}
                              </div>
                         </FormControl>
                         {/* {field.value && (
                              <Button
                                   type="button"
                                   onClick={() => form.setValue(name, "")}
                                   variant="outline"
                                   size="sm"
                                   className="mt-2"
                              >
                                   Clear
                              </Button>
                         )} */}
                         <FormMessage />

                         <Dialog
                              open={isDialogOpen}
                              onOpenChange={handleDialogClose}
                         >
                              <DialogContent className="sm:max-w-md">
                                   <DialogHeader>
                                        <DialogTitle>Scan QR Code</DialogTitle>
                                   </DialogHeader>
                                   <Card className="mx-auto w-full max-w-md">
                                        <CardContent className="space-y-4 p-6">
                                             <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-primary shadow-lg">
                                                  {isDialogOpen && (
                                                       <QrReader
                                                            // @ts-ignore
                                                            onResult={
                                                                 handleScan
                                                            }
                                                            onError={
                                                                 handleError
                                                            }
                                                            constraints={{
                                                                 deviceId:
                                                                      selectedCamera,
                                                                 facingMode:
                                                                      "environment",
                                                            }}
                                                            className="absolute inset-0 h-full w-full object-cover"
                                                       />
                                                  )}
                                                  <div className="pointer-events-none absolute inset-0 border-[3rem] border-black/20" />
                                                  <div className="absolute inset-0 flex items-center justify-center">
                                                       <div className="h-1/2 w-1/2 rounded-lg border-2 border-white/50" />
                                                  </div>
                                             </div>
                                             <Select
                                                  onValueChange={
                                                       handleCameraChange
                                                  }
                                                  value={selectedCamera}
                                             >
                                                  <SelectTrigger className="w-full">
                                                       <CameraIcon className="mr-2 h-4 w-4" />
                                                       <SelectValue placeholder="Select Camera" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                       {cameras.map(
                                                            (camera) => (
                                                                 <SelectItem
                                                                      key={
                                                                           camera.deviceId
                                                                      }
                                                                      value={
                                                                           camera.deviceId
                                                                      }
                                                                 >
                                                                      {camera.label ||
                                                                           `Camera ${cameras.indexOf(camera) + 1}`}
                                                                 </SelectItem>
                                                            ),
                                                       )}
                                                  </SelectContent>
                                             </Select>
                                             <Button
                                                  type="button"
                                                  onClick={handleDialogClose}
                                                  className="w-full"
                                                  variant="secondary"
                                             >
                                                  Cancel Scanning
                                             </Button>
                                        </CardContent>
                                   </Card>
                              </DialogContent>
                         </Dialog>
                    </FormItem>
               )}
          />
     );
}
