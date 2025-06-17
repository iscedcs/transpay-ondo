"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ExternalLink,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ScanRecord } from "@/app/(root)/scan/page";

interface ScanHistoryProps {
  history: ScanRecord[];
  onClearHistory: () => void;
  onRescan: (url: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function ScanHistory({
  history,
  onClearHistory,
  onRescan,
}: ScanHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "Invalid URL";
    }
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Scan History</h3>
          <p className="text-muted-foreground text-center">
            Your QR code scan history will appear here once you start scanning.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with clear button */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scan History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </CardHeader>
      </Card>

      {/* History items */}
      <div className="space-y-3">
        {currentItems.map((record) => (
          <Card key={record.id} className="transition-colors hover:bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {record.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    <Badge variant={record.success ? "default" : "destructive"}>
                      {record.success ? "Success" : "Failed"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(record.timestamp)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {getDomain(record.url)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {record.url}
                    </p>
                    {record.vehicleId && (
                      <p className="text-xs text-muted-foreground">
                        Vehicle ID: {record.vehicleId}
                      </p>
                    )}
                    {record.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          {record.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {record.success && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(record.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRescan(record.url)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, history.length)} of{" "}
                {history.length} scans
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
