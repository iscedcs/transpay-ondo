'use client'

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { loadingSpinner } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { Separator } from "./separator";

const COMPANYCATEGORIES = ["MASS_TRANSIT", "PRIVATE"] as const;
const directorSchema = z.object({
  directorName: z.string().min(1, { message: "Please enter a valid name" }),

  directorAsin: z
    .string({ required_error: "Please enter a valid asin" })
    .max(12, { message: "The ASIN must be 12 characters long." }),
  directorPhoneNo: z
    .string({
      required_error: "Please enter phone number.",
    })
    .regex(/^\+234[789][01]\d{8}$/, "Phone format (+2348012345678)"),
});
const newGroupSchema = z.object({
  groupName: z.string({
    required_error: "Please enter a name",
  }),
  // plateNumber: z
  //   .string({
  //     required_error: "Enter your plate number.",
  //   })
  //   .regex(/^[A-Za-z0-9]{7,9}$/, {
  //     message:
  //       "Plate number must be 7-9 characters and contain only letters and numbers.",
  //   }),

  employeeNo: z.string().min(1, { message: "Please enter a valid number" }),
  vehicleNo: z.string().min(1, { message: "Please enter a valid number" }),
  businessAddress: z
    .string()
    .min(1, { message: "Please enter a valid address" }),
  businessAsin: z
    .string()
    .max(12, { message: "Business ASIN must be 12 characters long." }),
  companyCategory: z.enum(COMPANYCATEGORIES, {
    required_error: "Please select a category",
    invalid_type_error: "Please select a valid category",
    message: "Please select a category option",
  }),
  directorSchemaArray: z
    .array(directorSchema)
    .min(1, "At least one director is required"),
  // vehicleId: z.string(),
});

type newGroupSchemaValues = z.infer<typeof newGroupSchema>;
const defaultValues: Partial<newGroupSchemaValues> = {
  groupName: "",
  directorSchemaArray: [
    { directorName: "", directorAsin: "", directorPhoneNo: "" },
  ],
  businessAsin: "",
  employeeNo: "",
  vehicleNo: "",
  companyCategory: "MASS_TRANSIT",
  businessAddress: "",
  // plateNumber: "",
  // vehicleId: "",
};

export function AddGroupModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  // const [existingFields, setExistingFields] = React.useState<Set<string>>(
  //   new Set()
  // );
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState("");
  const form = useForm<newGroupSchemaValues>({
    resolver: zodResolver(newGroupSchema),
    defaultValues,
    mode: "all",
  });

  // Use setValue from react-hook-form to update the vehicleId
  const { setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "directorSchemaArray",
  });

  const isMassTransit = form.watch("companyCategory");

  const addDirector = () => {
    append({ directorAsin: "", directorName: "", directorPhoneNo: "" });
  };
  const removeDirector = () => {
    remove(fields.length - 1);
  };

  const onSubmit = async (data: newGroupSchemaValues) => {
    setIsLoading(true);
    const url = "/api/add-company";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.groupName,
        directors: {
          directors: data.directorSchemaArray.map((director) => ({
            name: director.directorName,
            asinNumber: director.directorAsin,
            phoneNumber: director.directorPhoneNo,
          })),
        },
        category: data.companyCategory,
        asin: data.businessAsin,
        address: data.businessAddress,
      }),
    });
    try {
      const result = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        toast.error("Something is wrong", {
          description: "An error occured",
        });
      } else {
        toast.success("Company created successfully", {
          description: "Successful",
        });
        form.reset();
      }
    } catch (error) {
      toast.error("Company not created");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Company/Business
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Company/Business</DialogTitle>
          <DialogDescription>
            Create a new company and attach it to a vehicle.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className=" h-[400px] rounded-lg">
              <div className="py-4 ">
                <div className="grid mb-[20px]  grid-cols-2 gap-4">
                  <FormField
                    name="groupName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left">
                          Company Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter company/business name"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                            }}
                            className="w-full"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="companyCategory"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Business Category</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Business Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MASS_TRANSIT">
                              Mass Transit
                            </SelectItem>
                            <SelectItem value="PRIVATE">Private</SelectItem>
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isMassTransit === "MASS_TRANSIT" && (
                    <FormField
                      name="businessAsin"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-left">
                            Business ASIN Number:
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="Enter business asin number"
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                              }}
                              className="w-full"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    name="businessAddress"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left">
                          Business Address:
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter business address"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                            }}
                            className="w-full"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="employeeNo"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left">
                          Number of Employees:
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter director phone number"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                            }}
                            className="w-full"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="vehicleNo"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left">
                          Number of Vehicles:
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter the number of vehicles"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                            }}
                            className="w-full"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator />
                <div className=" ">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 mt-[10px] grid-cols-2"
                    >
                      <FormField
                        name={`directorSchemaArray.${index}.directorName`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-left">
                              Director Name:
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter director name"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);
                                }}
                                className="w-full"
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name={`directorSchemaArray.${index}.directorAsin`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-left">
                              Director ASIN Number:
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter director asin number"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);
                                }}
                                className="w-full"
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name={`directorSchemaArray.${index}.directorPhoneNo`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-left">
                              Director Phone Number:
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter director phone number"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);
                                }}
                                className="w-full"
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div className=" flex mt-[20px] gap-2">
                  <Button
                    className=" flex gap-2"
                    onClick={addDirector}
                    type="button"
                  >
                    <PlusIcon /> Add Director
                  </Button>
                  {fields.length > 1 && (
                    <Button
                      className=" flex gap-2"
                      onClick={removeDirector}
                      type="button"
                    >
                      <Minus /> Remove Director
                    </Button>
                  )}
                </div>
                {/* <div className="grid  items-center gap-4">
                  <FormField
                    name="plateNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left">Plate Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            className="w-full"
                            placeholder="Plate Number"
                            maxLength={9}
                            pattern="[A-Za-z0-9]{7,9}"
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/[^A-Za-z0-9]/g, "")
                                .toUpperCase();
                              field.onChange(value);
                            }}
                            required
                            onBlur={async (e) => {
                              field.onBlur;
                              await handleCheckExistingPlateNumber(
                                "plate_number",
                                e.target.value
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? loadingSpinner : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
