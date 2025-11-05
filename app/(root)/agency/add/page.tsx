"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { API, URLS } from "@/lib/const";
import { getLGAs } from "@/actions/lga";
import { useSession } from "next-auth/react";

// ---------------------- SCHEMAS ----------------------
const createAgencySchema = z.object({
  name: z.string().min(1, "Agency name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long"),
  agencyAdminId: z.string().optional(),
});

const createWithAdminSchema = z.object({
  agencyName: z.string().min(1, "Agency name is required"),
  agencyContactEmail: z.string().email("Valid email is required"),
  agencyContactPhone: z.string().min(10, "Valid phone number required"),
  adminFirstName: z.string().min(1, "Admin first name required"),
  adminLastName: z.string().min(1, "Admin last name required"),
  adminEmail: z.string().email("Admin email required"),
  adminPhone: z.string().min(10, "Valid admin phone number required"),
  adminGender: z.enum(["Male", "Female", "Other"]),
  adminAddress: z.object({
    text: z.string().min(1, "Street address required"),
    lga: z.string().min(1, "LGA required"),
    city: z.string().min(1, "City required"),
    state: z.string().min(1, "State required"),
    unit: z.string().optional(),
    country: z.string().default("Nigeria"),
    postal_code: z.string().optional(),
  }),
});

type CreateAgencyForm = z.infer<typeof createAgencySchema>;
type CreateWithAdminForm = z.infer<typeof createWithAdminSchema>;

