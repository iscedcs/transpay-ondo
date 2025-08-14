"use client";

import { VehicleFilter, getVehicles } from "@/actions/vehicles";
import { PaginationISCE } from "@/components/shared/pagination-isce";
import AgentSearchBar from "@/components/ui/agent-search-bar";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { vehiclesColumns } from "@/components/ui/table/columns";
import { DataTable } from "@/components/ui/table/data-table";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface VehiclesClientProps {
     initialVehicles: any[];
     initialPagination: {
          page: number;
          pageSize: number;
          totalCount: number;
          totalPages: number;
     };
     userRole: string;
}

function VehicleTableSkeleton() {
     return (
          <div className="space-y-1">
               {[...Array(15)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                         <Skeleton className="h-12 w-full" />
                    </div>
               ))}
          </div>
     );
}

export default function VehiclesClient({ initialVehicles, initialPagination, userRole }: VehiclesClientProps) {
     const router = useRouter();
     const searchParams = useSearchParams();
     const [vehicles, setVehicles] = useState<any[]>(initialVehicles);
     const [pagination, setPagination] = useState(initialPagination);
     const [search, setSearch] = useState("");
     const [filter, setFilter] = useState<VehicleFilter>({});
     const [isLoading, setIsLoading] = useState(false);
     

     const fetchVehicles = useCallback(
       async (page: number, searchTerm: string) => {
         setIsLoading(true);
         const newFilter = { ...filter, search: searchTerm };
         try {
           const { vehicles, pagination } = await getVehicles();
           setVehicles(vehicles);
           setPagination(pagination);
           setFilter(newFilter);
         } catch (error) {
         } finally {
           setIsLoading(false);
         }
       },
       [filter, initialPagination.pageSize]
     );

     const debouncedFetch = useDebouncedCallback((searchTerm: string) => fetchVehicles(1, searchTerm), 300);

     const handleSearchChange = useCallback(
          (e: React.ChangeEvent<HTMLInputElement>) => {
               const newSearchTerm = e.target.value;
               setSearch(newSearchTerm);
               debouncedFetch(newSearchTerm);
          },
          [debouncedFetch],
     );

     useEffect(() => {
          const page = Number(searchParams.get("page")) || 1;
          const searchTerm = searchParams.get("search") || "";
          setSearch(searchTerm);
          fetchVehicles(page, searchTerm);
     }, [searchParams, fetchVehicles]);

     const isRestrictedUser = userRole?.toLowerCase() === "agent" || userRole?.toLowerCase() === "green_engine";

     return (
          <>
               <div className="flex items-center justify-between font-bold uppercase">
                    <div className="shrink-0 grow-0">VEHICLES</div>
                    {!isRestrictedUser && (
                         <div className="shrink-0 grow-0">
                              <Link href="/vehicles/new-vehicle" className={cn(buttonVariants(), "")}>
                                   <Plus className="mr-2 h-4 w-4 shrink-0" />
                                   NEW VEHICLE
                              </Link>
                         </div>
                    )}
               </div>
               <div className="inline-flex h-10 w-full items-end justify-start border-b border-primary bg-background text-muted-foreground">
                    <div className="inline-flex items-center justify-center whitespace-nowrap border-primary px-3 py-1.5 text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-2 data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                         All Vehicles
                    </div>
               </div>
               {!isRestrictedUser ? (
                    <>
                         <div className="flex items-center py-4 text-title2">
                              <div className="relative flex w-full items-center">
                                   <Search className="absolute left-2 h-6 w-6 shrink-0 opacity-60" />
                                   <Input placeholder="Search Here" value={search} onChange={handleSearchChange} className="pl-10" aria-label="Search vehicles" />
                              </div>
                         </div>
                         <div className="mb-10 flex flex-col gap-5">{isLoading ? <VehicleTableSkeleton /> : <DataTable columns={vehiclesColumns} data={vehicles} />}</div>
                         <PaginationISCE
                              hasNextPage={pagination.page < pagination.totalPages}
                              hasPrevPage={pagination.page > 1}
                              page={pagination.page}
                              limit={pagination.pageSize}
                              total={pagination.totalCount}
                              hrefPrefix="/vehicles"
                         />
                    </>
               ) : (
                    <div className="mx-auto mt-10 grid h-full w-full max-w-[500px] place-items-center">
                         <AgentSearchBar placeholder="Enter T-Code" variant="primary" />
                    </div>
               )}
          </>
     );
}
