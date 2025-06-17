"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeScanner } from "@/components/qr-code-scanner";
import { ScanHistory } from "@/components/scan-history";
import { Scan, History, QrCode } from "lucide-react";

export interface ScanRecord {
  id: string;
  url: string;
  vehicleId?: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState("scanner");
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

  // Load scan history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("qr-scan-history");
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setScanHistory(history);
      } catch (error) {
        console.error("Error loading scan history:", error);
      }
    }
  }, []);

  // Save scan record to localStorage
  const saveScanRecord = (record: Omit<ScanRecord, "id" | "timestamp">) => {
    const newRecord: ScanRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updatedHistory = [newRecord, ...scanHistory].slice(0, 100); // Keep only last 100 scans
    setScanHistory(updatedHistory);
    localStorage.setItem("qr-scan-history", JSON.stringify(updatedHistory));
  };

  // Handle successful QR code scan
  const handleScanSuccess = (url: string, vehicleId?: string) => {
    try {
      // Validate URL
      new URL(url);

      // Save to history
      saveScanRecord({
        url,
        vehicleId,
        success: true,
      });

      // Redirect to the scanned URL
      window.open(url, "_blank");
    } catch (error) {
      // Save failed scan to history
      saveScanRecord({
        url,
        vehicleId,
        success: false,
        error: "Invalid URL format",
      });
    }
  };

  // Handle scan error
  const handleScanError = (error: string, url?: string) => {
    if (url) {
      saveScanRecord({
        url,
        success: false,
        error,
      });
    }
  };

  // Clear scan history
  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem("qr-scan-history");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <QrCode className="h-8 w-8" />
          QR Code Scanner
        </h1>
        <p className="text-muted-foreground mt-2">
          Scan vehicle sticker QR codes to access vehicle information
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History ({scanHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="mt-6">
          <QRCodeScanner
            onSuccess={handleScanSuccess}
            onError={handleScanError}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ScanHistory
            history={scanHistory}
            onClearHistory={clearHistory}
            onRescan={(url) => {
              handleScanSuccess(url);
              setActiveTab("scanner");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
