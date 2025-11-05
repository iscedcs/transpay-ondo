"use client";

import { Button } from "@/components/ui/button";
import { USER_ROLES } from "@/lib/constants";
import { Role } from "@prisma/client";
import { Plus, Download, Upload, QrCode } from "lucide-react";

interface PageHeaderProps {
  userRole: string;
  onCreateVehicle: () => void;
  onBulkImport: () => void;
  onExportData: () => void;
  onQRCodeGenerator: () => void;
}

export function PageHeader({
  userRole,
  onCreateVehicle,
  onBulkImport,
  onExportData,
  onQRCodeGenerator,
}: PageHeaderProps) {
  const canCreate = [Role.SUPERADMIN].includes(userRole as any);
  const canImport = [Role.SUPERADMIN].includes(userRole as any);
  const canExport = [Role.SUPERADMIN].includes(userRole as any);

  const getDescription = () => {
    switch (userRole) {
      case USER_ROLES.SUPERADMIN:
        return "Manage all vehicles across all states and LGAs. Register new vehicles, update information, and monitor compliance.";
      case USER_ROLES.ADMIN:
        return "Manage vehicles within your state. Register new vehicles, update information, and monitor compliance.";
      case USER_ROLES.ODIRS_ADMIN:
        return "Manage vehicles within your LGA. Register new vehicles, update information, and monitor compliance.";
      case USER_ROLES.ODIRS_C_AGENT:
        return "View and scan vehicles within your assigned LGA. Update compliance status and payment records.";
      default:
        return "Vehicle management and compliance tracking.";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <p className="text-muted-foreground mt-1">{getDescription()}</p>
      </div>

      <div className="flex items-center gap-2">
        {canExport && (
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        {canImport && (
          <Button variant="outline" onClick={onBulkImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}

        <Button variant="outline" onClick={onQRCodeGenerator}>
          <QrCode className="h-4 w-4 mr-2" />
          QR Codes
        </Button>

        {canCreate && (
          <Button onClick={onCreateVehicle}>
            <Plus className="h-4 w-4 mr-2" />
            Register Vehicle
          </Button>
        )}
      </div>
    </div>
  );
}
