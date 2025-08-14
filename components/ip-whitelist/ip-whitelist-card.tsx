"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AddIPDialog } from "./add-ip-dialog";
import { getAllWhitelistedIPs } from "@/actions/ip-whitelist";
import type { WhitelistedIP } from "@/types/ip-whitelist";

interface IPWhitelistCardProps {
  initialIPs?: WhitelistedIP[];
}

export function IPWhitelistCard({ initialIPs = [] }: IPWhitelistCardProps) {
  const [ips, setIPs] = useState<WhitelistedIP[]>(initialIPs);
  const [isLoading, setIsLoading] = useState(false);

  const refreshIPs = async () => {
    setIsLoading(true);
    const result = await getAllWhitelistedIPs();
    if (result.success) {
      setIPs(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (initialIPs.length === 0) {
      refreshIPs();
    }
  }, [initialIPs.length]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            IP Whitelist
          </CardTitle>
          <CardDescription>
            Manage allowed IP addresses for system access
          </CardDescription>
        </div>
        <AddIPDialog onSuccess={refreshIPs} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active IPs</span>
            <span className="font-medium">{ips.length}</span>
          </div>
          {ips.length > 0 && (
            <div className="space-y-1">
              {ips.slice(0, 3).map((ip) => (
                <div
                  key={ip.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-mono">{ip.ip}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ip.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {ips.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{ips.length - 3} more IPs
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
