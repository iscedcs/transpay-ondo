"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Download, Filter, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function SettlementsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
  )
  const [lgaId, setLgaId] = useState(searchParams.get("lgaId") || "ALL_LGAS")
  const [status, setStatus] = useState(searchParams.get("status") || "ALL_STATUSES")
  const [period, setPeriod] = useState(searchParams.get("period") || "monthly")

  const updateFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)

      if (dateFrom) params.set("dateFrom", format(dateFrom, "yyyy-MM-dd"))
      else params.delete("dateFrom")

      if (dateTo) params.set("dateTo", format(dateTo, "yyyy-MM-dd"))
      else params.delete("dateTo")

      if (lgaId !== "ALL_LGAS") params.set("lgaId", lgaId)
      else params.delete("lgaId")

      if (status !== "ALL_STATUSES") params.set("status", status)
      else params.delete("status")

      params.set("period", period)
      params.set("page", "1")

      router.push(`?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setLgaId("ALL_LGAS")
    setStatus("ALL_STATUSES")
    setPeriod("monthly")
    startTransition(() => {
      router.push(window.location.pathname)
    })
  }

  const exportData = () => {
    // TODO: Implement export functionality
  }

  const hasActiveFilters = dateFrom || dateTo || lgaId !== "ALL_LGAS" || status !== "ALL_STATUSES"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-[140px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM dd, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Select value={lgaId} onValueChange={setLgaId}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select LGA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_LGAS">All LGAs</SelectItem>
                  <SelectItem value="amuwo-odofin">Amuwo Odofin</SelectItem>
                  <SelectItem value="lagos-island">Lagos Island</SelectItem>
                  <SelectItem value="ikeja">Ikeja</SelectItem>
                  <SelectItem value="surulere">Surulere</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATUSES">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={updateFilters} disabled={isPending} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} disabled={isPending} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}

              <Button variant="outline" onClick={exportData} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
