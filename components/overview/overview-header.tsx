"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { USER_ROLES } from "@/lib/constants";
import { Role, User } from "@prisma/client";

interface OverviewHeaderProps {
  user: User;
  onStateChange?: (state: string) => void;
  onLGAChange?: (lga: string) => void;
  onDateRangeChange?: (from: Date, to: Date) => void;
}

export function OverviewHeader({
  user,
  onStateChange,
  onLGAChange,
  onDateRangeChange,
}: OverviewHeaderProps) {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const canFilterByState = [Role.SUPERADMIN, Role.ADMIN].includes(
    user.role as any
  );
  const canFilterByLGA = [Role.SUPERADMIN, Role.ADMIN].includes(
    user.role as any
  );

  const handleDateSelect = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);
    if (from && to && onDateRangeChange) {
      onDateRangeChange(from, to);
    }
  };

  const getTitle = () => {
    switch (user.role) {
      case USER_ROLES.SUPERADMIN:
        return "Platform Overview";
      case USER_ROLES.ADMIN:
        return "State Overview";
      case USER_ROLES.ODIRS_ADMIN:
        return "LGA Overview";
      case USER_ROLES.AGENCY_AGENT:
      case USER_ROLES.ODIRS_C_AGENT:
        return "My Activity Overview";
      default:
        return "Overview";
    }
  };

  const getSubtitle = () => {
    switch (user.role) {
      case USER_ROLES.SUPERADMIN:
        return "System-wide performance and activity summary";
      case USER_ROLES.ADMIN:
        return "State-level performance and activity summary";
      case USER_ROLES.AGENCY_ADMIN:
        return "Local Government Area performance summary";
      case USER_ROLES.AGENCY_AGENT:
      case USER_ROLES.ODIRS_C_AGENT:
        return "Your personal activity and performance";
      default:
        return "";
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
            <p className="text-muted-foreground mt-1">{getSubtitle()}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canFilterByState && (
              <Select onValueChange={onStateChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="lagos">Lagos State</SelectItem>
                  <SelectItem value="abuja">FCT Abuja</SelectItem>
                  <SelectItem value="kano">Kano State</SelectItem>
                </SelectContent>
              </Select>
            )}

            {canFilterByLGA && (
              <Select onValueChange={onLGAChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select LGA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LGAs</SelectItem>
                  <SelectItem value="lagos-mainland">Lagos Mainland</SelectItem>
                  <SelectItem value="ikeja">Ikeja</SelectItem>
                  <SelectItem value="surulere">Surulere</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? (
                    dateTo ? (
                      <>
                        {format(dateFrom, "LLL dd, y")} -{" "}
                        {format(dateTo, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateFrom, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateFrom}
                  selected={{ from: dateFrom, to: dateTo }}
                  onSelect={(range) => handleDateSelect(range?.from, range?.to)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
