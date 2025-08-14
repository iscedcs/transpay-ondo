"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { removeWhitelistedIP } from "@/actions/ip-whitelist";
import type { WhitelistedIP } from "@/types/ip-whitelist";

interface IPListTableProps {
  ips: WhitelistedIP[];
  onUpdate?: () => void;
}

export function IPListTable({ ips, onUpdate }: IPListTableProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingIP, setDeletingIP] = useState<string | null>(null);

  const handleRemoveIP = (ip: string) => {
    setDeletingIP(ip);
    startTransition(async () => {
      const result = await removeWhitelistedIP(ip);

      if (result.success) {
        toast.success(result.message);
        onUpdate?.();
      } else {
        toast.error(result.error);
      }
      setDeletingIP(null);
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (ips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No whitelisted IPs
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add IP addresses to the whitelist to control access to your system.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IP Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ips.map((ip) => (
            <TableRow key={ip.id}>
              <TableCell className="font-mono">{ip.ip}</TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(ip.createdAt)}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending && deletingIP === ip.ip}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remove IP from Whitelist
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove <strong>{ip.ip}</strong>{" "}
                        from the whitelist? This IP will no longer be able to
                        access the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveIP(ip.ip)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove IP
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
