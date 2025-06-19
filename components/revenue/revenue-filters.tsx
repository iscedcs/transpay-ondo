"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface RevenueFiltersProps {
  user: any;
  searchParams: { [key: string]: string | string[] | undefined };
  availableLGAs: { id: string; name: string }[];
  canCompare: boolean;
}

export default function RevenueFilters({
  user,
  searchParams,
  availableLGAs,
  canCompare,
}: RevenueFiltersProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedLGAs, setSelectedLGAs] = useState<string[]>([]);

  const currentPeriod = Array.isArray(searchParams.period)
    ? searchParams.period[0]
    : searchParams.period || "monthly";
  const currentLGA = Array.isArray(searchParams.lga)
    ? searchParams.lga[0]
    : searchParams.lga;
  const isCompareMode = searchParams.compare === "true";

  const updateFilters = (
    updates: Record<string, string | string[] | undefined>
  ) => {
    const params = new URLSearchParams();

    // Keep existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key in updates) return; // Skip if being updated
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });

    // Add updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    router.push(`/revenue?${params.toString()}`);
  };

  const handlePeriodChange = (period: string) => {
    updateFilters({
      period,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleLGAChange = (lgaId: string) => {
    updateFilters({ lga: lgaId });
  };

  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      updateFilters({
        period: "custom",
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
    }
  };

  const handleCompareToggle = () => {
    if (isCompareMode) {
      updateFilters({
        compare: undefined,
        lgas: undefined,
      });
    } else {
      updateFilters({ compare: "true" });
    }
  };

  const handleLGASelection = (lgaId: string, checked: boolean) => {
    let newSelection = [...selectedLGAs];

    if (checked && newSelection.length < 5) {
      newSelection.push(lgaId);
    } else if (!checked) {
      newSelection = newSelection.filter((id) => id !== lgaId);
    }

    setSelectedLGAs(newSelection);
    updateFilters({ lgas: newSelection });
  };

  const isLGAAdmin = user.role === "LGA_ADMIN";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Period Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select value={currentPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* LGA Filter - Only for non-LGA_ADMIN users */}
          {!isLGAAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Local Government</label>
              <Select
                value={currentLGA || "all"}
                onValueChange={handleLGAChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All LGAs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LGAs</SelectItem>
                  {availableLGAs.map((lga) => (
                    <SelectItem key={lga.id} value={lga.id}>
                      {lga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Date Range */}
          {currentPeriod === "custom" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>

        {/* Apply Custom Date Range */}
        {currentPeriod === "custom" && (
          <Button
            onClick={handleDateRangeApply}
            disabled={!startDate || !endDate}
          >
            Apply Date Range
          </Button>
        )}

        {/* Compare Mode - Only for non-LGA_ADMIN users */}
        {canCompare && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="compare"
                checked={isCompareMode}
                onCheckedChange={handleCompareToggle}
              />
              <label htmlFor="compare" className="text-sm font-medium">
                Compare LGAs
              </label>
            </div>

            {isCompareMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select LGAs to Compare (Max 5)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {availableLGAs.map((lga) => (
                    <div key={lga.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lga-${lga.id}`}
                        checked={selectedLGAs.includes(lga.id)}
                        onCheckedChange={(checked) =>
                          handleLGASelection(lga.id, checked as boolean)
                        }
                        disabled={
                          !selectedLGAs.includes(lga.id) &&
                          selectedLGAs.length >= 5
                        }
                      />
                      <label
                        htmlFor={`lga-${lga.id}`}
                        className="text-sm truncate"
                        title={lga.name}
                      >
                        {lga.name}
                      </label>
                    </div>
                  ))}
                </div>

                {selectedLGAs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedLGAs.map((lgaId) => {
                      const lga = availableLGAs.find((l) => l.id === lgaId);
                      return <Badge key={lgaId}>{lga?.name}</Badge>;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
