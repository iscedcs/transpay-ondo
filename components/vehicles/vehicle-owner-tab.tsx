import type React from "react";
import { User, Phone, Home, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Vehicle } from "@/actions/vehicles";
import { parseAddressExtended } from "@/lib/utils";

interface VehicleOwnerTabProps {
  vehicle: Vehicle;
}

export default function VehicleOwnerTab({ vehicle }: VehicleOwnerTabProps) {
  if (!vehicle.owner) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            No owner assigned to this vehicle
          </p>
        </CardContent>
      </Card>
    );
  }

  const ownerAddress = vehicle.owner.address
    ? parseAddressExtended(vehicle.owner.address)
    : {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Owner Information
        </CardTitle>
        <CardDescription>Details about the vehicle owner</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">
              Full Name
            </Label>
            <p className="text-sm">
              {vehicle.owner.firstName} {vehicle.owner.lastName}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">
              Gender
            </Label>
            <p className="text-sm">{vehicle.owner.gender || "Not specified"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">
              Marital Status
            </Label>
            <p className="text-sm">
              {vehicle.owner.marital_status || "Not specified"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">
              Role
            </Label>
            <Badge variant="outline">
              {vehicle.owner.role || "VEHICLE_OWNER"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <p className="text-sm">{vehicle.owner.email}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Phone
              </Label>
              <p className="text-sm">{vehicle.owner.phone}</p>
            </div>
            {vehicle.owner.whatsapp && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  WhatsApp
                </Label>
                <p className="text-sm">{vehicle.owner.whatsapp}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Address Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4" />
            Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ownerAddress.text && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Street Address
                </Label>
                <p className="text-sm">{ownerAddress.text}</p>
              </div>
            )}
            {ownerAddress.city && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  City
                </Label>
                <p className="text-sm">{ownerAddress.city}</p>
              </div>
            )}
            {ownerAddress.state && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  State
                </Label>
                <p className="text-sm">{ownerAddress.state}</p>
              </div>
            )}
            {ownerAddress.lga && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  LGA
                </Label>
                <p className="text-sm">{ownerAddress.lga}</p>
              </div>
            )}
            {ownerAddress.country && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Country
                </Label>
                <p className="text-sm">{ownerAddress.country}</p>
              </div>
            )}
            {ownerAddress.postal_code && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Postal Code
                </Label>
                <p className="text-sm">{ownerAddress.postal_code}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Emergency Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicle.owner.nok_name && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Next of Kin
                </Label>
                <p className="text-sm">{vehicle.owner.nok_name}</p>
              </div>
            )}
            {vehicle.owner.nok_phone && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  NOK Phone
                </Label>
                <p className="text-sm">{vehicle.owner.nok_phone}</p>
              </div>
            )}
            {vehicle.owner.nok_relationship && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Relationship
                </Label>
                <p className="text-sm">{vehicle.owner.nok_relationship}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* System Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Owner ID
              </Label>
              <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {vehicle.owner.id}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Status
              </Label>
              <Badge
                variant={vehicle.owner.blacklisted ? "destructive" : "default"}
              >
                {vehicle.owner.blacklisted
                  ? "Blacklisted"
                  : vehicle.owner.status || "Active"}
              </Badge>
            </div>
            {vehicle.owner.lastLogin && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </Label>
                <p className="text-sm">
                  {new Date(vehicle.owner.lastLogin).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
