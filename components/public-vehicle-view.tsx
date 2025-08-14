"use client";
import { Vehicle } from "@/actions/vehicles";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Calendar,
  Car,
  CheckCircle,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Share2,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PublicVehicleViewProps {
  vehicle: Vehicle;
  qrId: string;
}

export function PublicVehicleView({ vehicle, qrId }: PublicVehicleViewProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatVehicleStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get vehicle status info
  const getVehicleStatusInfo = (vehicle: Vehicle) => {
    if (vehicle.deletedAt)
      return {
        label: "Deleted",
        variant: "destructive" as const,
        color: "text-red-600",
      };
    if (vehicle.blacklisted)
      return {
        label: "Blacklisted",
        variant: "destructive" as const,
        color: "text-red-600",
      };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "ACTIVE":
          return "default" as const;
        case "INACTIVE":
          return "secondary" as const;
        case "SUSPENDED":
          return "destructive" as const;
        default:
          return "outline" as const;
      }
    };

    return {
      label: formatVehicleStatus(vehicle.status),
      variant: getStatusColor(vehicle.status),
      color: vehicle.status === "ACTIVE" ? "text-green-600" : "text-orange-600",
    };
  };

  const statusInfo = getVehicleStatusInfo(vehicle);

  // Generate share URL
  const shareUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/${qrId}`;

  // Generate share text
  const shareText = `Check out this vehicle information: ${
    vehicle.plateNumber
  } - ${formatVehicleStatus(vehicle.category)}`;

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.info("Copied!", {
        description: "Link copied to clipboard",
      });
      setShareDialogOpen(false);
    } catch (err) {
      toast.error("Error", {
        description: "Failed to copy to clipboard",
      });
    }
  };

  // Share via Web Share API
  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vehicle Info - ${vehicle.plateNumber}`,
          text: shareText,
          url: shareUrl,
        });
        setShareDialogOpen(false);
      } catch (err) {
        // NOTE: User cancelled or error occurred
      }
    } else {
      // Fallback to copy
      copyToClipboard(shareUrl);
    }
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `${shareText}\n\n${shareUrl}`
    )}`;
    window.open(whatsappUrl, "_blank");
    setShareDialogOpen(false);
  };

  // Share via SMS
  const shareViaSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(
      `${shareText}\n\n${shareUrl}`
    )}`;
    window.open(smsUrl, "_self");
    setShareDialogOpen(false);
  };

  // Share via Email
  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(
      `Vehicle Information - ${vehicle.plateNumber}`
    )}&body=${encodeURIComponent(`${shareText}\n\nView details: ${shareUrl}`)}`;
    window.open(emailUrl, "_self");
    setShareDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Vehicle Information
          </h1>
          <p className="text-gray-600">
            Public vehicle details for passengers and general public
          </p>
        </div>

        {/* Main Card */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Vehicle Image */}
              <Avatar className="h-32 w-32 rounded-lg">
                <AvatarImage
                  src={vehicle.image || "/placeholder.svg"}
                  alt={vehicle.plateNumber}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl rounded-lg">
                  <Car className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>

              {/* Vehicle Details */}
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold">{vehicle.plateNumber}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {formatVehicleStatus(vehicle.category)}
                  </Badge>
                  <Badge variant={statusInfo.variant} className="text-sm">
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Share Button */}
              <div className="flex gap-2">
                <Dialog
                  open={shareDialogOpen}
                  onOpenChange={setShareDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Vehicle Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Vehicle Information</DialogTitle>
                      <DialogDescription>
                        Share this vehicle's information with friends and family
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Share URL */}
                      <div className="space-y-2">
                        <Label htmlFor="share-url">Share Link</Label>
                        <div className="flex gap-2">
                          <Input
                            id="share-url"
                            value={shareUrl}
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(shareUrl)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      </div>

                      {/* Share Options */}
                      <div className="space-y-2">
                        <Label>Share via</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Native Share (if supported) */}
                          {typeof navigator !== "undefined" &&
                            // @ts-expect-error: expect error
                            navigator.share && (
                              <Button
                                variant="outline"
                                onClick={shareViaWebAPI}
                                className="flex items-center gap-2"
                              >
                                <Share2 className="h-4 w-4" />
                                Share
                              </Button>
                            )}

                          {/* WhatsApp */}
                          <Button
                            variant="outline"
                            onClick={shareViaWhatsApp}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>

                          {/* SMS */}
                          <Button
                            variant="outline"
                            onClick={shareViaSMS}
                            className="flex items-center gap-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            SMS
                          </Button>

                          {/* Email */}
                          <Button
                            variant="outline"
                            onClick={shareViaEmail}
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </Button>
                        </div>
                      </div>

                      {/* Quick Share Text */}
                      <div className="space-y-2">
                        <Label htmlFor="share-text">Message Preview</Label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <p className="text-gray-700">{shareText}</p>
                          <p className="text-blue-600 mt-1 break-all">
                            {shareUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Quick Share Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyToClipboard(shareUrl)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareViaWhatsApp}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareViaSMS}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      SMS
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareViaEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator />

              {/* Public Information */}
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Type</p>
                      <p className="font-medium">
                        {vehicle.color}{" "}
                        {vehicle.type && vehicle.type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  {vehicle.registeredLga && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Registered LGA</p>
                        <p className="font-medium">
                          {vehicle.registeredLga.name}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">State Code</p>
                      <p className="font-medium">{vehicle.stateCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Registered</p>
                      <p className="font-medium">
                        {formatDate(vehicle.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {vehicle.blacklisted && (
                <Alert variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This vehicle has been blacklisted and may not be authorized
                    for operation.
                  </AlertDescription>
                </Alert>
              )}

              {vehicle.status === "ACTIVE" && !vehicle.blacklisted && (
                <Alert className="w-full border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    This vehicle is properly registered and authorized for
                    operation.
                  </AlertDescription>
                </Alert>
              )}

              {/* Safety Information */}
              <div className="w-full p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  For Passengers
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Always verify the vehicle plate number matches your
                    booking
                  </li>
                  <li>
                    • Ensure the vehicle status shows as "Active" before
                    boarding
                  </li>
                  <li>
                    • Report any suspicious activity to transport authorities
                  </li>
                  <li>
                    • Share this information with family/friends for safety
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            For complaints or inquiries, contact the relevant transport
            authority
          </p>
          <p className="text-xs">
            Vehicle ID: {vehicle.id} • Last updated:{" "}
            {formatDate(vehicle.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
