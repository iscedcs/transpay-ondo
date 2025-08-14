"use client";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { loadingSpinner } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Minus, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  directorEmail: z
    .string()
    .email({ message: "Enter a valid email address" })
    .optional(),
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
  businessPhoneNumber: z
    .string({
      required_error: "Please enter phone number.",
    })
    .regex(/^\+234[789][01]\d{8}$/, "Phone format (+2348012345678)"),
  // employeeNo: z.string().min(1, { message: "Please enter a valid number" }),
  // vehicleNo: z.string().min(1, { message: "Please enter a valid number" }),
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

export function UpdateAddModal({ company }: { company: ICompany }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [isEditing, setIsEditing] = useState(false);
  // const [info, setInfo] = useState<ICompany>();

  const companyDirectors = company.directors;

  const router = useRouter();
  const [vehicleId, setVehicleId] = useState("");

  const defaultValues: Partial<newGroupSchemaValues> = {
    groupName: company.name ?? "",
    directorSchemaArray: companyDirectors.map((director) => ({
      directorName: director.name,
      directorAsin: director.asin_number,
      directorPhoneNo: director.phone,
      directorEmail: director.email,
    })),
    businessAsin: company.asin ?? "",
    companyCategory: company.category ?? "MASS_TRANSIT",
    businessAddress: company.address ?? "",
    businessPhoneNumber: company.phone ?? "",
  };
  const form = useForm<newGroupSchemaValues>({
    resolver: zodResolver(newGroupSchema),
    defaultValues,
    mode: "all",
  });

  const { setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "directorSchemaArray",
  });

  const isMassTransit = form.watch("companyCategory");

  const addDirector = () => {
    append({
      directorAsin: "",
      directorName: "",
      directorPhoneNo: "",
      directorEmail: "",
    });
  };
  const removeDirector = () => {
    remove(fields.length - 1);
  };

  const onSubmit = async (data: newGroupSchemaValues) => {
    setIsLoading(true);
    try {
      const url = "/api/update-company";
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: company.id,
          name: data.groupName,
          directors: data.directorSchemaArray.map((director) => ({
            name: director.directorName,
            asinNumber: director.directorAsin,
            phoneNumber: director.directorPhoneNo,
            email: director.directorEmail,
          })),
          category: data.companyCategory,
          asin: data.businessAsin,
          address: data.businessAddress,
          phone: data.businessPhoneNumber,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        toast.error("Changes were not saved", {
          description: "There was a problem updating this company",
        });
      } else {
        toast.success("Company updated successfully", {
          description: data.groupName + " was updated successfully",
        });
        router.refresh();
      }
      form.reset();
    } catch (error) {
      toast.error("Something went wrong", {
        description: "There was a problem with creating a company",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    // TODO: Handle form validation errors
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" gap-2 flex justify-center">
          <Edit className=" h-4 w-4" />{" "}
          <p className=" hidden md:inline">Edit Company</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Company Information</DialogTitle>
          <DialogDescription>
            Edit the information of registered company.
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
                            disabled={!isEditing}
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
                        <Select
                          disabled={!isEditing}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                    name="businessPhoneNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left">
                          Business Phone Number:
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            type="text"
                            placeholder="Enter business phone number"
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
                                disabled={!isEditing}
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
                                disabled={!isEditing}
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
                                disabled={!isEditing}
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
                        name={`directorSchemaArray.${index}.directorEmail`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-left">
                              Director Email Address:
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={!isEditing}
                                {...field}
                                type="text"
                                placeholder="Enter director email address"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);
                                }}
                                className="w-full"
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
                    disabled={!isEditing}
                    onClick={addDirector}
                    type="button"
                  >
                    <PlusIcon /> Add Director
                  </Button>
                  {fields.length > 1 && (
                    <Button
                      className=" flex gap-2"
                      onClick={removeDirector}
                      disabled={!isEditing}
                      type="button"
                    >
                      <Minus /> Remove Director
                    </Button>
                  )}
                </div>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            <DialogFooter>
              {!isEditing && (
                <Button
                  onClick={() => {
                    setIsEditing(true);
                  }}
                  type="button"
                >
                  Edit Company
                </Button>
              )}

              {isEditing && (
                <Button
                  className=" md:mt-0 mt-[10px]"
                  onClick={() => {
                    setIsEditing(false);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
              )}

              {isEditing && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? loadingSpinner : "Save Changes"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
