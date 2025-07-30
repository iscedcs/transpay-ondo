"use client";

import type React from "react";

import { uploadStickers } from "@/actions/stickers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function StickerUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type !== "text/csv" &&
        !selectedFile.name.endsWith(".csv")
      ) {
        toast.error("Invalid file type", {
          description: "Please select a CSV file",
        });
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadStickers(formData);

      if (result.success && result.data) {
        setUploadResult(result.data);
        toast.success("Upload successful", {
          description: `${result.data.data.inserted} barcodes uploaded successfully`,
        });
      } else {
        toast.error("Upload failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Upload failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    const input = document.getElementById("csv-file") as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Barcode CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing barcodes with a "code" column. Each
            barcode should be unique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <Badge>{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Barcodes
                  </>
                )}
              </Button>

              {file && (
                <Button
                  variant="outline"
                  onClick={resetUpload}
                  disabled={uploading}
                >
                  Reset
                </Button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Processing barcodes...
                </p>
              </div>
            )}
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Total</p>
                        <p className="text-2xl font-bold">
                          {uploadResult.data.total}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Inserted</p>
                        <p className="text-2xl font-bold text-green-600">
                          {uploadResult.data.inserted}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Duplicates</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {uploadResult.data.duplicatesCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Errors</p>
                        <p className="text-2xl font-bold text-red-600">
                          {uploadResult.data.errors}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {uploadResult.data.duplicatesCount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {uploadResult.data.duplicatesCount} duplicate barcodes were
                    found and skipped.
                    {uploadResult.data.duplicates.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">
                          View duplicates
                        </summary>
                        <div className="mt-2 space-y-1">
                          {uploadResult.data.duplicates
                            .slice(0, 10)
                            .map((code: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="mr-1"
                              >
                                {code}
                              </Badge>
                            ))}
                          {uploadResult.data.duplicates.length > 10 && (
                            <p className="text-sm text-muted-foreground">
                              ...and {uploadResult.data.duplicates.length - 10}{" "}
                              more
                            </p>
                          )}
                        </div>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* CSV Format Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Required column:</strong> "code" (containing barcode
                  values)
                </p>
                <p>
                  <strong>Format:</strong> CSV file with headers
                </p>
                <p>
                  <strong>Example:</strong>
                </p>
                <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                  code
                  <br />
                  1749218747435
                  <br />
                  1749218747436
                  <br />
                  1749218747437
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
