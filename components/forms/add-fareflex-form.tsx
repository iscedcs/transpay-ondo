"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { getVehicleByFareFlexImei } from "@/actions/vehicles";
import { loadingSpinner } from "@/lib/icons";

const vehicleFareFlexFormSchema = z.object({
     fairFlexImei: z.string({ required_error: "" }),
});

type VehicleFormValues = z.infer<typeof vehicleFareFlexFormSchema>;

export function AddFareFlexForm({ vehicleId }: { vehicleId: string }) {
     const router = useRouter();

     const defaultValues: Partial<VehicleFormValues> = {
          fairFlexImei: "",
     };
     const [isLoading, setIsLoading] = React.useState<boolean>(false);
     const { toast } = useToast();
     const form = useForm<VehicleFormValues>({
          resolver: zodResolver(vehicleFareFlexFormSchema),
          defaultValues,
          mode: "onChange",
     });

     async function onSubmit(data: VehicleFormValues) {
          setIsLoading(true);
          const existingVehicle = await getVehicleByFareFlexImei(data.fairFlexImei);
          if (existingVehicle?.success) {
               toast({
                 title: `Fareflex already assigned to vehicle with T-CODE ${existingVehicle.success.data.vehicle.plateNumber}`,
               });
               setIsLoading(false);
               return null;
          }
          try {
               const addFareFlexResponse = await fetch("/api/add-tracker", {
                    method: "PUT",
                    body: JSON.stringify({
                         fairFlexImei: data.fairFlexImei,
                         vehicle_id: vehicleId,
                    }),
               });
               const result = await addFareFlexResponse.json();
               if (addFareFlexResponse.status > 199 && addFareFlexResponse.status < 299) {
                    toast({
                         title: "Fareflex Added Successfully",
                    });
                    setIsLoading(false);
                    router.refresh();
                    return NextResponse.json(result);
               } else {
                    setIsLoading(false);
                    toast({
                         title: "Fareflex NOT Added",
                    });
                    return null;
               }
          } catch (error) {
               setIsLoading(false);
               toast({
                    title: "Fareflex NOT Added",
               });
               return null;
          }
     }

     return (
          <div className="w-full">
               <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
                         <div className="">
                              <FormField
                                   name="fairFlexImei"
                                   control={form.control}
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormControl>
                                                  <Input className="relative flex h-14 items-center rounded-2xl text-body" {...field} type="text" placeholder="Enter FareFlex  ID" />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                         </div>
                         <Button className="w-full" type="submit">
                              {isLoading ? loadingSpinner : "Add FareFlex"}
                         </Button>
                    </form>
               </Form>
          </div>
     );
}
