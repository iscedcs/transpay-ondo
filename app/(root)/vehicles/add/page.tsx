"use client";


import { getLGAs } from "@/actions/lga";
import { createVehicleWithOwner } from "@/actions/vehicles";
import AvatarUploader from "@/components/shared/avatar-uploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { VEHICLE_CATEGORIES } from "@/lib/const";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  CreateVehicleRequest,
  genderOptions,
  maritalStatusOptions,
  nokFormSchema,
  vehicleFormSchema,
  ownerFormSchema,
} from "../vehicle-form-validation";
import { devLog } from "@/lib/utils";

const AddVehiclePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("vehicle");
  const [displayDialog, setDisplayDialog] = useState(false);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);

  // Fetch LGAs on component mount
  useEffect(() => {
    const fetchLGAs = async () => {
      try {
        const lgaResponse = await getLGAs({ limit: 50, page: 1 });
        devLog("Fetched LGAs:", lgaResponse);
        if (!lgaResponse.success) {
          toast.error(lgaResponse.message || "Failed to fetch LGAs");
        }
        setLgas(
          lgaResponse.data.map((lga) => ({ id: lga.id, name: lga.name }))
        );
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load LGAs. Please try again later.",
        });
      }
    };

    fetchLGAs();
  }, [toast]);

  const nokForm = useForm({
    resolver: zodResolver(nokFormSchema),
    defaultValues: {
      nextOfKinName: "",
      nextOfKinPhone: "",
      nextOfKinRelationship: "",
    },
    mode: "all",
  });

  const ownerForm = useForm({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: {
      gender: "MALE",
      maritalStatus: "SINGLE",
      whatsappNumber: "",
      maidenName: "",
      phone: "",
      city: "",
      country: "",
      firstName: "",
      lastName: "",
      lgaId: "",
      postalCode: "",
      residentialAddress: "",
    },
    mode: "all",
  });

  const vehicleForm = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      category: "",
      plateNumber: "",
      registeredLgaId: "",
      image: "",
      status: "ACTIVE",
      vin: "",
      blacklisted: false,
    },
    mode: "all",
  });

  const validateOwnerTab = async () => {
    const isValid = await nokForm.trigger();
    if (!isValid) {
      toast.error("Please complete all required owner information fields");
      return false;
    }
    return true;
  };

  const validatedDriverTab = async () => {
    const isValid = await ownerForm.trigger();
    if (!isValid) {
      toast.error("Please complete all required driver fields");
      return false;
    }
    return true;
  };

  const validateVehicleTab = async () => {
    const isValid = await vehicleForm.trigger();
    if (!isValid) {
      toast.error("Please complete all required vehicle information fields");
      return false;
    }
    return true;
  };

  const handleVehicleImageUpload = async (imageUrl: string) => {
    vehicleForm.setValue("image", imageUrl);
    return { success: "Vehicle image uploaded successfully" };
  };

  const handleTabChange = async (newTab: string) => {
    if (newTab === "owner" && activeTab === "vehicle") {
      const isValid = await validateVehicleTab();
      if (!isValid) return;
    }

    if (newTab === "vehicle" && activeTab === "owner") {
      const isValid = await validatedDriverTab();
      if (!isValid) return;
    }

    if (newTab === "review" && activeTab === "nok") {
      const isValid = await validateOwnerTab();
      if (!isValid) return;
    }

    setActiveTab(newTab);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate all forms
      const [ownerValid, nextOfKinValid, vehicleValid] = await Promise.all([
        nokForm.trigger(),
        ownerForm.trigger(),
        vehicleForm.trigger(),
      ]);

      if (!ownerValid || !nextOfKinValid || !vehicleValid) {
        toast.error("Please complete all required fields");
        setIsLoading(false);
        return;
      }

      // Get form data
      const nokData = nokForm.getValues();
      const ownerData = ownerForm.getValues();
      const vehicleData = vehicleForm.getValues();

      // Get the selected LGA name for address
      const selectedLga = lgas.find((lga) => lga.id === ownerData.lgaId);

      // Prepare vehicle creation request according to API structure
      const vehicleRequest: CreateVehicleRequest = {
        category: vehicleData.category,
        plateNumber: vehicleData.plateNumber,
        owner: {
          firstName: ownerData.firstName,
          lastName: ownerData.lastName,
          phone: ownerData.phone,
          address: {
            text: ownerData.residentialAddress,
            lga: selectedLga?.name || "",
            city: ownerData.city,
            state: "Edo",
            unit: selectedLga?.name || "",
            country: "Nigeria",
            postal_code: ownerData.postalCode,
          },
          gender: ownerData.gender,
          marital_status: ownerData.maritalStatus,
          whatsapp: ownerData.whatsappNumber,
          email: ownerData?.email,
          nok_name: nokData.nextOfKinName,
          nok_phone: nokData.nextOfKinPhone,
          nok_relationship: nokData.nextOfKinRelationship,
          maiden_name: ownerData.maidenName,
        },
        lgaId: vehicleData.registeredLgaId,
        image: vehicleData.image,
        status: vehicleData.status,
        vin: vehicleData.vin,
        blacklisted: vehicleData.blacklisted,
      };

      // Create vehicle with owner
      const vehicle = await createVehicleWithOwner(vehicleRequest);

      if (!vehicle.success) {
        toast.error("Registration Failed", {
          description: vehicle.error || "Failed to register. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      // Show success message
      toast.success("Registration Successful", {
        description: "Vehicle and owner have been registered successfully!",
      });
      // router.push(`/vehicles/${vehicle.data?.vehicle.id}`);

      // Redirect to vehicle details or list
      if (vehicle.data?.vehicle.id) {
        router.push(`/vehicles/${vehicle.data?.vehicle.id}`);
      } else {
        router.push("/vehicles");
      }
      router.refresh();
    } catch (error) {
      toast.error("Registration Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to register. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4">
      <Card>
        <CardHeader>
          <CardTitle>Register Vehicle</CardTitle>
          <CardDescription>
            Fill in the details below to register a new vehicle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
              <TabsTrigger value="owner">Owner</TabsTrigger>
              <TabsTrigger value="nok">Next of Kin</TabsTrigger>
              {/* <TabsTrigger value="review">Review</TabsTrigger> */}
            </TabsList>
            <TabsContent value="vehicle">
              <Form {...vehicleForm}>
                <form className="grid gap-4">
                  <FormField
                    control={vehicleForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Category</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) =>
                              vehicleForm.setValue("category", value)
                            }
                            defaultValue={vehicleForm.watch("category")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {VEHICLE_CATEGORIES.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plate Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chassis Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="registeredLgaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered LGA</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an LGA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lgas.map((lga) => (
                              <SelectItem key={lga.id} value={lga.id}>
                                {lga.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver Image</FormLabel>
                        <FormControl>
                          <AvatarUploader
                            onAvatarUpload={handleVehicleImageUpload}
                            currentAvatarUrl={vehicleForm.watch("image")}
                            userInitials="VH"
                            size="xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="owner">
              <Form {...ownerForm}>
                <form className="grid gap-4">
                  <FormField
                    control={ownerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ownerForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderOptions.map((Gender, i) => (
                              <SelectItem key={i} value={Gender.value}>
                                {Gender.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatusOptions.map((MaritalStatus, i) => (
                              <SelectItem key={i} value={MaritalStatus.value}>
                                {MaritalStatus.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Whatsapp Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="maidenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Maiden Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="lgaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LGA</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an LGA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lgas.map((lga) => (
                              <SelectItem key={lga.id} value={lga.id}>
                                {lga.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="residentialAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Residential Address</FormLabel>
                        <FormControl>
                          <Textarea className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="nok">
              <Form {...nokForm}>
                <form className="grid gap-4">
                  <FormField
                    control={nokForm.control}
                    name="nextOfKinName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={nokForm.control}
                    name="nextOfKinPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={nokForm.control}
                    name="nextOfKinRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship with Next of Kin</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            {/* <TabsContent value="review">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Driver Information</h3>
                  <div className="grid gap-2">
                    <p>
                      <strong>Name:</strong> {ownerForm.getValues().firstName}{" "}
                      {ownerForm.getValues().lastName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {ownerForm.getValues().phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {ownerForm.getValues().email}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {ownerForm.getValues().residentialAddress},{" "}
                      {ownerForm.getValues().city}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Owner Information</h3>
                  <div className="grid gap-2">
                    <p>
                      <strong>Next of Kin Name:</strong>{" "}
                      {nokForm.getValues().nextOfKinName}
                    </p>
                    <p>
                      <strong>Next of Kin Phone Number:</strong>{" "}
                      {nokForm.getValues().nextOfKinPhone}
                    </p>
                    <p>
                      <strong>Relationship with Next of Kin:</strong>{" "}
                      {nokForm.getValues().nextOfKinRelationship}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Vehicle Information</h3>
                  <div className="grid gap-2">
                    <p>
                      <strong>Category:</strong>{" "}
                      {vehicleForm.getValues().category}
                    </p>
                    <p>
                      <strong>Plate Number:</strong>{" "}
                      {vehicleForm.getValues().plateNumber}
                    </p>
                    <p>
                      <strong>Status:</strong> {vehicleForm.getValues().status}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent> */}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeTab !== "vehicle" && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setActiveTab(
                  activeTab === "owner"
                    ? "vehicle"
                    : activeTab === "nok"
                    ? "owner"
                    : "vehicle"
                )
              }
            >
              Previous
            </Button>
          )}

          {activeTab !== "review" ? (
            activeTab === "vehicle" ? (
              <Button type="button" onClick={() => handleTabChange("owner")}>
                Next: Driver Information
              </Button>
            ) : activeTab === "owner" ? (
              <Button type="button" onClick={() => handleTabChange("nok")}>
                Next: Owner Information
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Are you sure you want to
                      submit?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit}>
                      {isLoading ? "Submitting..." : "Submit"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Are you sure you want to
                    submit?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onSubmit}>
                    {isLoading ? "Submitting..." : "Submit"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddVehiclePage;
