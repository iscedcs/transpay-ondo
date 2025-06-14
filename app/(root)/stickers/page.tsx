import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickersContent } from "@/components/stickers-content";
import { StickerUpload } from "@/components/sticker-upload";
import { StickerStats } from "@/components/sticker-stats";
import { Package, Upload, BarChart3, QrCode } from "lucide-react";

interface SearchParams {
  tab?: string;
  page?: string;
  search?: string;
  status?: string;
}

interface StickersPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function StickersPage({
  searchParams,
}: StickersPageProps) {
  const params = await searchParams;
  const activeTab = params.tab || "overview";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sticker Management
          </h1>
          <p className="text-muted-foreground">
            Manage vehicle stickers, upload barcodes, and track assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Stats Overview */}
      <Suspense
        fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}
      >
        <StickerStats />
      </Suspense>

      {/* Main Content */}
      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stickers" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Stickers
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Assign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quick Upload
                </CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CSV Upload</div>
                <p className="text-xs text-muted-foreground">
                  Upload barcode CSV files quickly
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bulk Assignment
                </CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Assign to Vehicles</div>
                <p className="text-xs text-muted-foreground">
                  Attach stickers to vehicles in bulk
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Management
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Full Control</div>
                <p className="text-xs text-muted-foreground">
                  Delete, restore, and manage stickers
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stickers" className="space-y-6">
          <Suspense
            fallback={
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            }
          >
            <StickersContent searchParams={params} />
          </Suspense>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <StickerUpload />
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Stickers to Vehicles</CardTitle>
              <CardDescription>
                Attach available stickers to vehicles for tracking and
                identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-64 bg-muted animate-pulse rounded-lg" />
                }
              >
                <StickersContent searchParams={{ ...params, mode: "assign" }} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
