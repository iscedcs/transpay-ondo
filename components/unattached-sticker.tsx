import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Car, ExternalLink } from "lucide-react"

interface StickerData {
  id: string
  code: string
  vehicleId: string | null
  isUsed: boolean | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface UnattachedStickerProps {
  sticker: StickerData
}

export default function UnattachedSticker({
  sticker,
}: UnattachedStickerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-4 border-green-200 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Genuine Sticker</h1>
          <p className="text-gray-600 mb-6">This sticker is authentic but not currently attached to a vehicle.</p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Code:</span>
                <span className="text-sm font-mono text-gray-900">{sticker.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm text-gray-900">Not Attached</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm text-gray-900">{new Date(sticker.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Car className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-900">Next Step:</p>
                <p className="text-sm text-blue-800">Attach this sticker to your vehicle to activate it.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">ID: {sticker.id.slice(0, 8)}...</p>
        </CardContent>
      </Card>
    </div>
  )
}
