"use client";

import { getLGAs } from "@/actions/lga";
import { getUserById, updateUser, type User } from "@/actions/users";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_ROLES } from "@/lib/const";
import { parseAddressExtended } from "@/lib/utils";
import { ArrowLeft, Edit3, Loader2, Save, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  genderOptions,
  identificationOptions,
  maritalStatusOptions,
} from "../../user-edit-form-validation";

interface IdentificationData {
  idType: string;
  value: string;
}

type EditingField =
  | "firstName"
  | "lastName"
  | "phone"
  | "gender"
  | "identification"
  | "blacklisted"
  | "password"
  | "address.street"
  | "address.unit"
  | "address.city"
  | "address.state"
  | "address.postal_code"
  | "address.country"
  | "lgaId"
  | "marital_status"
  | "whatsapp"
  | "maiden_name"
  | "nok_name"
  | "nok_phone"
  | "nok_relationship"
  | null;

export default function EditUserPage() {
  const params = useParams();
  const session = useSession();
  const router = useRouter();

  if (session.status === "unauthenticated") router.push("/sign-in");
  if (
    session.status !== "loading" &&
    !ADMIN_ROLES.includes(String(session.data?.user.role))
  ) {
    router.push("/unauthorized");
  }

  const [user, setUser] = useState<User | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState("basic");

  // Individual field editing states
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const parseIdentification = (
    identification: string | null | undefined
  ): IdentificationData | null => {
    if (!identification) return null;
    try {
      return JSON.parse(identification) as IdentificationData;
    } catch (error) {
      return null;
    }
  };

  // Fetch user data and LGAs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        setError(null);

        const [userData, lgaResponse] = await Promise.all([
          getUserById(String(params.id)),
          getLGAs({ limit: 100, page: 1 }),
        ]);

        setUser(userData);
        setLgas(
          lgaResponse.data.map((lga) => ({ id: lga.id, name: lga.name }))
        );

        // Initialize field values
        const address = parseAddressExtended(userData.address);
        const identificationData = parseIdentification(userData.identification);

        setFieldValues({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "ADMIN",
          gender: userData.gender || "MALE",
          identification: identificationData?.idType || "NIN",
          identificationNumber: "",
          blacklisted: userData.blacklisted || false,
          password: "",
          confirmPassword: "",
          "address.text": address?.text || "",
          "address.unit": address?.unit || "",
          "address.city": address?.city || "",
          "address.state": address?.state || "",
          "address.postal_code": address?.postal_code || "",
          "address.country": address?.country || "Nigeria",
          lgaId: userData.lgaId || "",
          marital_status: userData.marital_status || "SINGLE",
          whatsapp: userData.whatsapp || "",
          maiden_name: userData.maiden_name || "",
          nok_name: userData.nok_name || "",
          nok_phone: userData.nok_phone || "",
          nok_relationship: userData.nok_relationship || "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user data"
        );
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const startEditing = (field: EditingField) => {
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
    // Reset field value to original
    if (user && editingField) {
      const address = parseAddressExtended(user.address);
      const identificationData = parseIdentification(user.identification);

      if (editingField.startsWith("address.")) {
        const addressField = editingField.split(".")[1];
        setFieldValues((prev) => ({
          ...prev,
          [editingField]: address?.[addressField as keyof typeof address] || "",
        }));
      } else if (editingField === "identification") {
        setFieldValues((prev) => ({
          ...prev,
          identification: identificationData?.idType || "NIN",
        }));
      } else {
        setFieldValues((prev) => ({
          ...prev,
          [editingField]: user[editingField as keyof User] || "",
        }));
      }
    }
  };

  const saveField = async () => {
    if (!user || !editingField) return;

    setIsUpdating(true);
    try {
      const updateData: Partial<User> = {};

      if (editingField.startsWith("address.")) {
        const currentAddress = parseAddressExtended(user.address) || {};
        const addressField = editingField.split(".")[1];
        const newAddress = {
          ...currentAddress,
          [addressField]: fieldValues[editingField],
        };
        updateData.address = newAddress as any;
      } else if (editingField === "identification") {
        if (fieldValues.identificationNumber) {
          updateData.identification = JSON.stringify({
            idType: fieldValues.identification,
            value: fieldValues.identificationNumber,
          });
        }
      } else {
        updateData[editingField as keyof User] = fieldValues[editingField];
      }

      const result = await updateUser(user.id, updateData);

      if (result) {
        toast.success("Success", {
          description: `${editingField} updated successfully`,
        });

        // Update local user state
        setUser((prev) => (prev ? { ...prev, ...updateData } : null));
        setEditingField(null);
      } else {
        toast.error("Error", {
          description: "Failed to update field. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update field. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateFieldValue = (field: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderEditableField = (
    field: EditingField,
    label: string,
    value: any,
    type: "input" | "select" | "checkbox" | "password" = "input",
    options?: { value: string; label: string }[],
    placeholder?: string
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {label}
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => startEditing(field)}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </Label>

        {isEditing ? (
          <div className="flex items-center gap-2">
            {type === "input" && (
              <Input
                value={fieldValues[field!] || ""}
                onChange={(e) => updateFieldValue(field!, e.target.value)}
                placeholder={placeholder}
                className="flex-1"
              />
            )}

            {type === "select" && (
              <Select
                value={fieldValues[field!] || ""}
                onValueChange={(value) => updateFieldValue(field!, value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {type === "checkbox" && (
              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  checked={fieldValues[field!] || false}
                  onChange={(e) => updateFieldValue(field!, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Blacklist this user</span>
              </div>
            )}

            <Button
              type="button"
              size="sm"
              onClick={saveField}
              disabled={isUpdating}
              className="flex items-center gap-1"
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelEditing}
              disabled={isUpdating}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="p-2 bg-muted rounded-md min-h-[40px] flex items-center">
            {type === "checkbox" ? (
              <span className={value ? "text-red-600" : "text-green-600"}>
                {value ? "Blacklisted" : "Active"}
              </span>
            ) : (
              <span>{value || "Not set"}</span>
            )}
          </div>
        )}
      </div>
    );
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
            onClick={() => router.back()}
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
              Click the pencil icon next to any field to edit it
            </p>
          </div>
        </div>
      </div>

      {/* User Form */}
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
                Click the pencil icon next to any field to edit it individually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableField(
                  "firstName",
                  "First Name",
                  fieldValues.firstName,
                  "input",
                  undefined,
                  "Enter first name"
                )}
                {renderEditableField(
                  "lastName",
                  "Last Name",
                  fieldValues.lastName,
                  "input",
                  undefined,
                  "Enter last name"
                )}
                {renderEditableField(
                  "phone",
                  "Phone Number",
                  fieldValues.phone,
                  "input",
                  undefined,
                  "Enter phone number"
                )}
                {renderEditableField(
                  "gender",
                  "Gender",
                  fieldValues.gender,
                  "select",
                  genderOptions
                )}
              </div>

              <Separator />

              {/* Account Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Status</h3>
                {renderEditableField(
                  "blacklisted",
                  "Account Status",
                  fieldValues.blacklisted,
                  "checkbox"
                )}
              </div>

              <Separator />

              {/* Identification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableField(
                  "identification",
                  "Means of Identification",
                  fieldValues.identification,
                  "select",
                  identificationOptions
                )}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Identification Number
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing("identification")}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </Label>
                  {editingField === "identification" ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={fieldValues.identificationNumber || ""}
                        onChange={(e) =>
                          updateFieldValue(
                            "identificationNumber",
                            e.target.value
                          )
                        }
                        placeholder="Enter new identification number"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-muted rounded-md min-h-[40px] flex items-center">
                      <span>{"*".repeat(8)} (Hidden for security)</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Password Update */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password Update</h3>
                {renderEditableField(
                  "password",
                  "Password",
                  "••••••••",
                  "password"
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Address & LGA</CardTitle>
              <CardDescription>
                Click the pencil icon next to any field to edit it individually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableField(
                  "address.street",
                  "Street",
                  fieldValues["address.street"],
                  "input",
                  undefined,
                  "Enter street address"
                )}
                {renderEditableField(
                  "address.unit",
                  "Unit",
                  fieldValues["address.unit"],
                  "input",
                  undefined,
                  "Apartment, suite, unit, etc."
                )}
                {renderEditableField(
                  "address.city",
                  "City",
                  fieldValues["address.city"],
                  "input",
                  undefined,
                  "Enter city"
                )}
                {renderEditableField(
                  "address.state",
                  "State",
                  fieldValues["address.state"],
                  "input",
                  undefined,
                  "Enter state"
                )}
                {renderEditableField(
                  "address.postal_code",
                  "Postal Code",
                  fieldValues["address.postal_code"],
                  "input",
                  undefined,
                  "Enter postal code"
                )}
                {renderEditableField(
                  "address.country",
                  "Country",
                  fieldValues["address.country"],
                  "input",
                  undefined,
                  "Enter country"
                )}
              </div>

              <Separator />

              {/* LGA Assignment */}
              <div className="space-y-4">
                {renderEditableField(
                  "lgaId",
                  "Local Government Area (LGA)",
                  lgas.find((lga) => lga.id === fieldValues.lgaId)?.name ||
                    "No LGA Assignment",
                  "select",
                  [
                    { value: "none", label: "No LGA Assignment" },
                    ...lgas.map((lga) => ({ value: lga.id, label: lga.name })),
                  ]
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Details Tab */}
        <TabsContent value="additional" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>
                Click the pencil icon next to any field to edit it individually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableField(
                  "marital_status",
                  "Marital Status",
                  fieldValues.marital_status,
                  "select",
                  maritalStatusOptions
                )}
                {renderEditableField(
                  "whatsapp",
                  "WhatsApp Number",
                  fieldValues.whatsapp,
                  "input",
                  undefined,
                  "Enter WhatsApp number"
                )}
                {renderEditableField(
                  "maiden_name",
                  "Maiden Name",
                  fieldValues.maiden_name,
                  "input",
                  undefined,
                  "Enter maiden name if applicable"
                )}
              </div>

              <Separator />

              {/* Next of Kin */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Next of Kin Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderEditableField(
                    "nok_name",
                    "Next of Kin Name",
                    fieldValues.nok_name,
                    "input",
                    undefined,
                    "Enter next of kin name"
                  )}
                  {renderEditableField(
                    "nok_phone",
                    "Next of Kin Phone",
                    fieldValues.nok_phone,
                    "input",
                    undefined,
                    "Enter next of kin phone number"
                  )}
                  {renderEditableField(
                    "nok_relationship",
                    "Relationship",
                    fieldValues.nok_relationship,
                    "input",
                    undefined,
                    "E.g., Spouse, Parent, Sibling"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
