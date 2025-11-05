"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
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
import { Loader2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API, URLS } from "@/lib/const";

// ---------------------- SCHEMA ----------------------
const updateAgencySchema = z.object({
  name: z.string().min(1, "Agency name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type UpdateAgencyForm = z.infer<typeof updateAgencySchema>;

interface AgencyEditFormProps {
  agencyId: string;
  onUpdated?: () => void; // optional callback to refetch or close modal
}

// ---------------------- COMPONENT ----------------------
export default function AgencyEditForm({
  agencyId,
  onUpdated,
}: AgencyEditFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.access_token;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<UpdateAgencyForm>({
    resolver: zodResolver(updateAgencySchema),
    defaultValues: {
      name: "",
      contactEmail: "",
      contactPhone: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const res = await axios.get(
          `${API}${URLS.agency.one.replace("{id}", agencyId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data?.data;
        if (data) {
          form.reset({
            name: data.name || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
            status: data.status || "ACTIVE",
          });
        }
      } catch (error) {
        toast.error("Failed to load agency details");
      } finally {
        setIsFetching(false);
      }
    };

    if (agencyId && token) fetchAgency();
  }, [agencyId, token]);

  const handleUpdate = async (data: UpdateAgencyForm) => {
    setIsLoading(true);
    try {
      const res = await axios.patch(
        `${API}${URLS.agency.update.replace("{id}", agencyId)}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        toast.success("Agency updated successfully");
        onUpdated?.();
        router.refresh(); // refresh the current agency details view
      } else {
        toast.error(res.data?.message || "Failed to update agency");
      }
    } catch (err: any) {
      toast.error("Error updating agency", {
        description: err?.response?.data?.message || err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex justify-center items-center h-32 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading...
      </div>
    );

  return (
    <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Agency</CardTitle>
          <CardDescription>Update agency information below</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Agency Name</Label>
            <Input
              {...form.register("name")}
              placeholder="TransPay Agency Lagos"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              type="email"
              {...form.register("contactEmail")}
              placeholder="contact@agency.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input
              {...form.register("contactPhone")}
              placeholder="+2348012345678"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              onValueChange={(value) => form.setValue("status", value as any)}
              defaultValue={form.watch("status")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
