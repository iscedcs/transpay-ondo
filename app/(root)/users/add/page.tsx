"use client";

import type React from "react";

import { getLGAs } from "@/actions/lga";
import { createUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignableRoles } from "@/lib/constants";
import { formatRoleName } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSession } from "next-auth/react";

// Define the form schema with Zod - updated with new required fields
const userFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().optional(), // Made optional as per requirements
    phone: z
      .string()
      .min(10, "Phone number is required and must be at least 10 characters"),
    role: z.any(),
    identification: z.string().min(1, "Means of identification is required"),
    identificationNumber: z
      .string()
      .min(1, "Identification number is required"),
    address: z.object({
      text: z.string().min(1, "Street address is required"),
      unit: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postal_code: z.string().optional(),
      country: z.string().default("Nigeria"),
      lga: z.string().min(1, "LGA is required"),
    }),
    lgaId: z.string().min(1, "LGA selection is required"),
    password: z
      .string()
      .min(8, "Password is required and must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password confirmation is required"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      required_error: "Gender is required",
    }),
    marital_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], {
      required_error: "Marital status is required",
    }),
    maiden_name: z.string().min(1, "Mother's maiden name is required"),
    whatsapp: z.string().optional(),
    nok_name: z.string().optional(),
    nok_phone: z.string().optional(),
    nok_relationship: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AddUserPage() {
  const router = useRouter();
  const session = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nin, setNin] = useState("");
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("basic");

  // Updated tab fields with new required fields
  const tabFields = {
    basic: [
      "firstName",
      "lastName",
      "phone",
      "role",
      "identification",
      "identificationNumber",
      "password",
      "confirmPassword",
      "gender",
    ],
    address: ["address.text", "address.city", "address.state", "lgaId"],
    additional: ["marital_status", "maiden_name"],
  };

  const handleNext = async (
    event: React.MouseEvent<HTMLButtonElement>,
    currentTab: keyof typeof tabFields,
    nextTab: string
  ) => {
    event.preventDefault();

    // @ts-expect-error: ignore this error, it always happens
    const valid = await form.trigger(tabFields[currentTab]);
    if (valid) {
      setActiveTab(nextTab);
    } else {
      toast.error("Please complete all required fields before proceeding.");
    }
  };

  // Initialize form with default values
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "ADMIN",
      identification: "NIN",
      identificationNumber: "",
      address: {
        text: "",
        unit: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Nigeria",
        lga: "",
      },
      lgaId: "",
      password: "",
      confirmPassword: "",
      gender: "MALE",
      marital_status: "SINGLE",
      whatsapp: "",
      nok_name: "",
      nok_relationship: "",
      maiden_name: "",
    },
  });

  // Fetch LGAs on component mount
  useEffect(() => {
    const fetchLGAData = async () => {
      try {
        const response = await getLGAs({ limit: 50, page: 1 });
        setLgas(response.data.map((lga) => ({ id: lga.id, name: lga.name })));
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load LGA data. Please try again later.",
        });
      }
    };

    fetchLGAData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);

    try {
      // Generate email from phone number if not provided
      const email =
        data.email && data.email.trim() !== ""
          ? data.email
          : `${data.phone}@transpayedo.com`;

      // Prepare the user data for submission
      const userData = {
        ...data,
        email, // Use generated or provided email
        address: data.address,
        identification: {
          number: data.identificationNumber,
          type: data.identification,
        },
      };

      // Remove confirmPassword as it's not needed in the API
      const { confirmPassword, ...userDataToSubmit } = userData;
      console.log({ userDataToSubmit });

      const result = await createUser(userDataToSubmit);

      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("User created successfully!");
        router.push("/");
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create user. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Add New User
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create a new user account in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* User Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="address" className="text-xs sm:text-sm">
              Address & LGA
            </TabsTrigger>
            <TabsTrigger value="additional" className="text-xs sm:text-sm">
              Additional
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Basic Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Enter the user's basic personal and account information.
                  Fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      className="text-sm"
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      className="text-sm"
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      className="text-sm"
                      {...form.register("email")}
                    />
                    <p className="text-xs text-muted-foreground">
                      If not provided, we'll use your phone number with
                      @transpayedo.com
                    </p>
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      className="text-sm"
                      {...form.register("phone")}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Admin Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("role", value as any)
                      }
                      defaultValue={form.watch("role")}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles[
                          session?.data?.user?.role ?? "VEHICLE_OWNER"
                        ].map((role) => (
                          <SelectItem value={role} key={role}>
                            {formatRoleName(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("gender", value as any)
                      }
                      defaultValue={form.watch("gender") || "MALE"}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.gender && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="identification"
                      className="text-sm font-medium"
                    >
                      Means of Identification{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("identification", value)
                      }
                      defaultValue={form.watch("identification")}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select identification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NIN">NIN</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.identification && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.identification.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="identificationNumber"
                      className="text-sm font-medium"
                    >
                      Identification Number{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="identificationNumber"
                      placeholder="Enter identification number"
                      className="text-sm"
                      {...form.register("identificationNumber")}
                      defaultValue={nin}
                    />
                    {form.formState.errors.identificationNumber && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.identificationNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="text-sm pr-10"
                        {...form.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className="text-sm pr-10"
                        {...form.register("confirmPassword")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleNext(e, "basic", "address")}
                  size="sm"
                >
                  Next: Address & LGA
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Address & LGA
                </CardTitle>
                <CardDescription className="text-sm">
                  Enter the user's address information and assign an LGA. Fields
                  marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-medium">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="street"
                      placeholder="Enter street address"
                      className="text-sm"
                      {...form.register("address.text")}
                    />
                    {form.formState.errors.address?.text && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.address.text.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm font-medium">
                      Unit{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="unit"
                      placeholder="Apartment, suite, unit, etc."
                      className="text-sm"
                      {...form.register("address.unit")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      className="text-sm"
                      {...form.register("address.city")}
                    />
                    {form.formState.errors.address?.city && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.address.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      className="text-sm"
                      {...form.register("address.state")}
                    />
                    {form.formState.errors.address?.state && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.address.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium">
                      Postal Code{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="Enter postal code"
                      className="text-sm"
                      {...form.register("address.postal_code")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      className="text-sm"
                      {...form.register("address.country")}
                      defaultValue="Nigeria"
                    />
                  </div>
                </div>

                <Separator />

                {/* LGA Assignment */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lga" className="text-sm font-medium">
                      Local Government Area (LGA){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        form.setValue("lgaId", value);
                        // Find the LGA name and set it in the address
                        const selectedLga = lgas.find(
                          (lga) => lga.id === value
                        );
                        if (selectedLga) {
                          form.setValue("address.lga", selectedLga.name);
                        }
                      }}
                      defaultValue={form.watch("lgaId")}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        {lgas.length > 0 ? (
                          lgas.map((lga) => (
                            <SelectItem key={lga.id} value={lga.id}>
                              {lga.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading LGAs...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Assign the user to a specific Local Government Area
                    </p>
                    {form.formState.errors.lgaId && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.lgaId.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                  size="sm"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleNext(e, "address", "additional")}
                  size="sm"
                >
                  Next: Additional Details
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Additional Details Tab */}
          <TabsContent value="additional" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Additional Details
                </CardTitle>
                <CardDescription className="text-sm">
                  Additional information about the user. Fields marked with *
                  are required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="marital_status"
                      className="text-sm font-medium"
                    >
                      Marital Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("marital_status", value as any)
                      }
                      defaultValue={form.watch("marital_status") || "SINGLE"}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="MARRIED">Married</SelectItem>
                        <SelectItem value="DIVORCED">Divorced</SelectItem>
                        <SelectItem value="WIDOWED">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.marital_status && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.marital_status.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="maiden_name"
                      className="text-sm font-medium"
                    >
                      Mother's Maiden Name{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="maiden_name"
                      placeholder="Enter mother's maiden name"
                      className="text-sm"
                      {...form.register("maiden_name")}
                    />
                    {form.formState.errors.maiden_name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.maiden_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm font-medium">
                      WhatsApp Number{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="whatsapp"
                      placeholder="Enter WhatsApp number"
                      className="text-sm"
                      {...form.register("whatsapp")}
                    />
                  </div>
                </div>

                <Separator />

                {/* Next of Kin */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-4">
                    Next of Kin Information{" "}
                    <span className="text-muted-foreground text-sm">
                      (Optional)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nok_name" className="text-sm font-medium">
                        Next of Kin Name
                      </Label>
                      <Input
                        id="nok_name"
                        placeholder="Enter next of kin name"
                        className="text-sm"
                        {...form.register("nok_name")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="nok_phone"
                        className="text-sm font-medium"
                      >
                        Next of Kin Phone
                      </Label>
                      <Input
                        id="nok_phone"
                        placeholder="Enter next of kin phone number"
                        className="text-sm"
                        {...form.register("nok_phone")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="nok_relationship"
                        className="text-sm font-medium"
                      >
                        Relationship
                      </Label>
                      <Input
                        id="nok_relationship"
                        placeholder="E.g., Spouse, Parent, Sibling"
                        className="text-sm"
                        {...form.register("nok_relationship")}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("address")}
                  size="sm"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
