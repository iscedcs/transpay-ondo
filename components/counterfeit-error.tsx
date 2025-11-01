import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Phone, Mail } from "lucide-react";

interface CounterfeitErrorProps {
  qrid: string;
}

export default function CounterfeitError({ qrid }: CounterfeitErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-4 border-red-200 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-red-500" />
              <AlertTriangle className="w-8 h-8 text-red-600 absolute -top-1 -right-1" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Counterfeit Sticker Detected
          </h1>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-semibold mb-2">⚠️ SECURITY ALERT</p>
            <p className="text-red-700 text-sm">
              This QR code does not match our authentic verification system.
              This may be a fraudulent or counterfeit sticker.
            </p>
          </div>

          <div className="text-left space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                <strong>Do not trust</strong> any information from this source
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                Report this incident to prevent fraud
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">
                Verify authenticity through official channels only
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 mb-1">Scanned QR Code:</p>
            <p className="text-sm font-mono text-gray-800 break-all">{qrid}</p>
            <p className="text-xs text-gray-500 mt-1">
              Timestamp: {new Date().toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Button className="w-full bg-red-600 hover:bg-red-700" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Report Counterfeit: 1-800-FRAUD
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
              size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email: security@transpayondo.com
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Reference ID: CF-{qrid?.slice(-6)}-{Date.now().toString().slice(-4)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
