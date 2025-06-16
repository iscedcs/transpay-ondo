"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserById, updateUser, type User } from "@/actions/users";
import {
  userEditFormSchema,
  type UserEditFormValues,
  roleOptions,
  genderOptions,
  maritalStatusOptions,
  identificationOptions,
} from "../../user-edit-form-validation";
import { parseAddressExtended } from "@/lib/utils";
import { getLGAs } from "@/actions/lga";
import { toast } from "sonner";

// Update the identification handling
interface IdentificationData {
  idType: string;
  value: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "ADMIN",
      identification: "NIN",
      identificationNumber: "",
      address: {
        street: "",
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
      blacklisted: false,
    },
  });

  // Watch for form changes
  const watchedValues = form.watch();
  useEffect(() => {
    if (user) {
      const hasFormChanges = Object.keys(watchedValues).some((key) => {
        const currentValue = watchedValues[key as keyof UserEditFormValues];
        const originalValue = getOriginalValue(key as keyof UserEditFormValues);
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      });
      setHasChanges(hasFormChanges);
    }
  }, [watchedValues, user]);

  // Get original value for comparison
  const getOriginalValue = (key: keyof UserEditFormValues) => {
    if (!user) return undefined;

    switch (key) {
      case "address":
        return (
          parseAddressExtended(user.address) || {
            street: "",
            unit: "",
            city: "",
            state: "",
            postal_code: "",
            country: "Nigeria",
            lga: "",
          }
        );
      case "blacklisted":
        return user.blacklisted;
      default:
        return user[key as keyof User] || "";
    }
  };

  const parseIdentification = (
    identification: string | null | undefined
  ): IdentificationData | null => {
    if (!identification) return null;

    try {
      return JSON.parse(identification) as IdentificationData;
    } catch (error) {
      console.error("Error parsing identification:", error);
      return null;
    }
  };

  // Fetch user data and LGAs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        setError(null);

        // Fetch user data and LGAs in parallel
        const [userData, lgaResponse] = await Promise.all([
          getUserById(String(params.id)),
          getLGAs({ limit: 100, page: 1 }),
        ]);

        setUser(userData);
        setLgas(
          lgaResponse.data.map((lga) => ({ id: lga.id, name: lga.name }))
        );

        // Populate form with user data
        const address = parseAddressExtended(userData.address);

        // In the useEffect where form is populated, update the identification parsing:
        const identificationData = parseIdentification(userData.identification);

        form.reset({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "ADMIN",
          identification: identificationData?.idType || "NIN",
          identificationNumber: "", // Don't populate for security
          address: address || {
            street: "",
            unit: "",
            city: "",
            state: "",
            postal_code: "",
            country: "Nigeria",
            lga: "",
          },
          lgaId: userData.lgaId || "",
          password: "",
          confirmPassword: "",
          gender: userData.gender || "MALE",
          marital_status: userData.marital_status || "SINGLE",
          whatsapp: userData.whatsapp || "",
          nok_name: userData.nok_name || "",
          nok_phone: userData.nok_phone || "",
          nok_relationship: userData.nok_relationship || "",
          maiden_name: userData.maiden_name || "",
          blacklisted: userData.blacklisted || false,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user data"
        );
        console.error("Error fetching data:", err);
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, form]);

  // Handle form submission
  const onSubmit = async (data: UserEditFormValues) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Prepare the user data for submission
      const updateData: Partial<User> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        // @ts-expect-error: skip the identificationNumber for security
        address: data.address,
        lgaId: data.lgaId || undefined,
        gender: data.gender,
        marital_status: data.marital_status,
        whatsapp: data.whatsapp || undefined,
        nok_name: data.nok_name || undefined,
        nok_phone: data.nok_phone || undefined,
        nok_relationship: data.nok_relationship || undefined,
        maiden_name: data.maiden_name || undefined,
        blacklisted: data.blacklisted,
      };

      // Only include identification if provided
      if (data.identificationNumber && data.identification) {
        updateData.identification = JSON.stringify({
          idType: data.identification,
          value: data.identificationNumber,
        });
      }

      const result = await updateUser(user.id, updateData);

      if (result) {
        toast.success("Success", {
          description: "User updated successfully",
        });

        setHasChanges(false);

        // Redirect to user detail page
        router.push(`/users/${user.id}`);
        router.refresh();
      } else {
        toast.error("Error", {
          description: "Failed to update user. Please try again.",
        });
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update user. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel with unsaved changes warning
  const handleCancel = () => {
    if (hasChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (isFetching) {
    return (
      <div className="mx-auto p-5 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto p-5">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto p-5">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Alert>
          <AlertDescription>User not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit User: {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground">
              Update user information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-md">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Unsaved changes
            </div>
          )}
        </div>
      </div>

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
                  Update the user's basic personal and account information
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
                    <Label htmlFor="role">User Role</Label>
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
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("gender", value as any)
                      }
                      defaultValue={form.watch("gender")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Account Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Status</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="blacklisted"
                      {...form.register("blacklisted")}
                      className="rounded border-gray-300"
                    />
                    <Label
                      htmlFor="blacklisted"
                      className="text-sm font-medium"
                    >
                      Blacklist this user
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Blacklisted users will be restricted from accessing the
                    system
                  </p>
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
                        {identificationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identificationNumber">
                      Identification Number (Optional)
                    </Label>
                    <Input
                      id="identificationNumber"
                      placeholder="Enter new identification number"
                      {...form.register("identificationNumber")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to keep existing identification number
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Password Update */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Password Update (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
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
                      <p className="text-xs text-muted-foreground">
                        Leave empty to keep current password
                      </p>
                      {form.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>
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
                  Update the user's address information and LGA assignment
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
                      {...form.register("address.street")}
                    />
                    {form.formState.errors.address?.street && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.address.street.message}
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
                        <SelectItem value="none">No LGA Assignment</SelectItem>
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
                  Update optional additional information about the user
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
                      defaultValue={form.watch("marital_status")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                  disabled={isLoading || !hasChanges}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Updating..." : "Update User"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
