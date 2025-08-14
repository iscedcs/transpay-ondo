import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Car,
  Shield,
  Settings2,
  Users,
  CreditCard,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configurations and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Vehicle Settings - Active */}
        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Vehicle Settings</CardTitle>
                <CardDescription className="text-sm">
                  Payment settings & exemptions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Manage CVOF payments, sticker fees, and vehicle-specific
              exemptions
            </p>
            <div className="flex gap-2">
              <Link href="/settings/vehicle-settings" className="flex-1">
                <Button className="w-full" size="sm">
                  Settings
                </Button>
              </Link>
              <Link href="/settings/vehicle-exemptions" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  size="sm"
                >
                  Exemptions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* IP Whitelist - Active */}
        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">IP Whitelist</CardTitle>
                <CardDescription className="text-sm">
                  Access control & security
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Control which IP addresses can access your system for enhanced
              security
            </p>
            <Link href="/settings/ip-whitelist">
              <Button className="w-full" size="sm">
                Manage IPs
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* User Management - Coming Soon */}
        <Card className="hover:shadow-lg transition-shadow opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">User Management</CardTitle>
                <CardDescription className="text-sm">
                  Roles & permissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure user roles, permissions, and access controls
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Payment Settings - Coming Soon */}
        <Card className="hover:shadow-lg transition-shadow opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Payment Settings</CardTitle>
                <CardDescription className="text-sm">
                  Billing & transactions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure payment gateways, billing cycles, and transaction fees
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* System Configuration - Coming Soon */}
        <Card className="hover:shadow-lg transition-shadow opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Settings2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">System Configuration</CardTitle>
                <CardDescription className="text-sm">
                  Global system settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure system-wide preferences, notifications, and integrations
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings - Coming Soon */}
        <Card className="hover:shadow-lg transition-shadow opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Security Settings</CardTitle>
                <CardDescription className="text-sm">
                  Advanced security policies
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure advanced security policies, encryption settings, and
              audit logs
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Reports & Analytics - Coming Soon */}
        <Card className="hover:shadow-lg transition-shadow opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Reports & Analytics</CardTitle>
                <CardDescription className="text-sm">
                  Data insights & reporting
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate reports, view analytics, and export data for analysis
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="sm"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
