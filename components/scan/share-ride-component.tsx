"use client";

import { Vehicle } from "@/actions/vehicles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScanLocation } from "@/types/scan";
import { Clock, MapPin, MessageCircle, Share2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareRideComponentProps {
  vehicle: Vehicle;
  scanLocation: ScanLocation;
}

export function ShareRideComponent({
  vehicle,
  scanLocation,
}: ShareRideComponentProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (platform: string) => {
    setIsSharing(true);

    const shareText = `🚗 Verified Transport: ${
      vehicle.plateNumber
    }\n✅ Registered with TransPay\n📍 Location: ${scanLocation.latitude.toFixed(
      4
    )}, ${scanLocation.longitude.toFixed(
      4
    )}\n\nSafe travels! #TransPay #VerifiedTransport`;

    try {
      if (platform === "native" && navigator.share) {
        await navigator.share({
          title: "Verified Vehicle - TransPay",
          text: shareText,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success("Vehicle info copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to share vehicle information");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRateRide = () => {
    toast.info("Ride rating feature coming soon!");
  };

  const handleReportSafety = () => {
    toast.info("Safety reporting feature coming soon!");
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <Share2 className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl text-blue-700">Share Your Ride</CardTitle>
        <p className="text-sm text-muted-foreground">
          Let others know you're using verified transport
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ride Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold">Current Location</p>
              <p className="text-sm text-muted-foreground">
                {scanLocation.latitude.toFixed(4)},{" "}
                {scanLocation.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="font-medium text-sm">Scanned</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            {/* <div className="p-3 bg-purple-50 rounded-lg text-center">
              <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="font-medium text-sm">Capacity</p>
              <p className="text-xs text-muted-foreground">
                {vehicle.category === "BUS_INTERSTATE" ? "14+ seats" : "4 seats"}
              </p>
            </div> */}
          </div>
        </div>

        {/* Safety Features */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Why Share This Ride?
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 text-xs"
              >
                Verified
              </Badge>
              <span>Government registered vehicle</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 text-xs"
              >
                Tracked
              </Badge>
              <span>Real-time location monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 text-xs"
              >
                Licensed
              </Badge>
              <span>Authorized commercial transport</span>
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold">Share Options</h3>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShare("native")}
              disabled={isSharing}
              variant="outline"
              className="h-auto p-3 flex flex-col gap-1"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs">Share Info</span>
            </Button>

            <Button
              onClick={() => handleShare("whatsapp")}
              disabled={isSharing}
              variant="outline"
              className="h-auto p-3 flex flex-col gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
        </div>

        {/* Community Actions */}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold">Community Safety</h3>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleRateRide}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Star className="w-3 h-3 mr-1" />
              Rate Ride
            </Button>

            <Button
              onClick={handleReportSafety}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Report Issue
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Safety Tip:</strong> Always verify the plate number matches
            before boarding. Share your location with trusted contacts when
            traveling.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
