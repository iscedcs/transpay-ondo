"use client";

import type React from "react";

import { Vehicle, getVehicleByBarcode } from "@/actions/vehicles";
import { PublicVehicleView } from "@/components/public-vehicle-view";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Shield,
  Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QrIdPage() {
  const params = useParams();
  const session = useSession();
  const id = String(params.qrid);
  const user = session.data?.user;
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Determine user role and ownership
  useEffect(() => {
    // In a real app, get this from auth context

    setUserRole(user?.role || null);

    // Check if user owns this vehicle
    if (user && vehicle) {
      setIsOwner(vehicle.ownerId === user.id);
    }
  }, [vehicle]);

  // Fetch vehicle data by barcode ID
  useEffect(() => {
    const fetchVehicleByBarcode = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, you'd have an endpoint to get vehicle by barcode
        // For now, we'll use the vehicle ID directly
        const vehicleData = await getVehicleByBarcode(id);
        setVehicle(vehicleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Vehicle not found");
        console.log("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicleByBarcode();
    }
  }, [params.id]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error ||
                    "Vehicle not found. Please check the barcode and try again."}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Public View (Default)
  if (!userRole) {
    return <PublicVehicleView vehicle={vehicle} qrId={id} />;
  }

  // Vehicle Owner View
  if (isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
        <div className="container mx-auto px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Vehicle</h1>
              <p className="text-gray-600">Personal vehicle dashboard</p>
            </div>
            <Button onClick={() => router.push(`/vehicles/${vehicle.id}`)}>
              View Full Details
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-green-100`}>
                    <Shield className={`h-5 w-5 text-green-600`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold">{vehicle.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {vehicle.wallet && (
              <>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wallet Balance</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(Number(vehicle.wallet.walletBalance))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <CreditCard className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount Owed</p>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(Number(vehicle.wallet.amountOwed))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">
                        Plate Number
                      </Label>
                      <p className="font-medium">{vehicle.plateNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Category</Label>
                      <p className="font-medium">
                        {vehicle.category.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">
                        Color & Type
                      </Label>
                      <p className="font-medium">
                        {vehicle.color} {vehicle.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">
                        State Code
                      </Label>
                      <p className="font-medium">{vehicle.stateCode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-4">
              {vehicle.wallet ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Wallet Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">
                          Current Balance
                        </Label>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(Number(vehicle.wallet.walletBalance))}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          Amount Owed
                        </Label>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(Number(vehicle.wallet.amountOwed))}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          Net Total
                        </Label>
                        <p className="text-xl font-semibold">
                          {formatCurrency(Number(vehicle.wallet.netTotal))}
                        </p>
                      </div>
                      {vehicle.wallet.accountNumber && (
                        <div>
                          <Label className="text-sm text-gray-500">
                            Account Number
                          </Label>
                          <p className="font-mono text-lg">
                            {vehicle.wallet.accountNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">
                      No wallet information available
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Vehicle Registration</span>
                      <Badge variant="outline">Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Insurance Certificate</span>
                      <Badge variant="outline">Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Road Worthiness</span>
                      <Badge variant="outline">Valid</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Admin/Compliance View
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vehicle Compliance
            </h1>
            <p className="text-gray-600">Administrative vehicle overview</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/vehicles/${vehicle.id}`)}
            >
              Full Details
            </Button>
            <Button>Take Action</Button>
          </div>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    vehicle.status === "ACTIVE" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {vehicle.status === "ACTIVE" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Status</p>
                  <p className="font-semibold">{vehicle.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    vehicle.blacklisted ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {vehicle.blacklisted ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blacklist Status</p>
                  <p className="font-semibold">
                    {vehicle.blacklisted ? "Blacklisted" : "Clear"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-semibold">
                    {formatDate(vehicle.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">Plate Number</Label>
                  <p className="font-medium text-lg">{vehicle.plateNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Category</Label>
                    <p className="font-medium">
                      {vehicle.category.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Type</Label>
                    <p className="font-medium">
                      {vehicle.type.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Color</Label>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">State Code</Label>
                    <p className="font-medium">{vehicle.stateCode}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicle.owner ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-500">Full Name</Label>
                    <p className="font-medium">
                      {vehicle.owner.firstName} {vehicle.owner.lastName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Phone</Label>
                      <p className="font-medium">{vehicle.owner.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Email</Label>
                      <p className="font-medium">{vehicle.owner.email}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Owner Status
                    </Label>
                    <Badge
                      variant={
                        vehicle.owner.blacklisted ? "destructive" : "default"
                      }
                    >
                      {vehicle.owner.blacklisted ? "Blacklisted" : "Active"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No owner information available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Information */}
        {vehicle.wallet && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Wallet Balance</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(Number(vehicle.wallet.walletBalance))}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Amount Owed</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(Number(vehicle.wallet.amountOwed))}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Net Total</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(Number(vehicle.wallet.netTotal))}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <Badge
                    variant={
                      vehicle.wallet.accountNumber ? "default" : "outline"
                    }
                  >
                    {vehicle.wallet.accountNumber ? "Active" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
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
