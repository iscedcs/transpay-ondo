import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getVehicleByBarcode } from "@/actions/scan";
import { AuthenticatedScanView } from "@/components/authenticated-scan-view";
import { PublicVehicleView } from "@/components/public-vehicle-view";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/auth";

interface QRPageProps {
  params: Promise<{ qrid: string }>;
}

async function QRPage({ params }: QRPageProps) {
  const { qrid } = await params;

  if (!qrid) {
    notFound();
  }

  try {
    const session = await auth();
    const user = session?.user;

    if (user?.id) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <AuthenticatedScanView qrId={qrid} user={user} />
          </div>
        </div>
      );
    } else {
      const result = await getVehicleByBarcode(qrid);

      if (!result.success) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Vehicle Not Found
                </h1>
                <p className="text-gray-600 mb-4">
                  The QR code you scanned doesn't match any registered vehicle.
                </p>
                <p className="text-sm text-gray-500">QR Code: {qrid}</p>
              </CardContent>
            </Card>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <PublicVehicleView vehicle={result.data} qrId={qrid} />
          </div>
        </div>
      );
    }
  } catch (error) {
    console.log("Error loading QR page:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We couldn't load the vehicle information. Please try again.
            </p>
            <p className="text-sm text-gray-500">QR Code: {qrid}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QRPageWithSuspense({ params }: QRPageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <QRPage params={params} />
    </Suspense>
  );
}
