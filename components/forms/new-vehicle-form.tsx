"use client";

import CONFIG from "@/config";
import {
  BUS_IMAGE_SAMPLE,
  FNTC,
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORIES_PRICE,
} from "@/lib/const";
import { loadingSpinner } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const vehicleFormSchema = z.object({
  category: z
    .string({
      required_error: "Please enter a valid Category.",
    })
    .refine((value) => VEHICLE_CATEGORIES.includes(value), {
      message: "Invalid vehicle category.",
    }),
  plateNumber: z
    .string({
      required_error: "Enter your plate number.",
    })
    .regex(/^[A-Za-z0-9]{7,9}$/, {
      message:
        "Plate number must be 7-9 characters and contain only letters and numbers.",
    }),
  stateCode: z.string().optional(),
  vCode: z.string().optional(), // Made optional since it will be auto-generated
  color: z.string().optional(), // Made optional
  image: z.string().optional(), // Made optional
  status: z.string().optional(), // Made optional
  type: z.string().optional(), // Made optional
  vin: z
    .string({
      required_error: "Chassis number is required.",
    })
    .min(5, {
      message: "Enter valid chassis number",
    }),
  // Owner information remains the same
  owner_firstName: z
    .string({
      required_error: "Enter owner firstname.",
    })
    .min(3, {
      message: "Enter firstname",
    }),
  owner_lastName: z
    .string({
      required_error: "Enter owner lastname.",
    })
    .min(3, {
      message: "Enter lastname",
    }),
  owner_phone: z
    .string({
      required_error: "Enter owner phone number.",
    })
    .regex(/^\+234[0-9]{9,10}$/, "Enter a valid Nigerian phone number"),
  owner_address_text: z
    .string({
      required_error: "Enter owner address.",
    })
    .min(5, {
      message: "Enter full address",
    }),
  owner_dob: z.string({
    required_error: "Date of birth is required for account creation.",
  }),
  owner_gender: z.string({
    required_error: "Select gender",
  }),
  owner_marital_status: z.string({
    required_error: "Select marital status",
  }),
  owner_whatsapp: z.string().optional(),
  owner_email: z.string().email("Enter a valid email").optional(),
  owner_nok_name: z.string({
    required_error: "Next of kin name is required.",
  }),
  owner_nok_phone: z.string({
    required_error: "Next of kin phone is required.",
  }),
  owner_nok_relationship: z.string({
    required_error: "Next of kin relationship is required.",
  }),
  owner_maiden_name: z.string().optional(),
  owner_address_lga: z.string({
    required_error: "LGA is required.",
  }),
  owner_address_city: z.string({
    required_error: "City is required.",
  }),
  owner_address_state: z.string({
    required_error: "State is required.",
  }),
  owner_address_unit: z.string().optional(),
  owner_address_country: z.string({
    required_error: "Country is required.",
  }),
  owner_address_postal_code: z.string().optional(),
  owner_identification_type: z.string({
    required_error: "BVN is required.",
  }),
  owner_identification_number: z
    .string({
      required_error: "Enter BVN number.",
    })
    .regex(/^\d{11}$/, {
      message: "BVN must be exactly 11 digits.",
    }),
});

type vehicleFormValues = z.infer<typeof vehicleFormSchema>;

const defaultValues: Partial<vehicleFormValues> = {
  category: "TRICYCLE",
  status: "ACTIVE",
  owner_phone: "+234",
  owner_address_text: "",
  owner_identification_type: "BVN",
  owner_identification_number: "",
  owner_address_state: CONFIG.stateName,
  owner_address_country: CONFIG.country,
  owner_gender: "MALE",
  owner_marital_status: "SINGLE",
};

