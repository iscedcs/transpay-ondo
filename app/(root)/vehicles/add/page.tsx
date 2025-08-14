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
import type { z } from "zod";
import {
  type CreateVehicleRequest,
  genderOptions,
  maritalStatusOptions,
  nokFormSchema,
  vehicleFormSchema,
  ownerFormSchema,
} from "../vehicle-form-validation";
import { devLog } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { User, getMe } from "@/actions/users";

const AddVehiclePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("vehicle");
  const [displayDialog, setDisplayDialog] = useState(false);
  const [lgas, setLgas] = useState<{ id: string; name: string }[]>([]);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [filteredLgas, setFilteredLgas] = useState<
    { id: string; name: string }[]
  >([]);
  const { data: session, status } = useSession();
  const checkUserAccess = (user: User) => {
    const allowedRoles = [
      "ADMIN",
      "LGA_AGENT",
      "SUPERADMIN",
      "EIRS_ADMIN",
      "EIRS_AGENT",
      "LGA_ADMIN",
    ];
    return allowedRoles.includes(user.role);
  };

  const filterLgasForUser = (
    allLgas: { id: string; name: string }[],
    user: User
  ) => {
    // LGA_ADMIN and LGA_AGENT can only create vehicles in their own LGA
    if (user.role === "LGA_ADMIN" || user.role === "LGA_AGENT") {
      if (user.lgaId) {
        return allLgas.filter((lga) => lga.id === user.lgaId);
      }
      return [];
    }
    // Other allowed roles can create vehicles in any LGA
    return allLgas;
  };

  // Fetch LGAs on component mount
  useEffect(() => {
    const fetchLGAs = async () => {
      try {
        const lgaResponse = await getLGAs({ limit: 50, page: 1 });
        devLog("Fetched LGAs:", lgaResponse);
        if (!lgaResponse.success) {
          toast.error(lgaResponse.message || "Failed to fetch LGAs");
        }
        const allLgas = lgaResponse.data.map((lga) => ({
          id: lga.id,
          name: lga.name,
        }));
        setLgas(allLgas);

        if (user) {
          const userFilteredLgas = filterLgasForUser(allLgas, user);
          setFilteredLgas(userFilteredLgas);
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load LGAs. Please try again later.",
        });
      }
    };

    const fetchUser = async () => {
      try {
        const userResponse = await getMe();
        if (userResponse.error) {
          toast.error(userResponse.error);
          setHasAccess(false);
        } else {
          console.log("Fetched user:", userResponse.user);
          setUser(userResponse.user);

          if (userResponse.user?.status !== "ACTIVE") {
            toast.error("Account Inactive", {
              description:
                "Your account is not active. Please contact your administrator.",
            });
            setHasAccess(false);
            return;
          }

          if (userResponse.user?.blacklisted) {
            toast.error("Account Restricted", {
              description:
                "Your account has been restricted. Please contact your administrator.",
            });
            setHasAccess(false);
            return;
          }

          const access = checkUserAccess(userResponse.user);
          setHasAccess(access);

          if (!access) {
            toast.error("Access Denied", {
              description: "You don't have permission to create vehicles.",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setHasAccess(false);
      }
    };

    fetchUser();
    fetchLGAs();
  }, []);

  useEffect(() => {
    if (user && lgas.length > 0) {
      const userFilteredLgas = filterLgasForUser(lgas, user);
      setFilteredLgas(userFilteredLgas);

      if (
        (user.role === "LGA_ADMIN" || user.role === "LGA_AGENT") &&
        userFilteredLgas.length === 1
      ) {
        vehicleForm.setValue("registeredLgaId", userFilteredLgas[0].id);
        ownerForm.setValue("lgaId", userFilteredLgas[0].id);
      }
    }
  }, [user, lgas]);

  const nokForm = useForm({
    resolver: zodResolver(nokFormSchema),
    defaultValues: {
      nextOfKinName: "",
      nextOfKinPhone: "",
      nextOfKinRelationship: "",
    },
    mode: "all",
  });

  const ownerForm = useForm<z.infer<typeof ownerFormSchema>>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: {
      email: "",
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

  if (hasAccess === null) {
    return (
      <div className="px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Checking permissions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // if (status === "authenticated" && !hasAccess) {
  //   return (
  //     <div className="px-4">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle className="flex items-center gap-2">
  //             <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
  //             Access Denied
  //           </CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <Alert variant="destructive">
  //             <AlertTriangle className="h-4 w-4" />
  //             <AlertDescription>
  //               {user?.status !== "ACTIVE"
  //                 ? "Your account is not active. Please contact your administrator."
  //                 : user?.blacklisted
  //                 ? "Your account has been restricted. Please contact your administrator."
  //                 : "You don't have permission to create vehicles. Only ADMIN, LGA_AGENT, SUPERADMIN, EIRS_ADMIN, EIRS_AGENT, and LGA_ADMIN roles can create vehicles."}
  //             </AlertDescription>
  //           </Alert>
  //           <div className="mt-4">
  //             <Button onClick={() => router.back()} variant="outline">
  //               Go Back
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  // if (
  //   (user?.role === "LGA_ADMIN" || user?.role === "LGA_AGENT") &&
  //   filteredLgas.length === 0
  // ) {
  //   return (
  //     <div className="px-4">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle className="flex items-center gap-2">
  //             <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
  //             No LGA Assigned
  //           </CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <Alert variant="destructive">
  //             <AlertTriangle className="h-4 w-4" />
  //             <AlertDescription>
  //               You don't have an LGA assigned to your account. Please contact
  //               your administrator to assign an LGA before creating vehicles.
  //             </AlertDescription>
  //           </Alert>
  //           <div className="mt-4">
  //             <Button onClick={() => router.back()} variant="outline">
  //               Go Back
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  const validateOwnerTab = async () => {
    const isValid = await ownerForm.trigger();
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
      const [ownerValid, vehicleValid] = await Promise.all([
        ownerForm.trigger(),
        vehicleForm.trigger(),
      ]);

      if (!ownerValid || !vehicleValid) {
        toast.error("Please complete all required fields");
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
          {user && (
            <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
              <p>
                <strong>Logged in as:</strong> {user.firstName} {user.lastName}{" "}
                ({user.role})
              </p>
              {user.lga && (
                <p>
                  <strong>Assigned LGA:</strong> {user.lga.name}
                </p>
              )}
            </div>
          )}

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
                            {filteredLgas
                              .toSorted((a, b) => a.name.localeCompare(b.name))
                              .map((lga) => (
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
                        <FormLabel>Email Address (Optional)</FormLabel>
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
                        <FormLabel>Whatsapp Number (Optional)</FormLabel>
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
                        <FormLabel>
                          Next of Kin Name{" "}
                          <span className="text-muted-foreground">
                            (Optional)
                          </span>
                        </FormLabel>
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
                        <FormLabel>
                          Next of Kin Phone Number{" "}
                          <span className="text-muted-foreground">
                            (Optional)
                          </span>
                        </FormLabel>
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
                        <FormLabel>
                          Relationship with Next of Kin{" "}
                          <span className="text-muted-foreground">
                            (Optional)
                          </span>
                        </FormLabel>
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
                      <strong>Email:</strong> {ownerForm.getValues().email || "Not provided"}
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
                    {nokForm.getValues().nextOfKinName && (
                      <p>
                        <strong>Next of Kin Name:</strong>{" "}
                        {nokForm.getValues().nextOfKinName}
                      </p>
                    )}
                    {nokForm.getValues().nextOfKinPhone && (
                      <p>
                        <strong>Next of Kin Phone Number:</strong>{" "}
                        {nokForm.getValues().nextOfKinPhone}
                      </p>
                    )}
                    {nokForm.getValues().nextOfKinRelationship && (
                      <p>
                        <strong>Relationship with Next of Kin:</strong>{" "}
                        {nokForm.getValues().nextOfKinRelationship}
                      </p>
                    )}
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
