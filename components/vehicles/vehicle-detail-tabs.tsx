"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Vehicle } from "@/actions/vehicles";
import VehicleDetailsTab from "./vehicle-details-tab";
import VehicleTechnicalTab from "./vehicle-technical-tab";
import VehicleOwnerTab from "./vehicle-owner-tab";
import VehicleWalletTab from "./vehicle-wallet-tab";
import VehicleActivityTab from "./vehicle-activity-tab";
import VehicleTransactionsTab from "./vehicle-transactions-tab";
import { Cog, File, List, Ticket, User, Wallet } from "lucide-react";

interface VehicleDetailTabsProps {
  vehicle: Vehicle;
}

export default function VehicleDetailTabs({ vehicle }: VehicleDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Tabs
      defaultValue="details"
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-6"
    >
      <TabsList className="grid grid-cols-6 w-full">
        <TabsTrigger value="details">
          <span className="sr-only lg:not-sr-only">Details</span>
          <span className="lg:sr-only not-sr-only">
            <File className="h-4 w-4" />
          </span>
        </TabsTrigger>
        <TabsTrigger value="technical">
          <span className="sr-only lg:not-sr-only">Technical</span>
          <span className="lg:sr-only not-sr-only">
            <Cog className="h-4 w-4" />
          </span>
        </TabsTrigger>
        <TabsTrigger value="owner">
          <span className="sr-only lg:not-sr-only">Owner</span>
          <span className="lg:sr-only not-sr-only">
            <User className="h-4 w-4" />
          </span>
        </TabsTrigger>
        <TabsTrigger value="wallet">
          <span className="sr-only lg:not-sr-only">Wallet</span>
          <span className="lg:sr-only not-sr-only">
            <Wallet className="h-4 w-4" />
          </span>
        </TabsTrigger>
        <TabsTrigger value="transactions">
          <span className="sr-only lg:not-sr-only">Transactions</span>
          <span className="lg:sr-only not-sr-only">
            <Ticket className="h-4 w-4" />
          </span>
        </TabsTrigger>
        <TabsTrigger value="activity">
          <span className="sr-only lg:not-sr-only">Activities</span>
          <span className="lg:sr-only not-sr-only">
            <List className="h-4 w-4" />
          </span>
        </TabsTrigger>
      </TabsList>

      {/* Vehicle Details Tab */}
      <TabsContent value="details">
        <VehicleDetailsTab vehicle={vehicle} />
      </TabsContent>

      {/* Technical Details Tab */}
      <TabsContent value="technical">
        <VehicleTechnicalTab vehicle={vehicle} />
      </TabsContent>

      {/* Owner Information Tab */}
      <TabsContent value="owner">
        <VehicleOwnerTab vehicle={vehicle} />
      </TabsContent>

      {/* Wallet Tab */}
      <TabsContent value="wallet">
        <VehicleWalletTab vehicle={vehicle} />
      </TabsContent>

      {/* Transactions Tab */}
      <TabsContent value="transactions">
        <VehicleTransactionsTab vehicle={vehicle} />
      </TabsContent>

      {/* Activity Tab */}
      <TabsContent value="activity">
        <VehicleActivityTab vehicle={vehicle} />
      </TabsContent>
    </Tabs>
  );
}
