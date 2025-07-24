"use client";

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
import { ADMIN_ROLES } from "@/lib/const";
import { assignableRoles } from "@/lib/constants";
import { formatRoleName } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { ArrowLeft, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define the form schema with Zod
const userFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    role: z.any(),
    identification: z.string().min(1, "Identification type is required"),
    identificationNumber: z
      .string()
      .min(1, "Identification number is required"),
    address: z.object({
      text: z.string().min(1, "Street is required"),
      unit: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postal_code: z.string().optional(),
      country: z.string().default("Nigeria"),
      lga: z.string().optional(),
    }),
    lgaId: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    marital_status: z
      .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
      .optional(),
    whatsapp: z.string().optional(),
    nok_name: z.string().optional(),
    nok_phone: z.string().optional(),
    nok_relationship: z.string().optional(),
    maiden_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AddUserPage() {
  const session = useSession();
  const router = useRouter();
  if (!session?.data?.user) {
    router.push("/sign-in");
  }
  const role = session.data?.user.role;
  if (!ADMIN_ROLES.includes(String(role))) {
    toast.error("You do not have edit permission");
    router.push("/unauthorized");
  }

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
      nok_phone: "",
      nok_relationship: "",
      maiden_name: "",
    },
  });
  const rolesToOmit = [
    Role.SUPERADMIN,
    Role.ADMIN,
    Role.EIRS_ADMIN,
    Role.EIRS_AGENT,
    Role.LGA_ADMIN,
    Role.POS,
  ];

  // Fetch LGAs on component mount
  useEffect(() => {
    const fetchLGAData = async () => {
      try {
        const response = await getLGAs({ limit: 50, page: 1 });
        setLgas(response.data.map((lga) => ({ id: lga.id, name: lga.name })));
      } catch (error) {
        console.log("Failed to fetch LGAs:", error);
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
      // Prepare the user data for submission
      const userData = {
        ...data,
        address: data.address,
        identificationNumber: data.identificationNumber || nin,
      };

      // Remove confirmPassword as it's not needed in the API
      const { confirmPassword, ...userDataToSubmit } = userData;

      const result = await createUser(userDataToSubmit);

      if (!result.success) {
        toast.error(result.error); // or show inline error
      } else {
        toast.success("User created!");
        router.push("/users");
      }
    } catch (error) {
      console.log("Failed to create user:", error);
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
          <p className="text-muted-foreground">
            Create a new user account in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* NIN Verification Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>
            Enter the user's National Identification Number (NIN) to
            automatically fetch their information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="nin">National Identification Number (NIN)</Label>
              <Input
                id="nin"
                placeholder="Enter NIN"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the 11-digit NIN to fetch user information automatically
              </p>
            </div>
            <div className="flex items-end">
              <Button
                // onClick={handleVerifyNIN}
                disabled={isVerifying || !nin}
                className="flex items-center gap-2"
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isVerifying ? "Verifying..." : "Verify NIN"}
              </Button>
            </div>
          </div>

          {verificationError && (
            <Alert variant="destructive">
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card> */}

      {/* User Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="address">Address & LGA</TabsTrigger>
            <TabsTrigger value="additional">Additional Details</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the user's basic personal and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      {...form.register("phone")}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Admin Role</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("role", value as any)
                      }
                      defaultValue={form.watch("role")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles[String(session.data?.user.role)].map(
                          (role) => (
                            <SelectItem value={role} key={role}>
                              {formatRoleName(role)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("gender", value as any)
                      }
                      defaultValue={form.watch("gender") || "MALE"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Identification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="identification">
                      Means of Identification
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("identification", value)
                      }
                      defaultValue={form.watch("identification")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select identification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NIN">NIN</SelectItem>
                        {/* <SelectItem value="DRIVERS_LICENSE">
                          Driver's License
                        </SelectItem>
                        <SelectItem value="PASSPORT">
                          International Passport
                        </SelectItem>
                        <SelectItem value="VOTERS_CARD">
                          Voter's Card
                        </SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identificationNumber">
                      Identification Number
                    </Label>
                    <Input
                      id="identificationNumber"
                      placeholder="Enter identification number"
                      {...form.register("identificationNumber")}
                      defaultValue={nin}
                    />
                    {form.formState.errors.identificationNumber && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.identificationNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
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
                      <p className="text-sm text-destructive">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
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
                      <p className="text-sm text-destructive">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab("address")}>
                  Next: Address & LGA
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Address & LGA</CardTitle>
                <CardDescription>
                  Enter the user's address information and assign an LGA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      placeholder="Enter street address"
                      {...form.register("address.text")}
                    />
                    {form.formState.errors.address?.text && (
                      <p className="text-sm text-text">
                        {form.formState.errors.address.text.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit (Optional)</Label>
                    <Input
                      id="unit"
                      placeholder="Apartment, suite, unit, etc."
                      {...form.register("address.unit")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      {...form.register("address.city")}
                    />
                    {form.formState.errors.address?.city && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.address.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      {...form.register("address.state")}
                    />
                    {form.formState.errors.address?.state && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.address.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                    <Input
                      id="postalCode"
                      placeholder="Enter postal code"
                      {...form.register("address.postal_code")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      {...form.register("address.country")}
                      defaultValue="Nigeria"
                    />
                  </div>
                </div>

                <Separator />

                {/* LGA Assignment */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lga">Local Government Area (LGA)</Label>
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
                      <SelectTrigger>
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
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("additional")}
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
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Optional additional information about the user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("marital_status", value as any)
                      }
                      defaultValue={form.watch("marital_status") || "SINGLE"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="MARRIED">Married</SelectItem>
                        <SelectItem value="DIVORCED">Divorced</SelectItem>
                        <SelectItem value="WIDOWED">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                    <Input
                      id="whatsapp"
                      placeholder="Enter WhatsApp number"
                      {...form.register("whatsapp")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maiden_name">Maiden Name (Optional)</Label>
                    <Input
                      id="maiden_name"
                      placeholder="Enter maiden name if applicable"
                      {...form.register("maiden_name")}
                    />
                  </div>
                </div>

                <Separator />

                {/* Next of Kin */}
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Next of Kin Information (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nok_name">Next of Kin Name</Label>
                      <Input
                        id="nok_name"
                        placeholder="Enter next of kin name"
                        {...form.register("nok_name")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nok_phone">Next of Kin Phone</Label>
                      <Input
                        id="nok_phone"
                        placeholder="Enter next of kin phone number"
                        {...form.register("nok_phone")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nok_relationship">Relationship</Label>
                      <Input
                        id="nok_relationship"
                        placeholder="E.g., Spouse, Parent, Sibling"
                        {...form.register("nok_relationship")}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("address")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
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
