"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  X,
  Scan,
  AlertTriangle,
  ExternalLink,
  Flashlight,
} from "lucide-react";
import { toast } from "sonner";

interface QRCodeScannerProps {
  onSuccess: (url: string, vehicleId?: string) => void;
  onError: (error: string, url?: string) => void;
}

export function QRCodeScanner({ onSuccess, onError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [lastScannedUrl, setLastScannedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract vehicle ID from URL
  const extractVehicleId = (url: string): string | undefined => {
    try {
      if (
        url.includes("transpay-edo.vercel.app") ||
        url.includes("transpayedo.com")
      ) {
        const parts = url.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length > 0) {
          return lastPart;
        }
      }
      return undefined;
    } catch (error) {
      console.error("Error extracting vehicle ID:", error);
      return undefined;
    }
  };

  // Validate and process scanned URL
  const processScannedData = (data: string) => {
    try {
      // Prevent duplicate scans
      if (data === lastScannedUrl) {
        return;
      }

      setLastScannedUrl(data);

      // Try to create URL object to validate
      const url = new URL(data);
      const vehicleId = extractVehicleId(data);

      toast.success("QR Code Scanned!", {
        description: "Redirecting to vehicle information...",
      });

      onSuccess(data, vehicleId);

      // Stop scanning after successful scan
      stopScanning();
    } catch (error) {
      const errorMessage = "Invalid QR code format";
      setError(errorMessage);
      onError(errorMessage, data);

      toast.error("Invalid QR Code", {
        description: "The scanned code is not a valid URL",
      });
    }
  };

  // Start camera for scanning
  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      setLastScannedUrl("");

      const constraints = {
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if flashlight is available
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      setHasFlashlight("torch" in capabilities);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start QR code detection
        startQRDetection();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError(
        "Unable to access camera. Please check permissions or enter URL manually."
      );
      setIsScanning(false);
      onError("Camera access denied");
    }
  };

  // Toggle flashlight
  const toggleFlashlight = async () => {
    if (!streamRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      await videoTrack.applyConstraints({
        // @ts-expect-error: don't know the error
        advanced: [{ torch: !flashlightOn }],
      });
      setFlashlightOn(!flashlightOn);
    } catch (error) {
      console.error("Error toggling flashlight:", error);
    }
  };

  // Start QR code detection using canvas
  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);

          // Try to detect QR code using browser's built-in detector
          if ("BarcodeDetector" in window) {
            const detector = new (window as any).BarcodeDetector({
              formats: ["qr_code"],
            });
            detector
              .detect(canvas)
              .then((barcodes: any[]) => {
                if (barcodes.length > 0) {
                  processScannedData(barcodes[0].rawValue);
                }
              })
              .catch((error: any) => {
                // Silently handle detection errors
                console.debug("QR detection error:", error);
              });
          }
        }
      }
    }, 500); // Check every 500ms
  };

  // Stop camera and detection
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    setIsScanning(false);
    setFlashlightOn(false);
    setLastScannedUrl("");
  };

  // Handle manual input
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError("Please enter a URL");
      return;
    }

    processScannedData(manualInput.trim());
    setManualInput("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="w-full flex items-center gap-2"
            >
              <Scan className="h-4 w-4" />
              Start QR Scanner
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-black rounded-lg object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
                </div>

                {/* Flashlight toggle */}
                {hasFlashlight && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={toggleFlashlight}
                  >
                    <Flashlight
                      className={`h-4 w-4 ${
                        flashlightOn ? "text-yellow-500" : ""
                      }`}
                    />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Position the QR code within the frame to scan automatically
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Manual Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Manual Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-url">Enter QR Code URL</Label>
            <Input
              id="manual-url"
              placeholder="https://transpayedo.com/1749218743615"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            />
          </div>
          <Button onClick={handleManualSubmit} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open URL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
