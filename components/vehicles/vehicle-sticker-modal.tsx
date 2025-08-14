"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { QrCode, Scan, Check } from "lucide-react"
import { updateVehicleSticker } from "@/lib/vehicles-data"
import type { Vehicle } from "@/types/vehicles"

interface VehicleStickerModalProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function VehicleStickerModal({ vehicle, isOpen, onClose, onSuccess }: VehicleStickerModalProps) {
  const [barcode, setBarcode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scanMode, setScanMode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicle || !barcode.trim()) return

    setIsLoading(true)
    try {
      await updateVehicleSticker(vehicle.id, { barcode: barcode.trim() })
      onSuccess()
      onClose()
      setBarcode("")
    } catch (error) {
      // TODO: Handle error (e.g., show toast or alert)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScanQR = () => {
    // In a real app, this would open camera/scanner
    setScanMode(true)
    // Simulate QR scan result
    setTimeout(() => {
      setBarcode(`QR_${Date.now()}`)
      setScanMode(false)
    }, 2000)
  }

  if (!vehicle) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Update Vehicle QR Code
          </DialogTitle>
          <DialogDescription>
            Link a QR code sticker to this vehicle for easy scanning and identification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{vehicle.plateNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {vehicle.owner.firstName} {vehicle.owner.lastName}
                </div>
              </div>
              <Badge variant="outline">{vehicle.category}</Badge>
            </div>
            {vehicle.barcode && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-muted-foreground">Current QR Code:</div>
                <div className="text-sm font-mono">{vehicle.barcode}</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">QR Code / Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter or scan QR code..."
                  disabled={scanMode}
                />
                <Button type="button" variant="outline" onClick={handleScanQR} disabled={scanMode}>
                  {scanMode ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Scanning...
                    </div>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Scan QR
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use the scan button to capture QR code from camera, or manually enter the code.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!barcode.trim() || isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Updating...
                  </div>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update QR Code
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
