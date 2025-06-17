type Prettify<T> = {
     [K in keyof T]: T[K];
} & {};
interface IVehiclePayment {
     status: boolean;
     last_message: string;
     deficit: number;
     createdAt: string;
     updatedAt: string;
     id: string;
     amount: number;
     payment_status: "pending" | "processing" | "success" | "failed";
     vehicle_transaction_id: string;
     vehicle_id: string;
     transaction_date: string;
     description: string;
     payment_gateway_name: string;
     transaction_type: string;
     currency: "NGN";
     invoice_number: string;
     invoice_prefix: string;
     invoice_details: string;
     payment_type: string;
     user_role: string;
     user_id: string;
     transfer_id: string;
}
interface AgentPayment {
     id: string;
     driver: string;
     amount: number;
     date: string;
     payment_type: "Cash" | "Transfer" | "Bank Transfer" | "Mobile Transfer";
     status: "pending" | "processing" | "successful" | "failed";
}
interface DriverPayment {
     id: string;
     driver: string;
     amount: number;
     date: string;
     payment_type: "Cash" | "Transfer" | "Bank Transfer" | "Mobile Transfer";
     status: "pending" | "processing" | "successful" | "failed";
}
interface IWaiver {
     id: number;
     vehicle_waiver_id: string;
     vehicle_id: string;
     reason: string;
     additionalInfo: string;
     startDate: string;
     endDate: string;
     image: string;
     status: string;
     user_role: string;
     user_id: string;
     createdAt: string;
     updatedAt: string;
}
interface DriverT {
     name: string;
     phone_number: number;
}
interface AdminT {
     id: string;
     name: string;
     contact: {
          email: string;
          phone: string;
     };
     status: "active" | "inactive";
     address: string;
}
interface AgentT {
     id: string;
     name: string;
     phone: string;
     status: "active" | "inactive";
     area: string;
}
interface DataTableProps<TData, TValue> {
     columns: ColumnDef<TData, TValue>[];
     data: TData[];
     showSearch?: boolean;
     showColumns?: boolean;
     searchWith?: string;
     searchWithPlaceholder?: string;
     showPagination?: boolean;
     showSelected?: boolean;
     showRowsPerPage?: boolean;
}
interface Framework {
     value: string;
     label: string;
}
interface DashboardCardI {
     name: string;
     description: string;
     href: Url;
     number?: string;
     icon?: React.ReactNode;
     image?: string;
     className?: string;
}
interface FinesCardP {
     id?: number;
     title: string;
     description: string;
     type: "fine" | "penalty";
     amount: number;
}
interface ButtonF {
     text: string;
     icon?: React.ReactNode;
     variant: "primary" | "secondary";
     hasIcon?: boolean;
     onClick?: () => void;
     className?: string;
}
type IRole = "superadmin" | "admin" | "agent";
interface IDashboardCard {
     title: string;
     amount: number;
     desc?: string;
}
interface IActivity {
     id: string;
     createdAt: string;
     updatedAt: string;
     deletedAt: string;
     name: string;
     description: string;
     meta: {
          user: {
               id: string;
               name: string;
               role: string;
               email: string;
               expires_in: string;
               token_type: string;
               access_token: string;
          };
          page: {
               total: number;
               total_pages: number;
               page_number: number;
          };
     };
}

interface IActivityCard {
     id?: string;
     // activity_id: string;
     user_role?: string;
     user_id?: string;
     name: string;
     description: string;
     link: string;
     date?: string;
     time?: string;
}

interface IPage {
     name: string;
     href: string;
     icon?: React.ReactNode;
}
interface IDashboard {
     data: {
          admins: {
               blacklisted: IAdmin[];
          };
          chart: {
               transactions: {
                    all: IVehicleTransaction[];
                    dailyFees: IVehicleTransaction[];
                    fines: any[];
               };
               total: {
                    dailyFees: number;
                    fines: number;
                    revenue: number;
               };
          };
          activities: Pick<IActivity, "activity_id" | "id" | "name" | "description">[];
     };
}
interface IDriver {
     id: 1;
     driver_id: string;
     vehicle_id: string;
     firstname: string;
     lastname: string;
     phone: string;
     email: string;
     password: string;
     address: string;
     lga: string;
     city: string;
     state: string;
     country: string;
     postcode?: string;
     gender?: string;
     identification_type: string;
     identification_number: string;
     blacklisted: boolean;
     is_active: boolean;
     user_role: string;
     user_id: string;
     deleted: boolean;
     createdAt: string;
     updatedAt: string;
     Vehicle: Omit<IVehicle, "VehicleTransactions" | "VehicleFines" | "VehicleWaivers" | "Drivers">;
}

