'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { loadingSpinner } from '@/lib/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form'
import { getVehicleIdByPlate } from "@/actions/vehicles"
import { API, URLS } from "@/lib/const"


const addVehicleToGroupSchema = z.object({
  groupName: z 
  .string({
      required_error: 'Please enter a name',
  }),
  plateNumber: z
        .string({
             required_error: "Enter your plate number.",
        })
        .regex(/^[A-Za-z0-9]{7,9}$/, {
             message: "Plate number must be 7-9 characters and contain only letters and numbers.",
        }),
  vehicleId: z.string()
})

type addVehicleToGroupSchemaValues = z.infer<typeof addVehicleToGroupSchema>

const defaultValues: Partial<addVehicleToGroupSchemaValues> = {
  groupName: '',
  plateNumber: '',
  vehicleId: '',
}

export function AddVehicleToGroupModal({ group }: { group: any }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState('')
  
  const form = useForm<addVehicleToGroupSchemaValues>({
      resolver: zodResolver(addVehicleToGroupSchema),
      defaultValues,
      mode: "onBlur",
  });

  const existingVehiclesIds = group.vehicles.map((a: IVehicle)=> a.id)

  const getVehicleIdByPlateNumber = async (pn: string) => {
    try {
      setIsLoading(true);
      const result = await getVehicleIdByPlate(pn.trim());
      if (result) {
        if (existingVehiclesIds.includes(result.id)) {
          setIsLoading(false);
          toast.error(`Vehicle already belong to this group`);
          return;
        }
        toast.success(`Vehicle ID found for plate ${pn}:`);
        setVehicleId(result.id);
        form.setValue("vehicleId", result.id);
        setIsLoading(false);
      } else {
        toast.error(`Vehicle ID NOT found for plate ${pn}`);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(`Vehicle ID NOT found for plate ${pn}`);
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: addVehicleToGroupSchemaValues) => {
    setIsLoading(true);
    const url = `${API}${URLS.group.all}/${group.id}`;
    const newVehicleIds = [
      ...group.vehicles.map((a: IVehicle) => a.id),
      data.vehicleId,
    ];
    const payload = {
      vehicleIds: newVehicleIds.filter((id) => id.trim() !== ""),
    };
    try {
      const addVehicleToGroupResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await addVehicleToGroupResponse.json();
      if (result.status) {
        toast.success("Vehicle Added To Group successfully", {
          description: new Date().toLocaleDateString(),
        });
        router.push(`/groups/${group.id}?page=1&limit=15`);
      } else {
        toast.error("Group Not Created", {
          description: Array.isArray(result.errors?.message)
            ? result.errors.message[0]
            : result.errors?.message || "An unknown error occurred",
        });
      }
    } catch (error) {
      toast.error("An error occurred while creating the group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle to Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Vehicle to Company/Business</DialogTitle>
          <DialogDescription>
            Add one or more vehicles to the company or business.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
                <div className="grid  items-center gap-4">
                    <FormField
                    name='plateNumber'
                    control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-left">Plate Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='text'
                          className="w-full"
                          placeholder="Plate Number"
                          maxLength={9}
                          pattern="[A-Za-z0-9]{7,9}"
                          onChange={(e) => {
                              const value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
                              field.onChange(value);
                          }}
                          required
                          onBlur={async (e) => {
                              field.onBlur
                              await getVehicleIdByPlateNumber(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                </div>
                <div className="grid items-center gap-4">
                    <FormField
                    name='vehicleId'
                    control={form.control}
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-left">
                        Vehicle ID
                    </FormLabel>
                    <FormControl>
                    <Input
                        {...field}
                        className="w-full"
                        required
                            disabled
                            value={vehicleId}
                    />
                    </FormControl>
                    <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? loadingSpinner : "Add Vehicle To Company"}     
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

