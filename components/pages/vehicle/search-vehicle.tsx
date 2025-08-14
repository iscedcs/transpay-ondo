import { getGroupById } from "@/actions/groups";
import { getAllStickerRequests } from "@/actions/sticker-request";
import { DeleteVehicleButton } from "@/components/delete-vehicle-from-group-button";
import FareFlexAdder from "@/components/layout/fareflex-adder";
import NextOfKinAdder from "@/components/layout/nex-of-kin-adder";
import ViewRegistrar from "@/components/layout/view-registar";
import FormError from "@/components/shared/FormError";
import { AddVehicleToGroup } from "@/components/ui/add-vehicle-to-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_ROLES, VehicleValues } from "@/lib/const";
import { getVehicleByTCodeOrPlateNumber } from "@/lib/controllers/vehicle-controller";
import { getSSession } from "@/lib/get-data";
import { cn, getNextPaymentDate } from "@/lib/utils";
import { TransactionCategories } from "@prisma/client";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  FileText,
  History,
  User,
  Wallet,
} from "lucide-react";
import { getCountNotDeletedByPlateNumber } from "@/actions/sticker-notifications";
import PaymentHistoryUsingController from "./payment-history-using-controller";
import { UpdateStartDate } from "@/components/UpdateStartDate";
import { Separator } from "@/components/ui/separator";
import { RecalculateNetTotalButton } from "@/components/RecalculateNetTotalButton";
import { getWaiverDueToDisablementById } from "@/actions/waiver";
import VehicleWaiverView from "./waiver-view";