interface IWallet {
     id: string;
     createdAt: string;
     updatedAt: string;
     deletedAt: string;
     meta: {
          id: number;
          email: string;
          nuban: string;
          status: string;
          country: string;
          bank_code: string;
          bank_name: string;
          barter_id: string;
          createdAt: string;
          account_name: string;
          mobilenumber: string;
          account_reference: string;
     };
     wallet_balance: string;
     amount_owed: string;
     net_total: string;
     next_transaction_date: string;
     cvof_balance: string;
     fareflex_balance: string;
     isce_balance: string;
     cvof_owing: string;
     fareflex_owing: string;
     isce_owing: string;
}

interface IOwner {
     firstName: string;
     lastName: string;
     email: string;
     phone: string;
     whatsapp: string;
     gender: string;
     address: {
          COUNTRY: string;
          TEXT: string;
          LGA: string;
          CITY: string;
          STATE: string;
          UNIT: string;
          POSTAL_CODE: string;
        } | null;
     marital_status: string;
     valid_id: string;
     nok_name: string;
     nok_phone: string;
     nok_relationship: string;
     maiden_name: string;
    blacklisted: boolean;
    role: string;
    identification: {
      type: string;
      number: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
interface IGroup{
     id: string;
     name: string;
     vehicleCount: string;
}
interface IVehicle {
     User: any;
     id: string;
     group?: string;
     createdAt: string;
     updatedAt: string;
     deletedAt: string;
     color: string;
     category: string;
     plateNumber: string;
     image: string;
     blacklisted: boolean;
     status: string;
     ownerId?: string;
     type: string;
     vin: string;
     barcode: string;
     fairFlexImei: string;
     owner: IOwner;
     asinNumber: string;
     tCode: string;
     securityCode: string;
     wallet: IWallet;
     tracker: ITrackerMin;
     groupId?: string
     startDate?: Date
}

interface ITrackerMin {
     id: string;
     createdAt: string;
     updatedAt: string;
     deletedAt: string;
     terminal_id: string;
     info: string;
     stats: string;
     url: string;
     fee: string;
     unpaid: string;
     total: string;
}

interface ITransaction {
     id: string;
     createdAt: string;
     updatedAt: string;
     deletedAt: string;
     transaction_reference: string;
     in_reference: string;
     out_reference: string;
     description: string;
     payment_gateway: string;
     transaction_type: string;
     transaction_category: string;
     sender: {
          bank_code: string;
          bank_name: string;
          account_number: string;
     };
     recipient: null;
     amount: string;
     currency: string;
     revenue_amount: string;
     tracker_amount: string;
     wallet_charges: string;
     gateway_fee_in: string;
     gateway_fee_out: string;
     wallet_before: string;
     wallet_after: string;
     status: string;
     meta: null;
}
interface IVehicleTransaction {
     id?: number;
     vehicle_transaction_id?: string;
     vehicle_id: string;
     transaction_date: string;
     description?: string;
     payment_gateway_name: string;
     transaction_type: string;
     amount: number;
     currency: "NGN";
     invoice_number?: string;
     invoice_prefix?: string;
     invoice_details?: string;
     payment_type?: "transfer";
     user_role?: string;
     user_id?: string;
     payment_status: "pending" | "processing" | "successful";
     status?: boolean;
     transfer_id?: string;
     last_message: string | null;
     deficit?: number;
     createdAt?: string;
     updatedAt?: string;
}

type PrettyVehicle = Prettify<IVehicle>;
type PrettyVehicles = Prettify<IVehicles>;
interface IVehicles {
     data: {
          vehicles: IVehicle[];
          page: number;
          limit: number;
          total: number;
     };
}

interface IAdmin {
     id: number;
     admin_id: string;
     name: string;
     email: string;
     password: string;
     phone: string;
     role: string;
     blacklisted: boolean;
     createdAt: string;
     updatedAt: string;
}

interface IResAdmin {
     admin: IAdmin;
}
interface IAdmins {
     data: {
          admins: IAdmin[];
     };
}
interface IResAgent {
     agent: IAgent;
}

interface IVehicleSummary extends Omit<IVehicle, ""> {
     current_driver?: string;
}
interface IWaiverResponse {
     vehicle: IVehicle;
     waivers: IWaiver[];
     page: number;
     limit: number;
     total: number;
}

interface IResVehicleSummary {
     data: {
          vehicle: IVehicleSummary;
     };
}

type PrettyVehicleSummary = Prettify<IResVehicleSummary>;
interface IAgents {
     data: {
          agents: IAgent[];
     };
}
interface IResVehicle {
     vehicle: IVehicle;
}
interface IVehicles {
     data: {
          vehicles: IVehicle[];
     };
}
interface IResDrivers {
     drivers: IDriver[];
}
interface IDrivers {
     data: {
          drivers: IDriver[];
     };
}
interface IResSettings {
     data: {
          settings: ISettings[];
     };
}

interface StatusItem {
     title: string;
     description: number;
}

interface IInfo {
     total: number;
     active: number;
     owing: number;
     cleared: number;
     onWaivers: number;
}

interface IOthers {
     total: number;
     active: number;
     inactive: number;
}
interface ISettings {
     id: number;
     setting_id: string;
     name: string;
     description: string;
     value: string;
     user_id: string;
     user_role: string;
     updated_by_id: string;
     updated_by_role: string;
     createdAt: string;
     updatedAt: string;
}
interface IBits {
     id: number;
     bit_id: string;
     name: string;
     description: string;
     value: string;
     user_id: string;
     user_role: string;
     updated_by_id: string;
     updated_by_role: string;
     createdAt: string;
     updatedAt: string;
}
interface IUser {
     admin_id: string;
     blacklisted: boolean;
     createdAt: string;
     email: string;
     exp?: number;
     iat?: number;
     id: number;
     image: string;
     name: string;
     password: string;
     phone: string;
     role: string;
     updatedAt: string;
     user_type?: string;
}
interface IAgent {
     id: number;
     agent_id: string;
     name: string;
     phone: string;
     password: string;
     email: string;
     identification_type: string;
     identification_number: string;
     role: string;
     location: string;
     city: string;
     country: string;
     postcode: string;
     blacklisted: boolean;
     created_by: string;
     is_active: boolean;
     is_admin: boolean;
     createdAt: string;
     updatedAt: string;
}
interface IAdminMe {
     data: {
          admin: IUser;
     };
}
interface IAgentMe {
     data: {
          agent: IUser;
     };
}

interface ICategories {
     id: string;
     name: string;
}

interface IRevenue {
     transactions: IVehicleTransaction[];
     total: {
          dailyFees: number;
          fines: number;
          revenue: number;
     };
}

interface ITracker {
     address: string;
     ancestors: string;
     carNumber: string;
     createTime: string;
     device: string;
     enableTime: number;
     expire: boolean;
     hasChildren: boolean;
     id: number;
     idCard: string;
     linkman: string;
     location: ILocation;
     newPassword: string;
     nickname: string;
     password: string;
     performance: string;
     permission: string;
     picture: string;
     powerOnly: boolean;
     powerOnlyStartTime: number;
     realname: string;
     remark: string;
     role: number;
     salt: string;
     state: number;
     telephone: string;
     terminalID: string;
     token: string;
     user_id: number;
     username: string;
}

interface ILocation {
     acc: boolean;
     bdLat: number;
     bdLon: number;
     course: number;
     deviceNumber: string;
     deviceProtocol: number;
     deviceType: string;
     electric: number;
     gcjLat: number;
     gcjLon: number;
     gsm: number;
     humidity: number;
     iccid: string;
     id: string;
     lat: number;
     lbs: null;
     levelPercent: number;
     locationType: string;
     lon: number;
     networkProtocol: string;
     speed: number;
     state: number;
     stateTime: number;
     temperature: number;
     terminalID: string;
     utcTime: number;
     voltage: number;
}

interface IModifiedTrackerDetails {
     carNumber: string;
     createTime: string;
     lat: number;
     lon: number;
     nickname: string;
     terminalID: string;
     speed: number;
}

interface ICreateVehicleForm {
     image: string;
     category: string;
     color: string;
     status: string;
     vehicle_id?: string;
     plateNumber: string;
     asinNumber?: string;
     tCode?: string;
     type?: string;
     vin: string;
     barcode?: string;
     tracker_id?: string;
     owner: {
       firstName: string;
       lastName: string;
       phone: string;
       address: {
         text: string;
         lga?: string;
         city?: string;
         state?: string;
         unit?: string;
         country?: string;
         postal_code?: string;
       };
       gender?: string;
       marital_status?: string;
       whatsapp?: string;
       email?: string;
       identification: {
         type: string;
         number: string;
       };
       nok_name?: string;
       nok_phone?: string;
       nok_relationship?: string;
       maiden_name?: string;
     };
}
interface ICreateSettingForm {
     setting_id: string;
     name: string;
     description: string;
     value: string;
}
interface ICreateDriverForm {
     name: string;
     email: string;
     phone: string;
     address: string;
     city: string;
     lga: string;
     identification_type: string;
     identification_number: string;
     is_active: boolean;
     vehicle_id?: string;
}
interface IAddLicenseForm {
     license_number: string;
     license_name: string;
     license_expiry: string;
     driver_id?: string;
}
interface ICompany {
     id: string;
     created_at: string;
     updated_at: string;
     deleted_at: null;
     name: string;
     asin: string;
     address: string;
     phone: string;
     category: "MASS_TRANSIT";
     directors: [
       {
         id: string;
         created_at: string;
         updated_at: string;
         deleted_at: null;
         name: string;
         phone: string;
         email: string;
         blacklisted: boolean;
         address: string;
         asin_number: string;
       }
     ];
     directorCount: number;
     vehicles: IVehicle[];
   }
interface ICreateAdminForm {
     name: string;
     email: string;
     password: string;
     phone: string;
     role: string;
     admin_id?: string;
}
interface ICreateAgentForm {
     name: string;
     password: string;
     phone: string;
     email: string;
     identification_type: string;
     identification_number: string;
     role: string;
     location: string;
     city: string;
     country: string;
     postcode: string;
     agent_id?: string;
}

interface IToken {
     token: string;
     secret: string;
}
interface IInterStateVehicle {
     id: number;
     plate: string;
     ownername: string;
     owneraddress: string;
     ischeckedin: boolean;
     checkintime?: string;
     checkouttime?: string;
}

interface NFCCard {
     plate: string;
}

interface CheckInRecord {
     plate: string;
     checkintime: Date;
}

interface CheckOutRecord {
     plate: string;
     checkouttime: Date;
     fee: number;
}

interface Database {
     getVehicleById(plate: string): Vehicle | null;
     saveCheckInRecord(record: CheckInRecord): void;
     saveCheckOutRecord(record: CheckOutRecord): void;
}

interface IPropertyPaymentRecord {
     paymentDate: string;
     amountPaid: number;
}

interface IProperty {
     propertyId: string;
     ownerName: string;
     address: string;
     propertyType: string;
     assessmentValue: number;
     taxRate: number;
     taxAmount: number;
     paymentDueDate: string;
     isPaid: boolean;
     paymentRecords: IPropertyPaymentRecord[];
}

interface IDurationSummary {
     duration: string;
     totalDurationTricycleRev: number;
     totalDurationSmallShuttleRev: number;
     totalDurationBigShuttleRev: number;
     totalDurationTrackerRev: number;
     lgaRevenueSummary: ILGARevenueSummary[];
}

interface ILGARevenueSummary {
     lga: string;
     totalRev: number;
     tricycleRev: number;
     smallshuttleRev: number;
     bigshuttleRev: number;
     trackerRev: number;
}
type ITotalDashboard = "DAILY_FEES" | "TOTAL" | "TRACKER_FEES";

/////////////////////////////////////////
interface IUserExtended {
     id: string;
     createdAt?: string;
     updatedAt?: string;
     deletedAt?: string;
     firstName: string;
     lastName: string;
     phone?: string;
     password?: string;
     email: string;
     role: string;
     blacklisted?: boolean;
     address?: {
          city: string;
          lga: string;
          text: string;
          unit: string;
          state: string;
          country: string;
          postal_code: string;
     };
     identification?: { type: string; number: string };
}

type FilterType = "day" | "week" | "month" | "year";

type ChartDataPoint = {
     name: string;
     total: number | Decimal;
     disp?: string;
};

type IFrequency = "daily" | "weekly" | "monthly" | "yearly";

interface IPaymnetHistory {
     payment_date: string,
     transaction_amount: string
}[]

interface RoleGateOptions {
  allowedRole?: users_role_enum[];
  rejectedRole?: users_role_enum[];
  displayError?: boolean;
  redirectToSignIn?: boolean;
  errorMessage?: string;
}