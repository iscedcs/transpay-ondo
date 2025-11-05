"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { API, URLS } from "@/lib/const";

export function SearchVehicleForm({
  onResult,
  onClear,
}: {
  onResult: (vehicle: any) => void;
  onClear: () => void;
}) {
  const { data: session } = useSession();
  const token = session?.user?.access_token;
  const [searchData, setSearchData] = useState({
    plateNumber: "",
    securityCode: "",
    barcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (
      !searchData.plateNumber &&
      !searchData.securityCode &&
      !searchData.barcode
    ) {
      toast.error("Please enter at least one search field");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API}${URLS.agency_agent.search}`,
        searchData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success && res.data?.data) {
        onResult(res.data.data);
        toast.success("Vehicle found!");
      } else {
        toast.error("No vehicle found for provided details.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Search failed", {
        description: err?.response?.data?.message || "Try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Plate Number"
          value={searchData.plateNumber}
          onChange={(e) =>
            setSearchData({ ...searchData, plateNumber: e.target.value })
          }
        />
        <Input
          placeholder="Security Code"
          value={searchData.securityCode}
          onChange={(e) =>
            setSearchData({ ...searchData, securityCode: e.target.value })
          }
        />
        <Input
          placeholder="Barcode"
          value={searchData.barcode}
          onChange={(e) =>
            setSearchData({ ...searchData, barcode: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClear}>
          Clear
        </Button>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
}
