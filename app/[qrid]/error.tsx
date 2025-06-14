"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading the QR code information.
          </p>
          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Go Home
            </Link>
          </div>
          {error.message && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
