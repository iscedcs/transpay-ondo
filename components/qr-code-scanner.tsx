"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Camera,
  X,
  Scan,
  AlertTriangle,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import QrScanner from "qr-scanner";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";

interface QRCodeScannerProps {
  onSuccess: (url: string, vehicleId?: string) => void;
  onError: (error: string, url?: string) => void;
}

export function QRCodeScanner({ onSuccess, onError }: QRCodeScannerProps) {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [scannedHistory, setScannedHistory] = useState<string[]>([]);

  const scannerRef = useRef<QrScanner | null>(null);

  // Load scanned history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("qr-scan-history");
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setScannedHistory(history);
      } catch (error) {
        console.error("Error loading scan history:", error);
      }
    }
  }, []);

  // Extract vehicle ID from URL
  const extractVehicleId = (url: string): string | undefined => {
    try {
      // Handle transpay-edo.vercel.app URLs
      if (
        url.includes("transpay-edo.vercel.app") ||
        url.includes("transpaytms.com")
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

  // Handle successful QR scan
  const handleScanResult = (scannedResult: QrScanner.ScanResult) => {
    const data = scannedResult.data;

    try {
      // Validate URL
      new URL(data);

      const vehicleId = extractVehicleId(data);

      setResult(data);
      setDialogOpen(true);
      setIsScanning(false);
      setScanCount((prev) => prev + 1);

      // Update scan history
      const updatedHistory = [data, ...scannedHistory].slice(0, 50); // Keep only last 50 scans
      setScannedHistory(updatedHistory);
      localStorage.setItem("qr-scan-history", JSON.stringify(updatedHistory));

      // Call success callback
      onSuccess(data, vehicleId);

      // Stop scanner after 10 scans or destroy it
      if (scanCount + 1 >= 10) {
        stopScanning();
      }

      toast.success("QR Code Scanned!", {
        description: "Vehicle information detected successfully",
      });
    } catch (error) {
      const errorMessage = "Invalid QR code format";
      setError(errorMessage);
      onError(errorMessage, data);

      toast.error("Invalid QR Code", {
        description: "The scanned code is not a valid URL",
      });
    }
  };

  // Start QR scanning
  const startScanning = async () => {
    try {
      setError(null);
      setResult(null);
      setDialogOpen(false);
      setIsScanning(true);
      setScanCount(0);

      const videoElement = document.getElementById(
        "qr-video"
      ) as HTMLVideoElement;

      if (!videoElement) {
        throw new Error("Video element not found");
      }

      // Create QR scanner instance with proper constructor
      scannerRef.current = new QrScanner(videoElement, handleScanResult, {
        onDecodeError: (error) => {
          // Silently handle decode errors (normal when no QR code is visible)
          console.debug("QR decode error:", error);
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: "environment", // Use back camera
      });

      // Start scanning
      await scannerRef.current.start();
      console.log("QR Scanner started successfully");
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      setError(
        `Unable to start camera: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsScanning(false);
      onError("Camera access denied");
    }
  };

  // Stop QR scanning
  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
  };

  // Handle manual input
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Create a mock scan result for manual input
    const mockScanResult = { data: manualInput.trim() } as QrScanner.ScanResult;
    handleScanResult(mockScanResult);
    setManualInput("");
  };

  // Handle history item click
  const handleHistoryClick = (item: string) => {
    const mockScanResult = { data: item } as QrScanner.ScanResult;
    handleScanResult(mockScanResult);
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success("Copied!", {
        description: "QR code result copied to clipboard",
      });
    }
  };

  // Navigate to scanned URL
  const navigateToResult = () => {
    if (result) {
      // For internal URLs, use router.push, for external URLs use window.open
      if (
        result.includes("transpay-edo.vercel.app") ||
        result.includes("transpaytms.com")
      ) {
        const path = new URL(result).pathname;
        router.push(path);
      } else {
        window.open(result, "_blank");
      }
      setDialogOpen(false);
    }
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

          <div className="w-full max-w-lg mx-auto">
            <Card className="w-full aspect-square overflow-hidden">
              <video
                id="qr-video"
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </Card>

            <div className="flex gap-2 mt-4">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  className="flex-1 flex items-center gap-2"
                  disabled={scanCount >= 10}
                >
                  <Scan className="h-4 w-4" />
                  Start QR Scanner
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              )}
            </div>

            {scanCount > 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Scanned: {scanCount}/10 codes
              </p>
            )}
          </div>

          {isScanning && (
            <p className="text-sm text-muted-foreground text-center">
              Position the QR code within the camera view to scan automatically
            </p>
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
              placeholder="https://transpay-edo.vercel.app/1749218743615"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            />
          </div>
          <Button onClick={handleManualSubmit} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Process URL
          </Button>
        </CardContent>
      </Card>

      {/* Scan History */}
      {scannedHistory.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scannedHistory.slice(0, 10).map((item: any, index) => {
                  // Handle both string and object formats
                  const url =
                    typeof item === "string"
                      ? item
                      : item.url || item.data || String(item);
                  const timestamp =
                    typeof item === "object" && item.timestamp
                      ? new Date(item.timestamp).toLocaleString()
                      : null;

                  return (
                    <div
                      key={index}
                      className="text-sm p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                      onClick={() => handleHistoryClick(url)}
                    >
                      <div className="font-mono text-xs truncate">{url}</div>
                      {timestamp && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {timestamp}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Success Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle className="sr-only">
          QR Code Scanned Successfully
        </DialogTitle>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="h-16 w-16 text-green-500">
              <CheckCircle className="h-full w-full" />
            </div>

            <div className="text-xl font-semibold text-center">
              QR Code Scanned Successfully
            </div>

            {result && (
              <div className="w-full">
                <Card className="p-3 border border-primary overflow-hidden mb-4">
                  <QRCodeCanvas value={result} size={200} className="mx-auto" />
                </Card>

                <div className="text-center mb-4">
                  <div className="text-sm text-muted-foreground">Result:</div>
                  <div className="text-sm font-mono break-all">{result}</div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>

              <Button
                onClick={navigateToResult}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
