"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Camera, X, Check, AlertTriangle, Scan } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  vehicleId: string;
  onSuccess: (barcode: string) => void;
  onCancel: () => void;
}

export function BarcodeScanner({
  vehicleId,
  onSuccess,
  onCancel,
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [extractedBarcode, setExtractedBarcode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Extract barcode from URL
  const extractBarcodeFromUrl = (url: string): string | null => {
    try {
      if (url.includes(String(process.env.NEXT_PUBLIC_APP_URL))) {
        const parts = url.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length > 0) {
          return lastPart;
        }
      }

      // Handle transpaytms.com URLs
      if (url.includes("transpaytms.com")) {
        const parts = url.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length > 0) {
          return lastPart;
        }
      }

      // Handle direct barcode numbers
      const barcodeMatch = url.match(/\d{10,}/g);
      if (barcodeMatch) {
        return barcodeMatch[0];
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Start camera for scanning
  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setError(
        "Unable to access camera. Please check permissions or enter barcode manually."
      );
      setIsScanning(false);
    }
  };

  // Stop camera
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle manual barcode input
  const handleManualInput = (value: string) => {
    setManualBarcode(value);
    setError(null);

    // Try to extract barcode if it looks like a URL
    if (value.includes("http") || value.includes("transpay")) {
      const extracted = extractBarcodeFromUrl(value);
      if (extracted) {
        setExtractedBarcode(extracted);
      } else {
        setExtractedBarcode("");
      }
    } else {
      setExtractedBarcode("");
    }
  };

  // Submit barcode
  const handleSubmit = async () => {
    const barcodeToSubmit = extractedBarcode || manualBarcode;

    if (!barcodeToSubmit) {
      setError("Please enter a valid barcode or URL");
      return;
    }

    // Validate barcode format (should be numeric and reasonable length)
    if (!/^\d{10,}$/.test(barcodeToSubmit)) {
      setError("Barcode should be a numeric value with at least 10 digits");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/barcode/attach-vehicle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: barcodeToSubmit,
          vehicleId: vehicleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to attach barcode to vehicle"
        );
      }

      toast.success("Success", {
        description: "Barcode attached to vehicle successfully",
      });

      onSuccess(barcodeToSubmit);

      // Refresh the page to show the updated vehicle
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to attach barcode"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Add Vehicle Barcode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera Scanner */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Scan QR Code</Label>
          {!isScanning ? (
            <Button
              onClick={startScanning}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Start Camera Scanner
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 bg-black rounded-lg object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white rounded-lg"></div>
                </div>
              </div>
              <Button
                onClick={stopScanning}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Stop Scanner
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Position the QR code within the frame to scan
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Manual Input */}
        <div className="space-y-3">
          <Label htmlFor="barcode" className="text-sm font-medium">
            Or Enter Manually
          </Label>
          <Input
            id="barcode"
            placeholder={`Enter barcode or URL (e.g., ${process.env.NEXT_PUBLIC_APP_URL}}1749218743615)`}
            value={manualBarcode}
            onChange={(e) => handleManualInput(e.target.value)}
            className="font-mono"
          />
          {extractedBarcode && (
            <div className="text-xs text-muted-foreground">
              Extracted barcode:{" "}
              <span className="font-mono font-medium">{extractedBarcode}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Scan Barcode"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
