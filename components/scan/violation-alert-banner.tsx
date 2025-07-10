"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Currency, DollarSign } from "lucide-react"
import type { ScanResponse } from "@/types/scan"

interface ViolationAlertBannerProps {
  violation: NonNullable<ScanResponse["violation"]>
}

export function ViolationAlertBanner({ violation }: ViolationAlertBannerProps) {
  const getViolationIcon = (type: string) => {
    switch (type) {
      case "out_of_route":
        return <AlertTriangle className="h-4 w-4" />
      case "expired_registration":
        return <AlertTriangle className="h-4 w-4" />
      case "unpaid_levy":
        return <Currency className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getViolationTitle = (type: string) => {
    switch (type) {
      case "out_of_route":
        return "Route Violation Detected"
      case "expired_registration":
        return "Expired Registration"
      case "unpaid_levy":
        return "Unpaid Levy"
      default:
        return "Violation Detected"
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "out_of_route":
        return "destructive"
      case "expired_registration":
        return "destructive"
      case "unpaid_levy":
        return "default"
      default:
        return "destructive"
    }
  }

  return (
    <Alert variant={getAlertVariant(violation.type)} className="mb-4">
      {getViolationIcon(violation.type)}
      <AlertTitle>{getViolationTitle(violation.type)}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{violation.message}</p>
        {violation.levyCharged && (
          <p className="font-medium">Levy charged: ₦{violation.levyCharged.toLocaleString()}</p>
        )}
      </AlertDescription>
    </Alert>
  )
}
