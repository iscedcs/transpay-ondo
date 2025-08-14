import { getGroupById } from "@/actions/groups";
import { getWaiverDueToDisablementById } from "@/actions/waiver";
import PaymentHistoryUsingController from "@/components/pages/vehicle/payment-history-using-controller";
import VehicleWaiverView from "@/components/pages/vehicle/waiver-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_ROLES, VehicleValues } from "@/lib/const";
import { getVehicleById } from "@/lib/controllers/vehicle-controller";
import { getSSession } from "@/lib/get-data";
import { cn, getNextPaymentDate } from "@/lib/utils";
import { TransactionCategories } from "@prisma/client";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { AlertTriangle, Car, CheckCircle2, FileText, History, User, Wallet } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ bcid: string }> }) {
     const bcid = (await params).bcid;
     const vehicle = await getVehicleById(bcid);
     if (vehicle) {
          return {
               title: `${vehicle?.owner.firstName} - ${vehicle?.category?.toLocaleUpperCase() ?? "Not Stated"}`,
          };
     }
}

export default async function StatusPage({ params }: { params: Promise<{ bcid: string }>}) {
     const bcid = (await params).bcid;
     const { role } = await getSSession();
     const vehicle = await getVehicleById(bcid);
     const group = await getGroupById(vehicle?.groupId)
     
     if (!vehicle) return notFound();
     const disabledWaiver = await getWaiverDueToDisablementById(vehicle.id)
     const onWaiver = !!disabledWaiver

     const wallet = vehicle?.wallet;

     const isVehicleClear = vehicle.status === "ACTIVE" && Number(wallet.cvof_owing) === 0;
     const CVOFBalance = Number(wallet.cvof_balance);
     const CVOFOwing = Number(wallet.cvof_owing);

     const isValidCategory = !Object.keys(TransactionCategories).includes(
       vehicle.category
     );
     const isOwing = false;
     const hasFareFlex = !!vehicle.fairFlexImei && vehicle.fairFlexImei.trim() !== "";
     const hasSticker = !!vehicle.barcode && vehicle.barcode.trim() !== "";
     const hasGroup = !!vehicle.groupId || !!group
     
     if (onWaiver) {
          return <VehicleWaiverView waiverInfo={disabledWaiver} owner={vehicle.owner} vehicle={vehicle} />
     }

     return (
          <div className="p-2">
               {!isValidCategory && (
                    <div className="mb-2 flex flex-col items-center justify-center text-center font-bold uppercase text-destructive-foreground">
                         <ExclamationTriangleIcon className="h-10 w-10" />
                         Meet an agent to update vehicle category and add sticker.
                    </div>
               )}
               {/* {role && vehicle.fairFlexImei && vehicle.fairFlexImei !== "" && (
                    <Button
                         className="mx-auto w-full max-w-xl rounded-xl bg-primary-800 text-white"
                         asChild
                         variant={"default"}
                    >
                         <Link
                              href={`/vehicles/${vehicle.plateNumber}/location`}
                              className="shrink-0 whitespace-nowrap"
                         >
                              <MapPin className="mr-2 h-4 w-4 shrink-0" />
                              View live location
                         </Link>
                    </Button>
               )} */}
               <Card className={`mx-auto min-h-[80svh] w-full max-w-4xl ${isVehicleClear ? "bg-emerald-600 md:bg-emerald-900/80" : "bg-destructive-foreground"} shadow-xl`}>
                    <CardHeader className="rounded-t-lg bg-primary text-center">
                         <div className="rounded-t-lg bg-secondary py-3">
                              <CardTitle className="text-lg font-bold">
                                   <div className="text-sm font-light">VEHICLE OWNER</div>
                                   <div className="mb-1">{vehicle.owner.firstName}{""}{vehicle.owner.lastName}</div>
                                   <div className="text-sm font-light">VEHICLE TYPE</div>
                                   <div className="mb-1">{vehicle.category}</div>
                                   <div className="font-semibold">NEXT PAYMENT DATE</div>
                                   <div className={`text-lg font-bold uppercase ${isVehicleClear ? "text-emerald-600" : "text-destructive-foreground"}`}>
                                        {isValidCategory
                                             ? getNextPaymentDate(Number(wallet.cvof_balance), Number(wallet.cvof_owing), vehicle.category as keyof typeof VehicleValues).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                               })
                                             : "Update Vehicle Category "}
                                   </div>
                                   {hasGroup && (
                                   <>
                                        <div className="text-sm font-light mt-2">VEHICLE GROUP</div>
                                        <div className="mb-1 text-3xl">{group?.groupName}</div>
                                   </>
                                   )}
                              </CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent className="p-2">
                         <div className="mb-4 flex items-center justify-center">
                              {isVehicleClear ? (
                                   <div className="flex flex-col items-center space-x-2 text-white">
                                        <CheckCircle2 className="h-20 w-20" />
                                        <div className="text-xl font-medium">Vehicle is clear!</div>
                                   </div>
                              ) : (
                                   <div className="flex flex-col items-center space-x-2 text-white">
                                        <AlertTriangle className="h-20 w-20" />
                                        <div className="text-xl font-medium">You have overdue payment of</div>
                                        <div className="text-3xl font-bold">₦{CVOFOwing.toLocaleString()}</div>
                                   </div>
                              )}
                         </div>
                         <Tabs className="mb-2 w-full" defaultValue="overview">
                              <TabsList className={`p-1" grid w-full grid-cols-5 rounded-lg bg-muted`}>
                                   <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                                        <User className="mr-2 h-5 w-5" />
                                        <span className="hidden md:inline-block">Overview</span>
                                   </TabsTrigger>
                                   <TabsTrigger value="vehicle" className="data-[state=active]:bg-background">
                                        <Car className="mr-2 h-5 w-5" />
                                        <span className="hidden md:inline-block">Vehicles</span>
                                   </TabsTrigger>
                                   <TabsTrigger value="wallet" className="data-[state=active]:bg-background">
                                        <Wallet className="mr-2 h-5 w-5" /> <span className="hidden md:inline-block">Wallet</span>
                                   </TabsTrigger>
                                   <TabsTrigger value="documents" className="data-[state=active]:bg-background">
                                        <FileText className="mr-2 h-5 w-5" /> <span className="hidden md:inline-block">Documents</span>
                                   </TabsTrigger>
                                   <TabsTrigger value="payment-history" className="data-[state=active]:bg-background">
                                        <History className="mr-2 h-4 w-4" />
                                        <span className="hidden md:inline-block">History</span>
                                   </TabsTrigger>
                              </TabsList>
                              <TabsContent value="overview" className="mt-2">
                                   <div className="grid gap-2 md:grid-cols-2">
                                        <InfoItem label="T CODE" value={vehicle.tCode} />
                                        <InfoItem label="PLATE NUMBER" value={vehicle.plateNumber} />
                                        <InfoItem label="STICKER" className={hasSticker ? "" : "text-destructive-foreground"} value={hasSticker ? vehicle.barcode : "NO STICKER ADDED"} />
                                        <InfoItem label="FAREFLEX" className={hasFareFlex ? "" : "text-destructive-foreground"} value={hasFareFlex ? vehicle.fairFlexImei : "NO FAREFLEX INSTALLED"} />
                                   </div>
                              </TabsContent>
                              <TabsContent value="vehicle" className="mt-2">
                                   <div className="grid gap-2 md:grid-cols-2">
                                        <InfoItem label="Chasis No" value={vehicle.vin ?? "NO CHASIS NUMBER"} />
                                        <InfoItem label="STICKER ID" value={vehicle.barcode ?? "NO STICKER ID"} />
                                        <InfoItem label="CATEGORY" value={vehicle.category} />
                                   </div>
                                   {/* <div className="mt-3">
                                        <h3 className="mb-2 font-semibold">
                                             Vehicle Image
                                        </h3>
                                        <img
                                             src={vehicle.image}
                                             alt="Vehicle"
                                             className="h-48 w-full rounded-lg object-cover"
                                        />
                                   </div> */}
                              </TabsContent>
                              <TabsContent value="wallet" className="mt-2">
                                   <div className="space-y-2">
                                        {/* <div>
                                             <h3 className="mb-2 font-semibold">Wallet Balance</h3>
                                             <Progress value={(CVOFBalance / (CVOFBalance + CVOFOwing)) * 100} className="h-4" />
                                             <div className="mt-2 flex justify-between">
                                                  <span>₦{CVOFBalance.toLocaleString()}</span>
                                                  <span className="text-destructive">₦{CVOFOwing.toLocaleString()} owing</span>
                                             </div>
                                        </div> */}
                                        <div className="grid gap-2 md:grid-cols-2">
                                             <InfoItem label="Vehicle Balance" value={`₦${Number(wallet.cvof_balance).toLocaleString()}`} />
                                             <InfoItem label="Vehicle Owing" value={`₦${Number(wallet.cvof_owing).toLocaleString()}`} />
                                             <InfoItem label="FareFlex Balance" value={`₦${Number(wallet.fareflex_balance).toLocaleString()}`} />
                                             <InfoItem label="FareFlex Owing" value={`₦${Number(wallet.fareflex_owing).toLocaleString()}`} />
                                             <InfoItem label="Device Maintenance" value={`₦${Number(wallet.isce_balance).toLocaleString()}`} />
                                        </div>
                                        {role && ADMIN_ROLES.includes(role) && <InfoItem label="Net Total" value={`₦${Number(wallet.net_total).toLocaleString()}`} />}
                                   </div>
                              </TabsContent>

                              <TabsContent value="documents" className="mt-2">
                                   <div className="grid gap-2 md:grid-cols-2">
                                        <InfoItem label="Owner Name" value={vehicle.owner.firstName ?? "NO OWNER NAME"} />
                                        <InfoItem label="Gender" value={vehicle.owner.gender ?? "NO OWNER GENDER"} />
                                        {role && (
                                             <>
                                                  <InfoItem label="Phone" value={vehicle.owner.phone ?? "NO OWNER PHONE"} />
                                                  <InfoItem label="Marital Status" value={vehicle.owner.marital_status ?? "NO MARITAL STATUS"} />
                                                  <InfoItem label="Address" value={vehicle.owner.address?.TEXT ?? "NO OWNER ADDRESS"} />
                                             </>
                                        )}
                                   </div>
                              </TabsContent>
                              <TabsContent value="payment-history" className="mt-2">
                                   <div className="space-y-2">
                                        <div className="mt-2">
                                             <PaymentHistoryUsingController vehicleId={vehicle.id} />
                                             {/* <PaymentHistory
                                                  filter={{
                                                       tcode: vehicle.tCode,
                                                       plateNumber: vehicle.plateNumber,
                                                  }}
                                             /> */}
                                        </div>{" "}
                                   </div>
                              </TabsContent>
                         </Tabs>
                    </CardContent>
               </Card>
          </div>
     );
}

function InfoItem({ label, value, className }: { label: string; value: string; className?: string }) {
     return (
          <div className={cn("rounded-lg bg-white p-3 shadow", className)}>
               <p className="text-sm text-muted-foreground">{label}</p>
               <p className={cn("font-bold", className)}>{value}</p>
          </div>
     );
}
