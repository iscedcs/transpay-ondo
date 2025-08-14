"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, User, Activity, Globe } from "lucide-react"
import { format } from "date-fns"
import { getTransactionAuditLog } from "@/lib/transactions-data"
import type { AuditLogEntry } from "@/types/transactions"

interface AuditLogViewerProps {
  transactionId: string
}

export function AuditLogViewer({ transactionId }: AuditLogViewerProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        setLoading(true)
        const logs = await getTransactionAuditLog(transactionId)
        setAuditLogs(logs)
      } catch (error) {
        // TODO: Handle error (e.g., show toast or alert)
      } finally {
        setLoading(false)
      }
    }

    loadAuditLogs()
  }, [transactionId])

  const getActionBadge = (action: string) => {
    if (action.toLowerCase().includes("created")) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Created
        </Badge>
      )
    }
    if (action.toLowerCase().includes("processed")) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Processed
        </Badge>
      )
    }
    if (action.toLowerCase().includes("failed")) {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (action.toLowerCase().includes("updated")) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          Updated
        </Badge>
      )
    }
    return <Badge variant="outline">{action}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No audit logs available for this transaction.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {auditLogs.map((log, index) => (
              <div key={log.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="font-medium">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{log.details}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{log.userName}</span>
                    </div>
                    {log.ipAddress && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{log.ipAddress}</span>
                      </div>
                    )}
                    {log.deviceInfo && <span>{log.deviceInfo}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
