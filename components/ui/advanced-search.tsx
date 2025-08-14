"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { loadingSpinner, searchIcon } from "@/lib/icons";
import type { Vehicle } from "@prisma/client";
import { Bike, Bus, Car, CarTaxiFront } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function AdvancedSearch({
  placeholder,
  variant,
  isAdmin,
}: {
  placeholder: string;
  variant: "primary" | "secondary" | "default";
  isAdmin?: boolean;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [searchVehicles, setSearchVehicles] = useState<Partial<Vehicle>[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const variants = useMemo(() => {
    switch (variant) {
      case "primary":
        return "bg-secondary text-primary-foreground";
      case "secondary":
        return "bg-background border border-input";
      default:
        return "bg-primary text-primary-foreground";
    }
  }, [variant]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push(`/search/${searchValue}`);
    },
    [router, searchValue]
  );

  const search = useDebouncedCallback(async (value: string) => {
    if (value.trim()) {
      startTransition(async () => {
        // const result = await getVehicles();
        // setSearchVehicles(result?.vehicles || []);
        setSearchVehicles([]);
      });
    } else {
      setSearchVehicles([]);
    }
  }, 300);

  const handleChange = async (value: string) => {
    setSearchValue(value);
    await search(value);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        className={`relative flex h-14 w-full items-center overflow-hidden rounded-[40px] text-body ${variants}`}
        onSubmit={handleSubmit}
      >
        <Button
          type="submit"
          variant="default"
          className="absolute z-10 aspect-square h-14 w-14 rounded-none"
        >
          {isPending ? loadingSpinner : searchIcon}
        </Button>
        <input
          name="search"
          type="text"
          placeholder={placeholder}
          value={searchValue}
          required
          onChange={(e) => handleChange(e.target.value)}
          className={`absolute h-14 w-full rounded-2xl bg-secondary py-4 pl-16 text-[14px] text-primary focus:outline-0`}
        />
      </form>
      {searchValue && (
        <Card className="mt-4">
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] w-full rounded-md border">
              {searchVehicles.length > 0 ? (
                <ul className="divide-y" role="region" aria-live="polite">
                  {searchVehicles.map((vehicle) => (
                    <li
                      key={vehicle.id}
                      className="grid gap-1 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          {vehicle.category === "BUS" ? (
                            <Bus className="h-6 w-6 text-primary" />
                          ) : vehicle.category === "TRICYCLE" ? (
                            <Car className="h-6 w-6 text-primary" />
                          ) : vehicle.category === "MOTOR_CYCLE" ? (
                            <Bike className="h-6 w-6 text-primary" />
                          ) : (
                            <CarTaxiFront className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            <Highlighted
                              content={vehicle.plateNumber}
                              query={searchValue}
                            />
                          </p>
                          <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                            <Highlighted
                              content={
                                /* @ts-ignore */
                                vehicle?.owner.name
                              }
                              query={searchValue}
                            />
                            <Highlighted
                              content={vehicle.vin}
                              query={searchValue}
                            />
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        {isAdmin && (
                          <Button size={"sm"} variant={"outline"} asChild>
                            <Link href={`/vehicles/${vehicle.id}`}>
                              Full View
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/search/${vehicle.plateNumber}`}>
                            View
                          </Link>
                        </Button>

                        {/* <Button variant="ghost" size="sm" onClick={() => router.push(isAdmin ? `/vehicles/${vehicle.id}` : `/search/${vehicle.plate_number}`)}>
                                                                      View
                                                                 </Button> */}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No vehicles found</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const Highlighted = ({ query, content }: { query: string; content?: string | null | undefined }) => {
     if (!content) return null;

     const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
     const regex = new RegExp(`(${escapedQuery})`, "gi");
     const parts = content.split(regex);

     return (
          <span>
               {parts.map((part, index) =>
                    regex.test(part) ? (
                         <mark key={index} className="rounded bg-yellow-200 px-1 dark:bg-yellow-800">
                              {part}
                         </mark>
                    ) : (
                         <React.Fragment key={index}>{part}</React.Fragment>
                    ),
               )}
          </span>
     );
};
