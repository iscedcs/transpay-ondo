"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { AlertItem } from "./alert-item";
import { STATE_CONFIG } from "@/lib/constants";
import { toast } from "sonner";

interface DashboardAlert {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  actionLabel?: string;
  dismissible?: boolean;
}

interface DashboardAlertsProps {
  role: string;
}

export function DashboardAlerts({ role }: DashboardAlertsProps) {
  const getAlertsForRole = (): DashboardAlert[] => {
    switch (role) {
      case "super_admin":
        return [
          {
            id: "1",
            type: "warning",
            title: "System Maintenance",
            message:
              "Scheduled maintenance window this Sunday 2:00 AM - 4:00 AM",
            dismissible: true,
          },
          {
            id: "2",
            type: "info",
            title: "New State Integration",
            message: "Ogun State integration is ready for testing",
            actionLabel: "Review",
            dismissible: true,
          },
        ];

      case "admin":
        return [
          {
            id: "1",
            type: "warning",
            title: "Compliance Alert",
            message: `${STATE_CONFIG.name} compliance rate dropped below ${STATE_CONFIG.complianceThreshold}%`,
            actionLabel: "View Details",
            dismissible: true,
          },
          {
            id: "2",
            type: "info",
            title: "Monthly Report",
            message: "Revenue report for this month is ready for review",
            actionLabel: "Download",
            dismissible: true,
          },
        ];

      case "lga_admin":
        return [
          {
            id: "1",
            type: "warning",
            title: "Agent Performance",
            message: "3 agents have not submitted daily reports",
            actionLabel: "Contact Agents",
            dismissible: true,
          },
          {
            id: "2",
            type: "success",
            title: "Target Achieved",
            message: "Monthly revenue target exceeded by 15%",
            dismissible: true,
          },
        ];

      case "lga_agent":
        return [
          {
            id: "1",
            type: "info",
            title: "New Assignment",
            message: "5 new vehicles assigned for verification",
            actionLabel: "View Tasks",
            dismissible: true,
          },
          {
            id: "2",
            type: "warning",
            title: "Daily Report",
            message: "Don't forget to submit your daily activity report",
            actionLabel: "Submit Now",
            dismissible: true,
          },
        ];

      case "lga_compliance":
        return [
          {
            id: "1",
            type: "error",
            title: "Violation Alert",
            message: "High number of non-compliant vehicles detected in Zone A",
            actionLabel: "Investigate",
            dismissible: true,
          },
          {
            id: "2",
            type: "info",
            title: "Patrol Route",
            message: "Your patrol route for today has been updated",
            actionLabel: "View Route",
            dismissible: true,
          },
        ];

      case "vehicle_owner":
        return [
          {
            id: "1",
            type: "warning",
            title: "Payment Due",
            message: `Levy payment for vehicle LAG-123-ABC due in ${
              STATE_CONFIG.levyGracePeriod - 25
            } days`,
            actionLabel: "Pay Now",
            dismissible: true,
          },
          {
            id: "2",
            type: "info",
            title: "New Feature",
            message:
              "You can now track your vehicle's compliance status in real-time",
            dismissible: true,
          },
        ];

      default:
        return [];
    }
  };

  const alerts = getAlertsForRole();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
          {getAlertIcon(alert.type)}
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <AlertTitle className="flex items-center gap-2">
                {alert.title}
                <Badge
                  variant={alert.type === "success" ? "default" : "secondary"}
                >
                  {alert.type}
                </Badge>
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </div>
            <AlertItem
              actionLabel={alert.actionLabel}
              dismissible={alert.dismissible}
              onAction={() =>
                // TODO: handle action based on alert type
                toast.success(`Action for ${alert.title} executed`)
              }
              onDismiss={() =>
                // TODO: handle action based on alert type
                toast.success(`Action for ${alert.title} executed`)
              }
            />
          </div>
        </Alert>
      ))}
    </div>
  );
}