// ---------------------- COMPONENT ----------------------
export default function AddAgencyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState("agency");
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);

  const { data: session } = useSession();
  const token = session?.user.access_token;

  // Forms
  const formAgency = useForm<CreateAgencyForm>({
    resolver: zodResolver(createAgencySchema),
    defaultValues: {
      name: "",
      contactEmail: "",
      contactPhone: "",
      agencyAdminId: "",
    },
  });

  const formWithAdmin = useForm<CreateWithAdminForm>({
    resolver: zodResolver(createWithAdminSchema),
    defaultValues: {
      agencyName: "",
      agencyContactEmail: "",
      agencyContactPhone: "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPhone: "",
      adminGender: "Male",
      adminAddress: {
        text: "",
        lga: "",
        city: "",
        state: "",
        unit: "",
        country: "Nigeria",
        postal_code: "",
      },
    },
  });

  // Fetch existing admins for optional link
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get(`${API}${URLS.user.all}`, {
          headers: {
            Authorization: `Bearer ${session?.user.access_token}`,
          },
        });

        const users = res.data?.data?.users || [];

        if (Array.isArray(users)) {
          const agencyAdmins = users.filter(
            (u: any) => u.role === "AGENCY_ADMIN" && !u.agencyId
          );
          setAdmins(
            agencyAdmins.map((a: any) => ({
              id: a.id,
              name: `${a.firstName} ${a.lastName}`,
            }))
          );
        } else {
          setAdmins([]);
        }
      } catch (err) {
        console.error("Error fetching agency admins:", err);
        toast.error("Failed to load Agency Admins");
      }
    };
    fetchAdmins();
  }, [session]);

  useEffect(() => {
    const fetchLGAData = async () => {
      try {
        const response = await getLGAs({ limit: 50, page: 1 });
        if (response?.data?.length > 0) {
          setLgas(
            response.data.map((lga: any) => ({ id: lga.id, name: lga.name }))
          );
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load LGA data. Please try again later.",
        });
      }
    };

    fetchLGAData();
  }, []);
  // Handle agency creation (no admin)
  const handleCreateAgency = async (data: CreateAgencyForm) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}${URLS.agency.create}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data?.success) {
        toast.success("Agency created successfully");
        router.push("/agency");
      } else {
        toast.error(response.data?.message || "Failed to create agency");
      }
    } catch (err: any) {
      toast.error("Error creating agency", {
        description: err?.response?.data?.message || err.message,
      });
      console.log({ err });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create agency with admin
  //   console.log("Session Token:", session);
  const handleCreateWithAdmin = async (data: CreateWithAdminForm) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API}${URLS.agency.create_with_Admin}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data?.success) {
        toast.success("Agency and Admin created successfully");
        router.push("/agency");
      } else {
        toast.error(
          response.data?.message || "Failed to create agency with admin"
        );
      }
    } catch (err: any) {
      toast.error("Error creating agency with admin", {
        description: err?.response?.data?.message || err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Create Agency
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new agency or create an agency with a new admin
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="max-w-7xl ">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="agency">Create Agency</TabsTrigger>
          <TabsTrigger value="withAdmin">Create with Admin</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: CREATE AGENCY --- */}
        <TabsContent value="agency">
          <form
            onSubmit={formAgency.handleSubmit(handleCreateAgency)}
            className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agency Details</CardTitle>
                <CardDescription>
                  Fill in the basic details to register an agency.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Agency Name</Label>
                  <Input
                    placeholder="TransPay Agency Lagos"
                    {...formAgency.register("name")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    placeholder="contact@agency.com"
                    {...formAgency.register("contactEmail")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    placeholder="+2348012345678"
                    {...formAgency.register("contactPhone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach Existing Admin</Label>
                  <Select
                    onValueChange={(value) =>
                      formAgency.setValue("agencyAdminId", value)
                    }
                    defaultValue={formAgency.watch("agencyAdminId")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Admin *" />
                    </SelectTrigger>
                    <SelectContent>
                      {admins.length > 0 ? (
                        admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No agency admins found — create one first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Creating..." : "Create Agency"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* --- TAB 2: CREATE WITH ADMIN --- */}
        <TabsContent value="withAdmin">
          <form
            onSubmit={formWithAdmin.handleSubmit(handleCreateWithAdmin)}
            className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agency & Admin Details</CardTitle>
                <CardDescription>
                  Create a new agency along with a new admin.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Agency Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agency Name</Label>
                    <Input {...formWithAdmin.register("agencyName")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Agency Email</Label>
                    <Input
                      type="email"
                      {...formWithAdmin.register("agencyContactEmail")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agency Phone</Label>
                    <Input {...formWithAdmin.register("agencyContactPhone")} />
                  </div>
                </div>

                <hr className="my-4" />

                {/* Admin Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admin First Name</Label>
                    <Input {...formWithAdmin.register("adminFirstName")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Last Name</Label>
                    <Input {...formWithAdmin.register("adminLastName")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Email</Label>
                    <Input
                      type="email"
                      {...formWithAdmin.register("adminEmail")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Phone</Label>
                    <Input {...formWithAdmin.register("adminPhone")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      onValueChange={(val) =>
                        formWithAdmin.setValue("adminGender", val as any)
                      }
                      defaultValue={formWithAdmin.watch("adminGender")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address */}
                <hr className="my-4" />
                <h3 className="text-sm font-semibold">Admin Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Street"
                    {...formWithAdmin.register("adminAddress.text")}
                  />
                  {/* LGA Select */}
                  <div className="space-y-2">
                    <Label htmlFor="lga" className="text-sm font-medium">
                      Local Government Area (LGA){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        // store both LGA id and readable name if needed
                        const selectedLga = lgas.find(
                          (lga) => lga.id === value
                        );
                        if (selectedLga) {
                          formWithAdmin.setValue(
                            "adminAddress.lga",
                            selectedLga.name
                          );
                        }
                      }}
                      defaultValue={formWithAdmin.watch("adminAddress.lga")}>
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
                    {formWithAdmin.formState.errors.adminAddress?.lga && (
                      <p className="text-xs text-destructive">
                        {
                          formWithAdmin.formState.errors.adminAddress.lga
                            .message
                        }
                      </p>
                    )}
                  </div>

                  <Input
                    placeholder="City"
                    {...formWithAdmin.register("adminAddress.city")}
                  />
                  <Input
                    placeholder="State"
                    {...formWithAdmin.register("adminAddress.state")}
                  />
                  <Input
                    placeholder="Unit (optional)"
                    {...formWithAdmin.register("adminAddress.unit")}
                  />
                  <Input
                    placeholder="Country"
                    {...formWithAdmin.register("adminAddress.country")}
                  />
                  <Input
                    placeholder="Postal Code"
                    {...formWithAdmin.register("adminAddress.postal_code")}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Creating..." : "Create with Admin"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
