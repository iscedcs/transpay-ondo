"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Settings, Shield, Car, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getAllNonDeletedSettings,
  getAllSettings,
  getCvofAllStatus,
  toggleCvofAll,
} from "@/actions/vehicle-settings";
import { CreateSettingDialog } from "@/components/vehicle-settings/create-setting-dialog";
import { SettingsTable } from "@/components/vehicle-settings/settings-table";
import { VehicleExemptionDialog } from "@/components/vehicle-settings/vehicle-exemption-dialog";
import type { VehicleSetting } from "@/types/vehicle-settings";

export default function VehicleSettingsPage() {
  const [settings, setSettings] = useState<VehicleSetting[]>([]);
  const [allSettings, setAllSettings] = useState<VehicleSetting[]>([]);
  const [cvofAllStatus, setCvofAllStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [activePageInfo, setActivePageInfo] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    searchQuery: "",
    statusFilter: "all",
  });

  const [allPageInfo, setAllPageInfo] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    searchQuery: "",
    statusFilter: "all",
  });

  const fetchSettings = useCallback(
    async (
      activeParams = { page: 1, search: "", filter: "all" },
      allParams = { page: 1, search: "", filter: "all" }
    ) => {
      setIsLoading(true);
      try {
        const [nonDeletedResponse, allResponse, cvofStatusResponse] =
          await Promise.all([
            getAllNonDeletedSettings(activeParams.page, 10),
            getAllSettings(allParams.page, 10),
            getCvofAllStatus(),
          ]);

        if (
          !nonDeletedResponse.success ||
          !allResponse.success ||
          !cvofStatusResponse.success
        ) {
          throw new Error("Failed to fetch settings data");
        }

        // Filter settings based on search and status filter
        let filteredActiveSettings = nonDeletedResponse.data?.rows || [];
        let filteredAllSettings = allResponse.data?.rows || [];

        if (activeParams.search) {
          filteredActiveSettings = filteredActiveSettings.filter(
            (setting) =>
              setting.name
                .toLowerCase()
                .includes(activeParams.search.toLowerCase()) ||
              setting.description
                .toLowerCase()
                .includes(activeParams.search.toLowerCase())
          );
        }

        if (activeParams.filter !== "all") {
          filteredActiveSettings = filteredActiveSettings.filter((setting) =>
            activeParams.filter === "active"
              ? setting.isActive
              : !setting.isActive
          );
        }

        if (allParams.search) {
          filteredAllSettings = filteredAllSettings.filter(
            (setting) =>
              setting.name
                .toLowerCase()
                .includes(allParams.search.toLowerCase()) ||
              setting.description
                .toLowerCase()
                .includes(allParams.search.toLowerCase())
          );
        }

        if (allParams.filter !== "all") {
          filteredAllSettings = filteredAllSettings.filter((setting) =>
            allParams.filter === "active" ? setting.isActive : !setting.isActive
          );
        }

        setSettings(filteredActiveSettings);
        setAllSettings(filteredAllSettings);
        setCvofAllStatus(cvofStatusResponse.data?.isActive || false);

        // Update pagination info
        setActivePageInfo((prev) => ({
          ...prev,
          currentPage: activeParams.page,
          totalPages: nonDeletedResponse.data?.meta?.total_pages || 1,
          totalItems: filteredActiveSettings.length,
          searchQuery: activeParams.search,
          statusFilter: activeParams.filter,
        }));

        setAllPageInfo((prev) => ({
          ...prev,
          currentPage: allParams.page,
          totalPages: allResponse.data?.meta?.total_pages || 1,
          totalItems: filteredAllSettings.length,
          searchQuery: allParams.search,
          statusFilter: allParams.filter,
        }));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch settings"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleToggleCvofAll = async (checked: boolean) => {
    startTransition(async () => {
      try {
        const result = await toggleCvofAll(checked);
        if (result.success) {
          setCvofAllStatus(checked);
          toast.success("CVOF status updated successfully");
          fetchSettings(); // Refresh to get updated data
        } else {
          toast.error(result.error || "Failed to toggle CVOF status");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to toggle CVOF status"
        );
      }
    });
  };

  const handleActivePageChange = (page: number) => {
    fetchSettings(
      {
        page,
        search: activePageInfo.searchQuery,
        filter: activePageInfo.statusFilter,
      },
      {
        page: allPageInfo.currentPage,
        search: allPageInfo.searchQuery,
        filter: allPageInfo.statusFilter,
      }
    );
  };

  const handleAllPageChange = (page: number) => {
    fetchSettings(
      {
        page: activePageInfo.currentPage,
        search: activePageInfo.searchQuery,
        filter: activePageInfo.statusFilter,
      },
      {
        page,
        search: allPageInfo.searchQuery,
        filter: allPageInfo.statusFilter,
      }
    );
  };

  const handleActiveSearch = (query: string) => {
    fetchSettings(
      { page: 1, search: query, filter: activePageInfo.statusFilter },
      {
        page: allPageInfo.currentPage,
        search: allPageInfo.searchQuery,
        filter: allPageInfo.statusFilter,
      }
    );
  };

  const handleAllSearch = (query: string) => {
    fetchSettings(
      {
        page: activePageInfo.currentPage,
        search: activePageInfo.searchQuery,
        filter: activePageInfo.statusFilter,
      },
      { page: 1, search: query, filter: allPageInfo.statusFilter }
    );
  };

  const handleActiveFilterChange = (filter: string) => {
    fetchSettings(
      { page: 1, search: activePageInfo.searchQuery, filter },
      {
        page: allPageInfo.currentPage,
        search: allPageInfo.searchQuery,
        filter: allPageInfo.statusFilter,
      }
    );
  };

  const handleAllFilterChange = (filter: string) => {
    fetchSettings(
      {
        page: activePageInfo.currentPage,
        search: activePageInfo.searchQuery,
        filter: activePageInfo.statusFilter,
      },
      { page: 1, search: allPageInfo.searchQuery, filter }
    );
  };

  const handleRefresh = () => {
    fetchSettings(
      {
        page: activePageInfo.currentPage,
        search: activePageInfo.searchQuery,
        filter: activePageInfo.statusFilter,
      },
      {
        page: allPageInfo.currentPage,
        search: allPageInfo.searchQuery,
        filter: allPageInfo.statusFilter,
      }
    );
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isLoading && settings.length === 0 && allSettings.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Settings
          </h1>
          <p className="text-muted-foreground">
            Manage vehicle payment settings and CVOF exemptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <CreateSettingDialog onSuccess={handleRefresh} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Global CVOF Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <div>
                  <CardTitle>Global CVOF Control</CardTitle>
                  <CardDescription>
                    Master switch to enable or disable CVOF charges for all
                    vehicles
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={cvofAllStatus ? "outline" : "destructive"}>
                  {cvofAllStatus ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={cvofAllStatus}
                  onCheckedChange={handleToggleCvofAll}
                  disabled={isPending}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <div>
                  <CardTitle>Vehicle Exemptions</CardTitle>
                  <CardDescription>
                    Manage individual vehicle CVOF payment exemptions
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <VehicleExemptionDialog onSuccess={handleRefresh} />
                <Link href="/settings/vehicle-exemptions">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Settings className="h-4 w-4" />
            Active Settings ({activePageInfo.totalItems})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            All Settings ({allPageInfo.totalItems})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Vehicle Settings</CardTitle>
              <CardDescription>
                Currently active vehicle payment settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsTable
                settings={settings}
                onRefresh={handleRefresh}
                currentPage={activePageInfo.currentPage}
                totalPages={activePageInfo.totalPages}
                totalItems={activePageInfo.totalItems}
                onPageChange={handleActivePageChange}
                onSearch={handleActiveSearch}
                onFilterChange={handleActiveFilterChange}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Vehicle Settings</CardTitle>
              <CardDescription>
                All vehicle payment settings including deleted ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsTable
                settings={allSettings}
                onRefresh={handleRefresh}
                currentPage={allPageInfo.currentPage}
                totalPages={allPageInfo.totalPages}
                totalItems={allPageInfo.totalItems}
                onPageChange={handleAllPageChange}
                onSearch={handleAllSearch}
                onFilterChange={handleAllFilterChange}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
