"use client";

import Image from "next/image";
import { useState } from "react";

import { SearchVehicleForm } from "@/components/forms/search/search-vehicle-form";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Car, Shield, Wallet } from "lucide-react";

export default function AgencyVehicleSearchPage() {
  const [vehicle, setVehicle] = useState<any>(null);

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Search Vehicle</CardTitle>
          <CardDescription>
            Enter any of the available identifiers to find a vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchVehicleForm
            onResult={(data) => setVehicle(data)}
            onClear={() => setVehicle(null)}
          />
        </CardContent>
      </Card>

      {/* Vehicle Details */}
      {vehicle && (
        <Card className="shadow-md border border-muted/50">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                {vehicle.plateNumber}
              </CardTitle>
              <CardDescription>
                VIN: {vehicle.vin || "N/A"} • VCode: {vehicle.vCode || "N/A"}
              </CardDescription>
            </div>
            <Badge
              variant={vehicle.status === "ACTIVE" ? "default" : "destructive"}
              className="uppercase">
              {vehicle.status}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Vehicle Image */}
            {vehicle.image && (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image
                  src={vehicle.image}
                  alt="Vehicle Image"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-semibold">{vehicle.category || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Color</p>
                <p className="font-semibold">{vehicle.color || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created On</p>
                <p className="font-semibold">
                  {new Date(vehicle.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Blacklisted</p>
                <Badge
                  variant={vehicle.blacklisted ? "destructive" : "default"}>
                  {vehicle.blacklisted ? "YES" : "NO"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Flagged</p>
                <Badge variant={vehicle.isFlagged ? "destructive" : "default"}>
                  {vehicle.isFlagged ? "YES" : "NO"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Security Code</p>
                <p className="font-semibold">{vehicle.securityCode || "N/A"}</p>
              </div>
            </div>

            {/* Wallet Summary */}
            {vehicle.wallet && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Wallet Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-2">
                  <div>
                    <p className="text-muted-foreground">Wallet Balance</p>
                    <p className="font-semibold">
                      ₦{Number(vehicle.wallet.walletBalance).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Owed</p>
                    <p className="font-semibold">
                      ₦{Number(vehicle.wallet.amountOwed).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Net Total</p>
                    <p className="font-semibold">
                      ₦{Number(vehicle.wallet.netTotal).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Barcode */}
            {vehicle.barcode && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Barcode Info
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-2">
                  <div>
                    <p className="text-muted-foreground">Barcode ID</p>
                    <p className="font-semibold">{vehicle.barcode.code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Issued At</p>
                    <p className="font-semibold">
                      {new Date(vehicle.barcode.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Used At</p>
                    <p className="font-semibold">
                      {vehicle.barcode.isUsed
                        ? new Date(vehicle.barcode.isUsed).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!vehicle && (
        <div className="text-center text-muted-foreground py-8">
          <Car className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
          <p>Enter a Plate Number, VIN, or VCode to view vehicle details</p>
        </div>
      )}
    </div>
  );
}
