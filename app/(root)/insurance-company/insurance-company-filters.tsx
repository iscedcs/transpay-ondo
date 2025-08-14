"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X, Download } from "lucide-react"

export function InsuranceCompanyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "ALL_STATUS")
  const [claimType, setClaimType] = useState(searchParams.get("claimType") || "ALL_TYPES")

  const updateFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)

      if (search) params.set("search", search)
      else params.delete("search")

      if (status !== "ALL_STATUS") params.set("status", status)
      else params.delete("status")

      if (claimType !== "ALL_TYPES") params.set("claimType", claimType)
      else params.delete("claimType")

      params.set("page", "1")

      router.push(`?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSearch("")
    setStatus("ALL_STATUS")
    setClaimType("ALL_TYPES")
    startTransition(() => {
      router.push(window.location.pathname)
    })
  }

  const exportClaims = () => {
    // TODO: Implement export functionality
  }

  const hasActiveFilters = search || status !== "ALL_STATUS" || claimType !== "ALL_TYPES"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by claim number, plate number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && updateFilters()}
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATUS">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={claimType} onValueChange={setClaimType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_TYPES">All Types</SelectItem>
                  <SelectItem value="FIRE">Fire</SelectItem>
                  <SelectItem value="THEFT">Theft</SelectItem>
                  <SelectItem value="ACCIDENT">Accident</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
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

            <Button variant="outline" onClick={exportClaims} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
