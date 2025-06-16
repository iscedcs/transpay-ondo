"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getAllStickers,
  attachStickerToVehicle,
  deleteSticker,
  restoreSticker,
  type Sticker,
} from "@/actions/stickers";
import {
  Search,
  QrCode,
  Trash2,
  RotateCcw,
  Car,
  Calendar,
  Hash,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

interface StickersContentProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    mode?: string;
  };
}

interface StickersData {
  stickers: Sticker[];
  stats: {
    total: number;
    used: number;
    available: number;
    deleted: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function StickersContent({ searchParams }: StickersContentProps) {
  const [data, setData] = useState<StickersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.status || "all"
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const isAssignMode = searchParams.mode === "assign";
  const currentPage = Number.parseInt(searchParams.page || "1");

  useEffect(() => {
    loadStickers();
  }, [searchParams]);

  const loadStickers = async () => {
    setLoading(true);
    try {
      const result = await getAllStickers({
        page: currentPage,
        search: searchTerm,
        status: statusFilter as any,
        limit: 20,
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error("Error loading stickers", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error loading stickers", {
        description: "Failed to load stickers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSticker = async () => {
    if (!selectedSticker || !vehicleId) return;

    setAssignLoading(true);
    try {
      const result = await attachStickerToVehicle(
        selectedSticker.code,
        vehicleId
      );

      if (result.success) {
        toast.success("Sticker assigned", {
          description: `Sticker ${selectedSticker.code} assigned to vehicle successfully`,
        });
        setAssignDialogOpen(false);
        setSelectedSticker(null);
        setVehicleId("");
        loadStickers();
      } else {
        toast.error("Assignment failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Assignment failed", {
        description: "Failed to assign sticker",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteSticker = async (sticker: Sticker) => {
    try {
      const result = await deleteSticker(sticker.id);

      if (result.success) {
        toast.success("Sticker deleted", {
          description: `Sticker ${sticker.code} has been deleted`,
        });
        loadStickers();
      } else {
        toast.error("Delete failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Delete failed", {
        description: "Failed to delete sticker",
      });
    }
  };

  const handleRestoreSticker = async (sticker: Sticker) => {
    try {
      const result = await restoreSticker(sticker.id);

      if (result.success) {
        toast.success("Sticker restored", {
          description: `Sticker ${sticker.code} has been restored`,
        });
        loadStickers();
      } else {
        toast.error("Restore failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Restore failed", {
        description: "Failed to restore sticker",
      });
    }
  };

  const getStatusBadge = (sticker: Sticker) => {
    if (sticker.deletedAt) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    if (sticker.isUsed && sticker.vehicleId) {
      return <Badge variant="default">Assigned</Badge>;
    }
    return <Badge variant="outline">Available</Badge>;
  };

  const generateStickerUrl = (code: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL}${code}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Alert>
        <QrCode className="h-4 w-4" />
        <AlertDescription>Failed to load stickers data.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">
                  {data.stats.total.toLocaleString()}
                </p>
              </div>
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {data.stats.available.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assigned
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.stats.used.toLocaleString()}
                </p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Deleted
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {data.stats.deleted.toLocaleString()}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stickers</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="used">Assigned</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadStickers} variant="outline">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stickers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {isAssignMode ? "Assign Stickers" : "All Stickers"}
          </CardTitle>
          <CardDescription>
            {isAssignMode
              ? "Select available stickers to assign to vehicles"
              : "Manage all stickers in the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.stickers.length === 0 ? (
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertDescription>
                No stickers found.{" "}
                {isAssignMode
                  ? "Upload some stickers first."
                  : "Try adjusting your filters."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.stickers.map((sticker) => (
                    <TableRow key={sticker.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{sticker.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sticker)}</TableCell>
                      <TableCell>
                        {sticker.vehicleId ? (
                          <Link
                            href={`/vehicles/${sticker.vehicleId}`}
                            className="flex items-center gap-2"
                          >
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {sticker.vehicle?.plateNumber}
                              {" - "}
                              {sticker.vehicle?.owner?.firstName}{" "}
                              {sticker.vehicle?.owner?.lastName}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={generateStickerUrl(sticker.code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(
                              new Date(sticker.createdAt),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isAssignMode &&
                            !sticker.vehicleId &&
                            !sticker.deletedAt && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedSticker(sticker);
                                  setAssignDialogOpen(true);
                                }}
                              >
                                Assign
                              </Button>
                            )}

                          {!isAssignMode && (
                            <>
                              {sticker.deletedAt ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRestoreSticker(sticker)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteSticker(sticker)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * data.pagination.limit + 1} to{" "}
                    {Math.min(
                      currentPage * data.pagination.limit,
                      data.pagination.total
                    )}{" "}
                    of {data.pagination.total} stickers
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        (window.location.href = `/stickers?page=${
                          currentPage - 1
                        }&search=${searchTerm}&status=${statusFilter}`)
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= data.pagination.totalPages}
                      onClick={() =>
                        (window.location.href = `/stickers?page=${
                          currentPage + 1
                        }&search=${searchTerm}&status=${statusFilter}`)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Sticker to Vehicle</DialogTitle>
            <DialogDescription>
              Assign sticker {selectedSticker?.code} to a vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-id">Vehicle ID</Label>
              <Input
                id="vehicle-id"
                placeholder="Enter vehicle ID"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                disabled={assignLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignSticker}
                disabled={!vehicleId || assignLoading}
              >
                {assignLoading ? "Assigning..." : "Assign Sticker"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