export default function CreateVehicleForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm<vehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data: vehicleFormValues) => {
    console.log("Form submitted with data:", data);

    setIsLoading(true);
    try {
      // Structure the data according to the API schema
      const vehicleData = {
        category: data.category,
        plateNumber: data.plateNumber,
        stateCode: data.stateCode || "",
        color: data.color || "OFFICIAL COLOR",
        image: data.image || BUS_IMAGE_SAMPLE,
        status: "ACTIVE", // Always set to ACTIVE
        type: data.type || "",
        vin: data.vin,
        owner: {
          firstName: data.owner_firstName,
          lastName: data.owner_lastName,
          phone: data.owner_phone,
          address: {
            text: data.owner_address_text,
            lga: data.owner_address_lga,
            city: data.owner_address_city,
            state: data.owner_address_state,
            unit: data.owner_address_unit || "",
            country: data.owner_address_country,
            postal_code: data.owner_address_postal_code || "",
          },
          dob: data.owner_dob,
          gender: data.owner_gender,
          marital_status: data.owner_marital_status,
          whatsapp: data.owner_whatsapp || data.owner_phone,
          email: data.owner_email || "",
          identification: {
            type: "BVN",
            number: data.owner_identification_number,
          },
          nok_name: data.owner_nok_name,
          nok_phone: data.owner_nok_phone,
          nok_relationship: data.owner_nok_relationship,
          maiden_name: data.owner_maiden_name || "",
        },
      };

      const createVehicleResponse = await fetch("/api/create-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleData),
      });
      const result = await createVehicleResponse.json();

      if (createVehicleResponse.ok) {
        toast.success("Vehicle Created successfully", {
          description: new Date().toLocaleDateString(),
        });
        router.push("/vehicles/");
      } else {
        toast.error("Vehicle Not Created", {
          description: Array.isArray(result.message)
            ? result.message[0]
            : result.message || "An unknown error occurred",
        });
      }
    } catch (error) {
      console.log("Error creating vehicle:", error);
      toast.error("An error occurred while creating the vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for field tooltips
  const FieldTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex h-12 w-full shrink-0 items-center overflow-hidden rounded-2xl bg-primary text-white">
          <div className="h-12 w-12 bg-black p-3">
            <Plus />
          </div>
          <div className="p-3">VEHICLE INFORMATION</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            name="category"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Vehicle Category <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="relative flex h-14 items-center rounded-2xl text-body">
                      <SelectValue placeholder="Select a vehicle category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VEHICLE_CATEGORIES_PRICE.map((cat, i) => (
                      <SelectItem value={cat.name} key={i}>
                        {cat.name.split("_").join(" ")} -{" "}
                        {FNTC.format(cat.price)}
                        /Week
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="plateNumber"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  Plate Number <span className="text-destructive">*</span>
                  <FieldTooltip content="Must be unique. 7-9 characters, letters and numbers only." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body uppercase"
                    {...field}
                    type="text"
                    placeholder="Plate Number"
                    maxLength={9}
                    pattern="[A-Za-z0-9]{7,9}"
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase();
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="vin"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Chasis Number (VIN){" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter Chassis Number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="stateCode"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  State Code
                  <FieldTooltip content="State-specific code for the vehicle." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter state code (optional)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Separator className="my-2" />
        <div className="flex h-12 w-full shrink-0 items-center overflow-hidden rounded-2xl bg-primary text-white">
          <div className="h-12 w-12 bg-black p-3">
            <Plus />
          </div>
          <div className="p-3">OWNER&apos;S INFORMATION</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            name="owner_firstName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Firstname <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter owner firstname"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_lastName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Lastname <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter owner lastname"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_phone"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  Phone <span className="text-destructive">*</span>
                  <FieldTooltip content="Must be unique. Nigerian phone number format." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="+2349012345678"
                    value={field.value || "+234"}
                    onChange={(e) => {
                      let value = e.target.value;

                      // If value doesn't start with +234, handle formatting
                      if (!value.startsWith("+234")) {
                        // If user is trying to type from scratch, enforce +234
                        if (!value.startsWith("+")) {
                          value = "+234" + value;
                        }
                      }

                      // Remove the first 0 after +234 if present
                      if (value.startsWith("+2340")) {
                        value = "+234" + value.substring(5);
                      }

                      // Only allow digits after +234
                      const cleaned =
                        "+234" + value.substring(4).replace(/\D/g, "");

                      // Limit to proper length for Nigerian numbers
                      const finalValue = cleaned.substring(0, 14);

                      field.onChange(finalValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_dob"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  Date of Birth <span className="text-destructive">*</span>
                  <FieldTooltip content="Required for virtual account creation." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="date"
                    placeholder="YYYY-MM-DD"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_gender"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Gender <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="relative flex h-14 items-center rounded-2xl text-body">
                        <SelectValue placeholder="Choose Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">MALE</SelectItem>
                      <SelectItem value="FEMALE">FEMALE</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_marital_status"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Marital Status <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="relative flex h-14 items-center rounded-2xl text-body">
                        <SelectValue placeholder="Choose Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">SINGLE</SelectItem>
                      <SelectItem value="married">MARRIED</SelectItem>
                      <SelectItem value="divorced">DIVORCED</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  Email
                  <FieldTooltip content="Optional. If provided, must be unique. If not provided, an email will be generated." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="email"
                    placeholder="Enter email of owner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_whatsapp"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  WhatsApp Number
                  <FieldTooltip content="Optional. If not provided, phone number will be used." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter WhatsApp number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_maiden_name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  Maiden Name
                  <FieldTooltip content="Optional. Maiden name if applicable." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter maiden name if applicable"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            name="owner_address_text"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Residential Address{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter address of owner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_address_city"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  City <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter city"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_address_lga"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  LGA <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="relative flex h-14 items-center rounded-2xl text-body">
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONFIG.lgas.map((lga, k) => (
                      <SelectItem key={k} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_address_country"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Country <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter country"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_address_postal_code"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Postal Code
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter postal code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_identification_number"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold flex items-center">
                  BVN <span className="text-destructive">*</span>
                  <FieldTooltip content="Bank Verification Number - must be exactly 11 digits." />
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter 11-digit BVN"
                    maxLength={11}
                    pattern="\d{11}"
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Next of Kin Information */}
        <div className="flex h-12 w-full shrink-0 items-center overflow-hidden rounded-2xl bg-primary text-white mt-4">
          <div className="h-12 w-12 bg-black p-3">
            <Plus />
          </div>
          <div className="p-3">NEXT OF KIN INFORMATION</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            name="owner_nok_name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Next of Kin Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter next of kin name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_nok_phone"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Next of Kin Phone <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter next of kin phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="owner_nok_relationship"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pl-4 text-title1Bold">
                  Relationship <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="relative flex h-14 items-center rounded-2xl text-body"
                    {...field}
                    type="text"
                    placeholder="Enter relationship (e.g., Sibling)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-center gap-6 text-title1Bold mt-6">
          <Button
            variant={"outline"}
            size="lg"
            type="button"
            asChild
            className="rounded-normal w-28 p-4 py-2"
          >
            <Link href={"/vehicles?page=1&limit=15"}>Back</Link>
          </Button>
          <Button
            variant="default"
            size="lg"
            type="submit"
            className="rounded-normal w-28 p-4 py-2"
            disabled={isLoading}
          >
            {isLoading ? loadingSpinner : "Add Vehicle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
