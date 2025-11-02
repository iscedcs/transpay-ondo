"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchVehicleForm } from "@/components/forms/search/search-vehicle-form";
import FundingModal from "@/components/agency/funding-modal";

export default function AgentSearchPage() {
  const [vehicle, setVehicle] = useState<any>(null);
  const [showFundingModal, setShowFundingModal] = useState(false);

  return (
    <div className="px-4 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Vehicle Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Search for a vehicle by plate number, security code, or barcode.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchVehicleForm
            onResult={(data) => setVehicle(data)}
            onClear={() => setVehicle(null)}
          />
        </CardContent>
      </Card>

      {vehicle && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Plate Number
                </p>
                <p className="font-semibold">{vehicle.plateNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Security Code
                </p>
                <p className="font-semibold">{vehicle.securityCode || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Barcode
                </p>
                <p className="font-semibold">
                  {vehicle.barcode?.code || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Category
                </p>
                <p className="font-semibold">{vehicle.category || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="font-semibold">{vehicle.status || "N/A"}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFundingModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition">
                Initiate Funding
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {showFundingModal && (
        <FundingModal
          vehicle={vehicle}
          onClose={() => setShowFundingModal(false)}
        />
      )}
    </div>
  );
}