export default async function SearchVehicle({ id }: { id: string }) {
  const { role } = await getSSession();
  const vehicle = await getVehicleByTCodeOrPlateNumber(id);
  if (!vehicle) return <FormError message="Vehicle Not Found" />;
  const group = await getGroupById(vehicle?.groupId);
  const disabledWaiver = await getWaiverDueToDisablementById(vehicle?.id);
  const onWaiver = !!disabledWaiver;

  const stickerRequests = await getAllStickerRequests({
    vehicleId: vehicle.id,
  });
  const wallet = vehicle?.wallet;

  const isVehicleClear =
    vehicle.status === "ACTIVE" && Number(wallet.cvof_owing) === 0;
  const CVOFOwing = Number(wallet.cvof_owing);

  const isValidCategory = !Object.keys(TransactionCategories).includes(
    vehicle.category
  );
  const hasFareFlex =
    !!vehicle.fairFlexImei && vehicle.fairFlexImei.trim() !== "";
  const hasSticker = !!vehicle.barcode && vehicle.barcode.trim() !== "";
  const hasGroup = !!vehicle.groupId || !!group;
  const newStickerCount = await getCountNotDeletedByPlateNumber(
    vehicle.plateNumber
  );
  const hasNewSticker = newStickerCount > 0;
  const isBarcodeValid = !!vehicle.barcode;
  const hasEnoughISCEWalletBalance = Number(wallet.isce_balance) >= 1200;

  if (onWaiver) {
    return (
      <VehicleWaiverView
        waiverInfo={disabledWaiver}
        owner={vehicle.owner}
        vehicle={vehicle}
      />
    );
  }

  return (
    <>
      {!isValidCategory && (
        <div className="mb-2 flex flex-col items-center justify-center text-center font-bold uppercase text-destructive-foreground">
          <ExclamationTriangleIcon className="h-10 w-10" />
          Update vehicle category to add sticker.
        </div>
      )}
      <Card
        className={`mx-auto min-h-[80svh] w-full max-w-4xl ${
          isVehicleClear ? "bg-emerald-600" : "bg-destructive-foreground"
        } shadow-xl`}
      >
        <CardHeader className="rounded-t-lg bg-primary text-center">
          <div className="rounded-t-lg bg-secondary py-3">
            <CardTitle className="text-lg font-bold">
              <div className="text-sm font-light">VEHICLE OWNER</div>
              <div className="mb-1">{vehicle.owner.firstName}</div>
              <div className="text-sm font-light">VEHICLE TYPE</div>
              <div className="mb-1">{vehicle.category}</div>
              <div className="font-semibold">NEXT PAYMENT DATE</div>
              <div
                className={`text-lg font-bold uppercase ${
                  isVehicleClear
                    ? "text-emerald-600"
                    : "text-destructive-foreground"
                }`}
              >
                {isValidCategory
                  ? getNextPaymentDate(
                      Number(wallet.cvof_balance),
                      Number(wallet.cvof_owing),
                      vehicle.category as keyof typeof VehicleValues
                    ).toLocaleDateString("en-US", {
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
                <div className="text-xl font-medium">
                  You have overdue payment of
                </div>
                <div className="text-3xl font-bold">
                  ₦{CVOFOwing.toLocaleString()}
                </div>
              </div>
            )}
          </div>
          <Tabs className="mb-2 w-full" defaultValue="overview">
            <TabsList
              className={`p-1" grid w-full grid-cols-5 rounded-lg bg-muted`}
            >
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-background"
              >
                <User className="mr-2 h-5 w-5" />
                <span className="hidden md:inline-block">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="vehicle"
                className="data-[state=active]:bg-background"
              >
                <Car className="mr-2 h-5 w-5" />
                <span className="hidden md:inline-block">Vehicles</span>
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="data-[state=active]:bg-background"
              >
                <Wallet className="mr-2 h-5 w-5" />{" "}
                <span className="hidden md:inline-block">Wallet</span>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-background"
              >
                <FileText className="mr-2 h-5 w-5" />{" "}
                <span className="hidden md:inline-block">Documents</span>
              </TabsTrigger>
              <TabsTrigger
                value="payment-history"
                className="data-[state=active]:bg-background"
              >
                <History className="mr-2 h-4 w-4" />
                <span className="hidden md:inline-block">History</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-2">
              <div className="grid gap-2 md:grid-cols-2">
                <InfoItem label="T CODE" value={vehicle.tCode} />
                <InfoItem label="ASIN" value={String(vehicle.asinNumber)} />
                <InfoItem label="PLATE NUMBER" value={vehicle.plateNumber} />
                <InfoItem
                  label="STICKER"
                  className={hasSticker ? "" : "text-destructive-foreground"}
                  value={hasSticker ? vehicle.barcode : "NO STICKER ADDED"}
                />
                <InfoItem
                  label="FAREFLEX"
                  className={hasFareFlex ? "" : "text-destructive-foreground"}
                  value={
                    hasFareFlex ? vehicle.fairFlexImei : "NO FAREFLEX INSTALLED"
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="vehicle" className="mt-2">
              <div className="grid gap-2 md:grid-cols-2">
                <InfoItem
                  label="Chasis No"
                  value={vehicle.vin ?? "NO CHASIS NUMBER"}
                />
                <InfoItem label="T CODE" value={vehicle.tCode} />
                <InfoItem
                  label="STICKER ID"
                  value={vehicle.barcode ?? "NO STICKER ID"}
                />
                <InfoItem label="CATEGORY" value={vehicle.category} />
              </div>
            </TabsContent>
            <TabsContent value="wallet" className="mt-2">
              <div className="space-y-2">
                <div className="grid gap-2 md:grid-cols-2">
                  <InfoItem
                    label="Vehicle Balance"
                    value={`₦${Number(wallet.cvof_balance).toLocaleString()}`}
                  />
                  <InfoItem
                    label="Vehicle Owing"
                    value={`₦${Number(wallet.cvof_owing).toLocaleString()}`}
                  />
                  <InfoItem
                    label="FareFlex Balance"
                    value={`₦${Number(
                      wallet.fareflex_balance
                    ).toLocaleString()}`}
                  />
                  <InfoItem
                    label="FareFlex Owing"
                    value={`₦${Number(wallet.fareflex_owing).toLocaleString()}`}
                  />
                  <InfoItem
                    label="Device Maintenance"
                    value={`₦${Number(wallet.isce_balance).toLocaleString()}`}
                  />
                </div>
                {role && ADMIN_ROLES.includes(role) && (
                  <InfoItem
                    label="Net Total"
                    value={`₦${Number(wallet.net_total).toLocaleString()}`}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="documents" className="mt-2">
              <div className="grid gap-2 md:grid-cols-2">
                <InfoItem
                  label="Owner Name"
                  value={vehicle.owner.firstName ?? "NO OWNER NAME"}
                />
                <InfoItem
                  label="Gender"
                  value={vehicle.owner.gender ?? "NO OWNER GENDER"}
                />
                {role && (
                  <>
                    <InfoItem
                      label="Phone"
                      value={vehicle.owner.phone ?? "NO OWNER PHONE"}
                    />
                    <InfoItem
                      label="Marital Status"
                      value={
                        vehicle.owner.marital_status ?? "NO MARITAL STATUS"
                      }
                    />
                    <InfoItem
                      label="Address"
                      value={vehicle.owner.address?.TEXT ?? "NO OWNER ADDRESS"}
                    />
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
                                                  pageSize={50}
                                             /> */}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          {role && (
            <div className="mx-auto w-full max-w-6xl ">
              <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                <>
                  {ADMIN_ROLES.includes(role) && (
                    <ViewRegistrar
                      id={vehicle.id}
                      name="View Registrar"
                      image={"/registrar.jpg"}
                      description={"Check who onboarded this vehicle"}
                      tCode={vehicle.tCode}
                      plateNumber={vehicle.plateNumber}
                    />
                  )}
                  {/* {role !== Role.GREEN_ENGINE && role !== Role.GREEN_ENGINE_AGENT && (
                                                  <>
                                                       <DashboardCard
                                                            name="Vehicle Information"
                                                            href={`/vehicles/${vehicle.id}/edit`}
                                                            image={"/personalinfo.png"}
                                                            description={"View Vehicle information"}
                                                       />

                                                       {!isBarcodeValid && hasEnoughISCEWalletBalance && (
                                                            <BarcodeAdder
                                                                 id={vehicle.id}
                                                                 name="Add Sticker"
                                                                 image={"/payment.png"}
                                                                 description={"Scan to add sticker to vehicle"}
                                                                 tCode={vehicle.tCode}
                                                                 wallet={wallet}
                                                            />
                                                       )}
                                                  </>
                                             )} */}
                  {role.toLowerCase() === "superadmin" ||
                  role?.toLowerCase() === "green_engine" ? (
                    vehicle?.fairFlexImei === "" || !vehicle?.fairFlexImei ? (
                      <>
                        <FareFlexAdder
                          id={vehicle.id}
                          name="Add Fare Flex Device"
                          image={"/fareflex.png"}
                          description={"Add fareflex imei to vehicle"}
                        />
                        <NextOfKinAdder
                          vehicle={vehicle}
                          name="Update Vehicle Info"
                          image={"/tricycle.jpg"}
                          description={"Fareflex installation details"}
                        />
                      </>
                    ) : (
                      <></>
                    )
                  ) : (
                    <></>
                  )}
                </>
              </div>
              <div className="grid lg:grid-cols-2 gap-3">
                {/* {ADMIN_ROLES.includes(role) && hasSticker && <RequestReplacement id={vehicle.id} />}
                                        {!hasSticker && !hasNewSticker && <RequestSticker id={vehicle.id} />} */}
                {ADMIN_ROLES.includes(role) && hasGroup ? (
                  <DeleteVehicleButton vehicle={vehicle} />
                ) : (
                  <AddVehicleToGroup vehicleId={vehicle.id} />
                )}
              </div>
              {/* {stickerRequests.data && stickerRequests.data?.length > 0 && (
                                        <Card className="mt-2">
                                        <CardHeader>
                                             <CardTitle className="flex items-center">Sticker Request History</CardTitle>
                                             <div className="pt-[10px] ">
                                                  <Table className="rounded-[10px]" >
                                                       <TableHeader>
                                             <TableRow>
                                                  <TableHead>Description Date</TableHead>
                                                  <TableHead>Status</TableHead>
                                             </TableRow>
                                                       </TableHeader>
                                                       <TableBody>
                                                            {stickerRequests.data?.map((request, i) => (
                                                                 <TableRow key={i}>
                                                                      <TableCell>{formatDate(String(request.createdAt))}</TableCell>
                                                                      <TableCell>{request.status}</TableCell>
                                                                 </TableRow>
                                                            ))}
                                                       </TableBody>
                                                  </Table>
                                             </div>
                                        </CardHeader>
                                   </Card>
                                   ) } */}
            </div>
          )}
          {ADMIN_ROLES && (
            <>
              <Separator className="my-5" />
              <div className="grid grid-cols-2 gap-3">
                <UpdateStartDate tCode={vehicle.tCode} />
                <RecalculateNetTotalButton tCode={vehicle.tCode} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
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