"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function VehicleEditError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Vehicle edit error:", error)
  }, [error])

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Failed to Load Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {error.message || "Something went wrong while loading the vehicle edit page."}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild>
              <Link href="/vehicles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicles
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
