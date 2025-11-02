"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { API, URLS } from "@/lib/const";
import { getLGAs } from "@/actions/lga";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from "lucide-react";

// ---------------------- SCHEMA ----------------------
const addAgentSchema = z.object({
  agencyId: z.string().min(1, "Please select an agency"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.object({
    text: z.string().min(1, "Street required"),
    lga: z.string().min(1, "LGA required"),
    city: z.string().min(1, "City required"),
    state: z.string().min(1, "State required"),
    unit: z.string().optional(),
    country: z.string().default("Nigeria"),
    postal_code: z.string().optional(),
  }),
});

type AddAgentFormValues = z.infer<typeof addAgentSchema>;

// ---------------------- COMPONENT ----------------------
export default function AddAgentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const role = session?.user?.role;
  const token = session?.user?.access_token;
  const agencyIdFromUser = session?.user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);
  const [agencyName, setAgencyName] = useState<string>("");

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      agencyId: searchParams.get("agencyId") || agencyIdFromUser || "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "Male",
      address: {
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

  // --- Fetch Agencies (Superadmin only) ---
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        if (!token) return;

        if (role === "AGENCY_ADMIN" && agencyIdFromUser) {
          // Fetch only their own agency
          const res = await axios.get(
            `${API}${URLS.agency.one.replace("{id}", agencyIdFromUser)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data?.success) {
            setAgencyName(res.data.data.name);
            form.setValue("agencyId", res.data.data.id);
          }
        } else {
          // Superadmin: fetch all agencies
          const res = await axios.get(`${API}${URLS.agency.all}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success) {
            setAgencies(
              res.data.data.map((a: any) => ({ id: a.id, name: a.name }))
            );
          }
        }
      } catch {
        toast.error("Failed to load agency data");
      }
    };

    fetchAgencies();
  }, [token, role, agencyIdFromUser, form]);

  // --- Fetch LGAs (for both SUPERADMIN and AGENCY_ADMIN) ---
  useEffect(() => {
    const fetchLGAData = async () => {
      try {
        if (!token) return;

        if (role === "SUPERADMIN" || role === "AGENCY_ADMIN") {
          const response = await getLGAs({ limit: 50, page: 1 });
          setLgas(response.data.map((lga) => ({ id: lga.id, name: lga.name })));
        }
      } catch (error) {
        toast.error("Failed to load LGA data", {
          description: "Please try again later.",
        });
      }
    };
    fetchLGAData();
  }, [token, role]);

  // --- Submit Handler ---
  const onSubmit = async (data: AddAgentFormValues) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}${URLS.agency.add_agent}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        toast.success("Agent added successfully!");
        router.push("/agency");
      } else {
        toast.error(res.data?.message || "Failed to add agent");
      }
    } catch (err: any) {
      console.error("Add agent error:", err);
      toast.error("Error adding agent", {
        description: err?.response?.data?.message || err.message,
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
            Add Agent to Agency
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === "AGENCY_ADMIN"
              ? "Add a new agent to your agency"
              : "Register a new agent under a selected agency"}
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

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-7xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Information</CardTitle>
            <CardDescription>
              Fill out the form below to add a new agent.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Agency Select */}
            <div className="space-y-2">
              <Label>Agency</Label>
              {role === "AGENCY_ADMIN" ? (
                <Input value={agencyName || "Loading..."} disabled />
              ) : (
                <Select
                  onValueChange={(value) => form.setValue("agencyId", value)}
                  defaultValue={form.watch("agencyId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.length > 0 ? (
                      agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading agencies...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.agencyId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.agencyId.message}
                </p>
              )}
            </div>

            {/* Agent Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input {...form.register("firstName")} />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input {...form.register("lastName")} />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...form.register("phone")} />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  onValueChange={(val) => form.setValue("gender", val as any)}
                  defaultValue={form.watch("gender")}>
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

            {/* Address Section */}
            <hr className="my-4" />
            <h3 className="text-sm font-semibold">Agent Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Street Address"
                {...form.register("address.text")}
              />

              {/* LGA Select */}
              <div className="space-y-2">
                <Label htmlFor="lga" className="text-sm font-medium">
                  Local Government Area (LGA){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    const selectedLga = lgas.find((lga) => lga.id === value);
                    if (selectedLga) {
                      form.setValue("address.lga", selectedLga.name);
                    }
                  }}
                  defaultValue={form.watch("address.lga")}>
                  <SelectTrigger className="text-sm">
                    <SelectValue
                      placeholder={
                        lgas.length === 0
                          ? "Loading LGAs..."
                          : "Select Local Government Area"
                      }
                    />
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
              </div>

              <Input placeholder="City" {...form.register("address.city")} />
              <Input placeholder="State" {...form.register("address.state")} />
              <Input
                placeholder="Unit (Optional)"
                {...form.register("address.unit")}
              />
              <Input
                placeholder="Country"
                {...form.register("address.country")}
              />
              <Input
                placeholder="Postal Code"
                {...form.register("address.postal_code")}
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
              {isLoading ? "Adding..." : "Add Agent"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
