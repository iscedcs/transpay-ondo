"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (
    imageUrl: string
  ) => Promise<{ success?: string; error?: string }> | void;
  currentImageUrl?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  multiple?: boolean;
}

export default function ImageUploader({
  onImageUpload,
  currentImageUrl,
  maxSizeMB = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  className = "",
  disabled = false,
  placeholder = "Click to upload or drag and drop",
  showPreview = true,
  multiple = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Please upload a valid image file (${acceptedTypes
        .map((type) => type.split("/")[1].toUpperCase())
        .join(", ")})`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error("Invalid file", {
        description: validationError,
      });
      return;
    }

    setUploading(true);

    try {
      // Get presigned URL
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const jsonData = await response.json();
      const { url, fields } = jsonData;

      if (!url || !fields) {
        throw new Error("Invalid server response");
      }

      // Upload to S3
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) =>
        formData.append(key, value as string)
      );
      formData.append("file", file);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const fileUrl = `${url}${fields.key}`;
      setPreviewUrl(fileUrl);

      // Call the callback function
      const result = await onImageUpload(fileUrl);
      if (result && result.error) {
        toast.error("Upload error", {
          description: result.error,
        });
      } else {
        toast.success("Success", {
          description: result?.success || "Image uploaded successfully!",
        });
      }
    } catch (error) {
      toast.error("Upload failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (multiple) {
      Array.from(files).forEach((file) => uploadFile(file));
    } else {
      uploadFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-colors cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-primary hover:bg-primary/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-muted-foreground">
                  {acceptedTypes
                    .map((type) => type.split("/")[1].toUpperCase())
                    .join(", ")}{" "}
                  up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Info */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Max size: {maxSizeMB}MB</Badge>
        <Badge variant="outline">
          Formats:{" "}
          {acceptedTypes
            .map((type) => type.split("/")[1].toUpperCase())
            .join(", ")}
        </Badge>
        {multiple && <Badge variant="outline">Multiple files allowed</Badge>}
      </div>

      {/* Preview */}
      {showPreview && previewUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Image
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                  onError={() => {
                    setPreviewUrl(null);
                    toast.error("Preview error", {
                      description: "Failed to load image preview",
                    });
                  }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Image uploaded</span>
                </div>
                <p className="text-xs text-muted-foreground break-all">
                  {previewUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewUrl, "_blank")}
                  className="h-7 text-xs"
                >
                  View full size
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Upload Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleClick}
          disabled={disabled || uploading}
          className="w-full sm:w-auto"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
