import CarouselSlides from "@/components/layout/carouselSlides";
import { Role } from "@prisma/client";
import {
  ActivitySquareIcon,
  CarTaxiFront,
  ChartBarIcon,
  CreditCard,
  LogsIcon,
  MapPin,
  QrCodeIcon,
  SettingsIcon,
  Shield,
  ShieldCheck,
  Split,
  WalletCards,
} from "lucide-react";
import {
  aboutIcon,
  adminIcon,
  agentDriverIcon,
  agentsIcon,
  dashboardIcon,
  homeIcon,
  peopleIcon,
  profileIcon,
  revenueIcon,
  scanIcon,
  searchIcon,
  securityIcon,
} from "./icons";

export const SIDEBAR_LINKS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: dashboardIcon,
  },
  {
    title: "LGAS",
    href: "/lgas",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/users",
    icon: adminIcon,
  },
  {
    title: "Agency",
    href: "/agency",
    icon: <LogsIcon className="w-5 h-5" />,
  },
  {
    title: "Stickers",
    href: "/stickers",
    icon: <QrCodeIcon className="h-5 w-5" />,
  },
  {
    title: "Activities",
    href: "/activities",
    icon: <ActivitySquareIcon className="h-5 w-5" />,
  },
  {
    title: "Vehicles",
    href: "/vehicles?page=1&limit=15",
    icon: <CarTaxiFront className="h-5 w-5" />,
  },
  {
    title: "Scan",
    href: "/scan",
    icon: scanIcon,
  },
  {
    title: "Search",
    href: "/search",
    icon: searchIcon,
  },
  {
    title: "Revenue",
    href: "/revenue",
    icon: revenueIcon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <SettingsIcon className="h-5 w-5" />,
  },
  {
    title: "Settlement",
    href: "/settlement",
    icon: <Split className="h-5 w-5" />,
  },
  {
    title: "Fund Vehicle",
    href: "/fund-vehicle",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Insurance",
    href: "/insurance",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: "Insurer",
    href: "/insurance-company",
    icon: <Shield className="h-5 w-5" />,
  },
];
export const SIDEBAR_LINKS_ADMIN = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: dashboardIcon,
  },
  {
    title: "LGAS",
    href: "/lgas",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/users",
    icon: adminIcon,
  },
  {
    title: "Activities",
    href: "/activities",
    icon: <ActivitySquareIcon className="h-5 w-5" />,
  },
  {
    title: "Vehicles",
    href: "/vehicles?page=1&limit=15",
    icon: <CarTaxiFront className="h-5 w-5" />,
  },
  {
    title: "Scan",
    href: "/scan",
    icon: scanIcon,
  },
  {
    title: "Search",
    href: "/search",
    icon: searchIcon,
  },
  {
    title: "Revenue",
    href: "/revenue",
    icon: revenueIcon,
  },
  {
    title: "Fund Vehicle",
    href: "/fund-vehicle",
    icon: <CreditCard className="h-5 w-5" />,
  },
];
export const SIDEBAR_LINKS_ODIRS_ADMIN = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: dashboardIcon,
  },
  {
    title: "LGAS",
    href: "/lgas",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/users",
    icon: adminIcon,
  },
  {
    title: "Vehicles",
    href: "/vehicles?page=1&limit=15",
    icon: <CarTaxiFront className="h-5 w-5" />,
  },
  {
    title: "Scan",
    href: "/scan",
    icon: scanIcon,
  },
  {
    title: "Search",
    href: "/search",
    icon: searchIcon,
  },
  {
    title: "Revenue",
    href: "/revenue",
    icon: revenueIcon,
  },
  // {
  //   title: "Fund Vehicle",
  //   href: "/fund-vehicle",
  //   icon: <CreditCard className="h-5 w-5" />,
  // },
];
export const SIDEBAR_LINKS_ODIRS_C_AGENT = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: dashboardIcon,
  },
  {
    title: "Vehicles",
    href: "/vehicles?page=1&limit=15",
    icon: <CarTaxiFront className="h-5 w-5" />,
  },
  {
    title: "Scan",
    href: "/scan",
    icon: scanIcon,
  },
  {
    title: "Search",
    href: "/search",
    icon: searchIcon,
  },
];
export const AGENCY_ADMIN = (agencyId: string) => [
  {
    title: "Dashboard",
    href: "/agency",
    icon: dashboardIcon,
  },
  {
    title: "Agents",
    href: `/agency/${agencyId}/agents`,
    icon: agentsIcon,
  },
  {
    title: "Activities",
    href: `/agency/${agencyId}`,
    icon: <ActivitySquareIcon className="h-5 w-5" />,
  },
  {
    title: "Revenue",
    href: `/agency/${agencyId}/dashboard`,
    icon: revenueIcon,
  },
  // {
  //   title: "Settlement",
  //   href: `/agency/agents/commission`,
  //   icon: <Split className="h-5 w-5" />,
  // },
  {
    title: "Transactions",
    href: `/agency/${agencyId}/transactions`,
    icon: <ChartBarIcon className="h-5 w-5" />,
  },
  {
    title: "Search",
    href: "/agency/search",
    icon: searchIcon,
  },
];
export const AGENCY_AGENT = [
  {
    title: "Dashboard",
    href: "/agency/agents",
    icon: dashboardIcon,
  },
  {
    title: "Fund Vehicle",
    href: "/agency/agents/search",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Commission",
    href: "/agency/agents/commission",
    icon: <WalletCards className="h-5 w-5" />,
  },
  {
    title: "Transactions",
    href: "/agency/agents/transactions",
    icon: revenueIcon,
  },

  {
    title: "Scan",
    href: "/scan",
    icon: scanIcon,
  },
];
export const SIDEBAR_NO_USER = [
  {
    title: "Scan",
    href: "/scan",
    icon: scanIcon,
  },
];

// export const SIDEBAR_LINKS_LGA_ADMIN = [
//   {
//     title: "Dashboard",
//     href: "/dashboard",
//     icon: dashboardIcon,
//   },
//   {
//     title: "Users",
//     href: "/users",
//     icon: adminIcon,
//   },
//   {
//     title: "Vehicles",
//     href: "/vehicles?page=1&limit=15",
//     icon: <CarTaxiFront className="h-5 w-5" />,
//   },
//   {
//     title: "Scan",
//     href: "/scan",
//     icon: scanIcon,
//   },
//   {
//     title: "Search",
//     href: "/search",
//     icon: searchIcon,
//   },
//   {
//     title: "Revenue",
//     href: "/revenue",
//     icon: revenueIcon,
//   },
//   {
//     title: "Fund Vehicle",
//     href: "/fund-vehicle",
//     icon: <CreditCard className="h-5 w-5" />,
//   },
// ];
// export const SIDEBAR_LINKS_LGA_AGENT = [
//   {
//     title: "Dashboard",
//     href: "/dashboard",
//     icon: dashboardIcon,
//   },
//   {
//     title: "Vehicles",
//     href: "/vehicles?page=1&limit=15",
//     icon: <CarTaxiFront className="h-5 w-5" />,
//   },
//   {
//     title: "Scan",
//     href: "/scan",
//     icon: scanIcon,
//   },
//   {
//     title: "Search",
//     href: "/search",
//     icon: searchIcon,
//   },
// ];
export const MANAGE_SIDEBAR_LINKS = [
  {
    name: "Home",
    href: "/manage",
    icon: homeIcon,
  },
  {
    name: "My Profile",
    href: "/manage/profile",
    icon: profileIcon,
  },
  {
    name: "Security",
    href: "/manage/security",
    icon: securityIcon,
  },
  {
    name: "About Us",
    href: "/manage/about",
    icon: aboutIcon,
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: dashboardIcon,
  },
  {
    title: "Search",
    href: "/search",
    icon: searchIcon,
  },
];
export const DRIVERS_CARD = [
  {
    name: "Personal Information",
    description: "Edit Drivers information",
    href: "/vehicles?page=1&limit=15",
    image: "/personalinfo.png",
  },
  {
    name: "Payment",
    description: "Make Payment & Check Payment History",
    href: "/revenue",
    image: "/payment.png",
  },
  // {
  // 	name: 'Fines & Penalties',
  // 	description: 'Fine Driver & Check Fine Payment',
  // 	href: '/fines',
  // 	image: '/fineandpenal.png',
  // },
];
export const DASHBOARD_CARD = [
  {
    name: "Agents",
    description: "Agents List",
    icon: peopleIcon,
    number: "500",
    href: "/agents",
    image: "/tricycle.jpg",
  },
  {
    name: "Vehicles",
    description: "Drivers list & Update",
    icon: peopleIcon,
    number: "9,200",
    href: "/vehicles?page=1&limit=15",
    image: "/tricycle.jpg",
  },
  // {
  // 	name: 'Fines & Penalties',
  // 	description: 'Create fines & penalties',
  // 	icon: finesIcon,
  // 	number: '10,000',
  // 	href: '/fines',
  // 	image: '/tricycle.jpg',
  // },
  {
    name: "Scan Plate",
    description: "Scan Driver Plate to retrieve drivers information plate",
    icon: "",
    number: "",
    href: "/scan",
    image: "/scanplate.png",
  },
  {
    name: "Revenue and Stats",
    description: "View Money raised and submitted.",
    icon: "",
    number: "",
    href: "/revenue",
    image: "/tricycle.jpg",
  },
];
export const AGENT_DASHBOARD_CARD = [
  {
    name: "Vehicles",
    description: "Vehicle list & Update",
    icon: peopleIcon,
    number: "",
    href: "/vehicles?page=1&limit=15",
    image: "/tricycle.jpg",
  },
  // {
  // 	name: 'Fines & Penalties',
  // 	description: 'Create fines & penalties',
  // 	icon: finesIcon,
  // 	number: '10,000',
  // 	href: '/fines',
  // 	image: '/tricycle.jpg',
  // },
  // {
  //      name: "Scan Plate",
  //      description:
  //           "Scan Driver Plate to retrieve drivers information plate",
  //      icon: "",
  //      number: "",
  //      href: "/scan",
  //      image: "/scanplate.png",
  // },
];
export const AGENT_TABLE = [
  {
    name: "Emeka Ignatius",
    area: "Agege",
    phone: "08061719533",
    status: "active",
  },
  {
    name: "Emmanuel Ozigbo",
    area: "Festac",
    phone: "08061719533",
    status: "inactive",
  },
  {
    name: "Agent 1",
    area: "Agege",
    phone: "08065543210",
    status: "active",
  },
  {
    name: "Agent 2",
    area: "Festac",
    phone: "08062345678",
    status: "inactive",
  },
  {
    name: "Agent 3",
    area: "Ikeja",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 4",
    area: "Surulere",
    phone: "08064321098",
    status: "inactive",
  },
  {
    name: "Agent 5",
    area: "Lekki",
    phone: "08063456789",
    status: "active",
  },
  {
    name: "Agent 6",
    area: "Ajao Estate",
    phone: "08060987654",
    status: "inactive",
  },
  {
    name: "Agent 7",
    area: "Yaba",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 8",
    area: "Oshodi",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 9",
    area: "Ikoyi",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 10",
    area: "Victoria Island",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 11",
    area: "Maryland",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 12",
    area: "Ikorodu",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 13",
    area: "Gbagada",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 14",
    area: "Magodo",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 15",
    area: "Sangotedo",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 16",
    area: "Egbeda",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 17",
    area: "Apapa",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 18",
    area: "Ijebu Ode",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 19",
    area: "Akoka",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 20",
    area: "Mushin",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 21",
    area: "Ikeja",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 22",
    area: "Ajao Estate",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 23",
    area: "Yaba",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 24",
    area: "Oshodi",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 25",
    area: "Ikoyi",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 26",
    area: "Victoria Island",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 27",
    area: "Maryland",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 28",
    area: "Ikorodu",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 29",
    area: "Gbagada",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 30",
    area: "Magodo",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 31",
    area: "Sangotedo",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 32",
    area: "Egbeda",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 33",
    area: "Apapa",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 34",
    area: "Ijebu Ode",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 35",
    area: "Akoka",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 36",
    area: "Mushin",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent 37",
    area: "Festac",
    phone: "08064321987",
    status: "active",
  },
  {
    name: "Agent 38",
    area: "Agege",
    phone: "08063456781",
    status: "inactive",
  },
  {
    name: "Agent 39",
    area: "Lekki",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent 40",
    area: "Surulere",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent A",
    area: "Ikeja",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent B",
    area: "Yaba",
    phone: "08064321987",
    status: "inactive",
  },
  {
    name: "Agent C",
    area: "Surulere",
    phone: "08063456781",
    status: "active",
  },
  {
    name: "Agent D",
    area: "Oshodi",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent E",
    area: "Lekki",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent F",
    area: "Ikoyi",
    phone: "08064321987",
    status: "inactive",
  },
  {
    name: "Agent G",
    area: "Ajao Estate",
    phone: "08063456781",
    status: "active",
  },
  {
    name: "Agent H",
    area: "Festac",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent I",
    area: "Victoria Island",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent J",
    area: "Agege",
    phone: "08064321987",
    status: "inactive",
  },
  {
    name: "Agent K",
    area: "Ikorodu",
    phone: "08063456781",
    status: "active",
  },
  {
    name: "Agent L",
    area: "Magodo",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent M",
    area: "Maryland",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent N",
    area: "Egbeda",
    phone: "08064321987",
    status: "inactive",
  },
  {
    name: "Agent O",
    area: "Gbagada",
    phone: "08063456781",
    status: "active",
  },
  {
    name: "Agent P",
    area: "Apapa",
    phone: "08067654321",
    status: "inactive",
  },
  {
    name: "Agent Q",
    area: "Mushin",
    phone: "08061234567",
    status: "active",
  },
  {
    name: "Agent R",
    area: "Akoka",
    phone: "08064321987",
    status: "inactive",
  },
  {
    name: "Agent S",
    area: "Ijebu Ode",
    phone: "08063456781",
    status: "active",
  },
  {
    name: "Agent T",
    area: "Sangotedo",
    phone: "08067654321",
    status: "inactive",
  },
];
export const DRIVER_TABLE = [
  {
    name: "Emeka Ignatius",
    plate: "tfgh-ilt",
    status: "active",
    category: "cleared",
  },
  {
    name: "Emmanuel Ozigbo",
    plate: "trhb6-9jw",
    status: "inactive",
    category: "debtors",
  },
  {
    name: "Divine Onyekachukwu",
    plate: "gtw8-owg",
    status: "waived",
    category: "debtors",
  },
  {
    name: "Oyeniran Ayobami",
    plate: "97yy-kjy",
    status: "active",
    category: "cleared",
  },
];
export const PAYMENT_TABLE = [
  {
    driver: "Emeka Ignatius",
    amount: "1,500",
    date: "11/08/23",
    status: "successful",
  },
  {
    driver: "Emmanuel Ozigbo",
    amount: "3,000",
    date: "11/08/23",
    status: "processing",
  },
  {
    driver: "Divine Onyekachukwu",
    amount: "8,392",
    date: "11/08/23",
    status: "pending",
  },
  {
    driver: "Divine Onyekachukwu",
    amount: "8,392",
    date: "11/08/23",
    status: "pending",
  },
  {
    driver: "Divine Onyekachukwu",
    amount: "8,392",
    date: "11/08/23",
    status: "pending",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
  {
    driver: "Oyeniran Ayobami",
    amount: "6,793",
    date: "11/08/23",
    status: "failed",
  },
];
export const VIEW_DRIVER_TABLE = [
  {
    Date: "23-08-2023",
    amount_NGN: "15000",
    payment_type: "Cash",
    handled_by: "Agent john",
  },
  {
    Date: "22-08-2023",
    amount_NGN: "10000",
    payment_type: "Bank Transfer",
    handled_by: "Agent James",
  },
  {
    Date: "24-08-2023",
    amount_NGN: "25000",
    payment_type: "Cash",
    handled_by: "Agent Jane",
  },
  {
    Date: "21-08-2023",
    amount_NGN: "60,000",
    payment_type: "Mobile Transfer",
    handled_by: "Agent Janet",
  },
  {
    Date: "23-08-2023",
    amount_NGN: "5000",
    payment_type: "Cash",
    handled_by: "Agent Jonathan",
  },
  {
    Date: "25-08-2023",
    amount_NGN: "19000",
    payment_type: "Cash",
    handled_by: "Agent Helen",
  },
  {
    Date: "25-08-2023",
    amount_NGN: "19000",
    payment_type: "Cash",
    handled_by: "Agent Helen",
  },
  {
    Date: "25-08-2023",
    amount_NGN: "19000",
    payment_type: "Cash",
    handled_by: "Agent Helen",
  },
  {
    Date: "25-08-2023",
    amount_NGN: "19000",
    payment_type: "Cash",
    handled_by: "Agent Helen",
  },
];
export const ADD_DRIVER_TABLE = [
  {
    Name: "Okechukwu John",
    Phone_Number: "09078398045",
  },
  {
    Name: "Ikechukwu Jonathan",
    Phone_Number: "09078398048",
  },
  {
    Name: "Tobechukwu Tony",
    Phone_Number: "09078398047",
  },
  {
    Name: "Godson Alfred",
    Phone_Number: "09078398075",
  },
  {
    Name: "Godwin Emmanuel",
    Phone_Number: "09078399045",
  },
  {
    Name: "Micheal Thomas",
    Phone_Number: "09078398065",
  },
  {
    Name: "Abraham Pius",
    Phone_Number: "09078398985",
  },
  {
    Name: "Anthony Wilson",
    Phone_Number: "09078398095",
  },
  {
    Name: "Obi Moses",
    Phone_Number: "09078398105",
  },
];
// WEB AGENT
export const WEB_AGENT_SIDEBAR_LINKS = [
  {
    name: "Dashboard",
    href: "/web-agent",
    icon: dashboardIcon,
  },
  {
    name: "Scan",
    href: "/web-agent/scan",
    icon: scanIcon,
  },
  {
    name: "Driver",
    href: "/web-agent/driver",
    icon: agentDriverIcon,
  },
];
export const WEB_AGENT_CARD = [
  {
    name: "Scan Plate",
    description: "Scan Driver Plate to retrieve drivers information plate",
    icon: "",
    number: "",
    href: "/web-agent/scan",
    image: "/scanplate.png",
  },

  // {
  // 	name: 'Drivers',
  // 	description: 'Drivers list & Update',
  // 	icon: peopleIcon,
  // 	number: '2,500',
  // 	href: '/web-agent/driver',
  // 	image: '/drivers.png',
  // },
];
export const WEB_AGENT_DRIVER_CARD = [
  {
    name: "Vehicle Information",
    description: "View Vehicle information",
    href: "/web-agent/driver/editinfo",
    image: "/personalinfo.png",
  },
  {
    name: "Payment",
    description: "Make Payment & Check Payment History",
    href: "/web-agent/driver/payment",
    image: "/payment.png",
  },
  {
    name: "Fines & Penalties",
    description: "Fine Driver & Check Fine Payment",
    href: "/web-agent/driver/plate/fines",
    image: "/fineandpenal.png",
  },
  {
    name: "Waiver Form",
    description: "Fill waiver form to process driver grace period.",
    href: "/web-agent",
    image: "/fineandpenal.png",
  },
];
export const FINE_CARDS: FinesCardP[] = [
  {
    id: 0,
    title: "Speeding",
    description: "Exceeding the speed limit on the highway.",
    type: "fine",
    amount: 10000, // Amount in Nigerian Naira
  },
  {
    id: 1,
    title: "Driving without License",
    description: "Operating a vehicle without a valid driver's license.",
    type: "fine",
    amount: 8000,
  },
  {
    id: 2,
    title: "Running Red Light",
    description: "Passing through a red traffic light signal.",
    type: "fine",
    amount: 12000,
  },
  {
    id: 3,
    title: "Overloading Vehicle",
    description: "Carrying more passengers or goods than allowed.",
    type: "fine",
    amount: 15000,
  },
  {
    id: 4,
    title: "Using Mobile While Driving",
    description:
      "Using a mobile phone without a hands-free device while driving.",
    type: "fine",
    amount: 5000,
  },
  {
    id: 5,
    title: "Unauthorized Parking",
    description: "Parking in a no-parking zone or blocking traffic.",
    type: "fine",
    amount: 7000,
  },
  {
    id: 6,
    title: "Operating Vehicle without Insurance",
    description: "Driving a vehicle without valid insurance coverage.",
    type: "fine",
    amount: 10000,
  },
  {
    id: 7,
    title: "Driving Under the Influence",
    description: "Driving while intoxicated by alcohol or drugs.",
    type: "fine",
    amount: 20000,
  },
];
// ADMINS PAGE
export const ADMINS_TABLE = [
  {
    id: "0",
    name: "Emeka Ignatius",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "123-456-7890",
    },
    address: "1st avenue idumota road",
    status: "active",
  },
  {
    id: "1",
    name: "Emmanuel Ozigbo",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08061719533",
    },
    address: "frank way 2nd plot 2435",
    status: "inactive",
  },
  {
    id: "2",
    name: "Agent 1",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08065543210",
    },
    address: "estherwill street",
    status: "active",
  },
  {
    id: "3",
    name: "Agent 2",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08062345678",
    },
    address: "fege road",
    status: "inactive",
  },
  {
    id: "4",
    name: "Agent 3",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08061234567",
    },
    address: "Upper Iweka road plot 6574",
    status: "active",
  },
  {
    id: "5",
    name: "Agent 4",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08064321098",
    },
    address: "Main Market Onitsha",
    status: "inactive",
  },
  {
    name: "Agent 5",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 6",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08060987654",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 7",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 8",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 9",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 10",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 11",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 12",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 13",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 14",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 15",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 16",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 17",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 18",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 19",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 20",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 21",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 22",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 23",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "08061234567",
    status: "active",
  },
  {
    name: "Agent 24",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 25",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 26",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 27",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 28",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 29",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 30",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 31",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 32",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 33",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 34",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 35",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 36",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 37",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 38",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent 39",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent 40",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent A",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent B",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent C",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent D",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent E",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "08061234567",
    status: "active",
  },
  {
    name: "Agent F",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent G",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent H",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent I",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent J",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent K",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent L",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent M",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent N",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent O",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent P",
    contact: {
      "emekaignatius5@gmail.com": "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent Q",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent R",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
  {
    name: "Agent S",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "active",
  },
  {
    name: "Agent T",
    contact: {
      email: "emekaignatius5@gmail.com",
      phone: "08063456789",
    },
    address: "Awada, okiki street, flat 3 block 18",
    status: "inactive",
  },
];
export const PERSONAL_INFORMATION = [
  {
    title: "Name",
    entry: "Isaac Emperor",
  },
  {
    title: "E-mail Address",
    entry: "IsaacEmperor@gmail.com",
  },
  {
    title: "Phone Number",
    entry: "080-332-7264",
  },
];
export const ADDRESS_INFORMATION = [
  {
    title: "Address",
    entry: "No, 14 Agbero Road, Anambra",
  },
  {
    title: "Area Location",
    entry: "Mile 1-3",
  },
];
export const LOGIN_DETAILS = [
  {
    title: "User ID",
    entry: "AgentISCE",
  },
  {
    title: "Password",
    entry: "IsaacE2000",
  },
];
export const WAIVER_HISTORY = [
  {
    timeline: "Jan 31 - Feb 20",
    reason: "Car Repair",
    status: "active",
    generated_by: "Agent Emeka 1",
  },
  {
    timeline: "May 21 - June 1",
    reason: "Car Repair",
    status: "inactive",
    generated_by: "Agent Leo1",
  },
  {
    timeline: "Dec 31 - Jan 20",
    reason: "Car Repair",
    status: "inactive",
    generated_by: "Agent Divine1",
  },
  {
    timeline: "Oct 31 - Nov 20",
    reason: "Car Repair",
    status: "inactive",
    generated_by: "Agent Emeka 1",
  },
  {
    timeline: "Jan 31 - Feb 20",
    reason: "Car Repair",
    status: "active",
    generated_by: "Agent Emeka 1",
  },
  {
    timeline: "Jan 31 - Feb 20",
    reason: "Car Repair",
    status: "active",
    generated_by: "Agent Emeka 1",
  },
  {
    timeline: "Jan 31 - Feb 20",
    reason: "Car Repair",
    status: "inactive",
    generated_by: "Agent Emeka 1",
  },
  {
    timeline: "Jan 31 - Feb 20",
    reason: "Car Repair",
    status: "inactive",
    generated_by: "Agent Emeka 1",
  },
  {
    timeline: "Jan 31 - Feb 20",
    reason: "Car Repair",
    status: "inactive",
    generated_by: "Agent Emeka 1",
  },
  {
    timeline: "Jan 31 - Feb 20",
    reason: "Car Repair",
    status: "active",
    generated_by: "Agent Divine1",
  },
  {
    timeline: "May 15 - June 13",
    reason: "Car Repair",
    status: "active",
    generated_by: "Agent Leo1",
  },
];
export const LGA = [
  "Aguata",
  "Anambra East",
  "Anambra West",
  "Anaocha",
  "Awka North",
  "Awka South",
  "Ayamelum",
  "Dunukofia",
  "Ekwusigo",
  "Idemili North",
  "Idemili South",
  "Ihiala",
  "Njikoka",
  "Nnewi North",
  "Nnewi South",
  "Ogbaru",
  "Onitsha North",
  "Onitsha South",
  "Orumba North",
  "Orumba South",
  "Oyi",
];

export const API =
  process.env.BACKEND_URL ||
  "https://transpay-ondo-api-h63bp.ondigitalocean.app";
export const URLS = {
  activity: {
    all: "/api/activities",
  },
  "audit-trails": {
    all: "/api/audit-trails",
    vehicle: "/api/audit-trails/vehicles",
    user: "/api/audit-trails/users",
    single: "api/audit-trails",
  },
  admin: {
    all: "/api/admins",
    me: "/api/admins/me",
  },
  agent: {
    all: "/api/agents",
    me: "/api/agents/me",
  },
  green: {
    all: "/api/greenengine",
    me: "/api/greenengine/me",
    search: "/api/greenengine/search",
  },
  auth: {
    signin: {
      admin: "/api/user/login",
      agent: "/api/user/login",
    },
  },
  dashboard: {
    superadmin: {
      transaction_summary: "/api/superadmin-dashboard/transactions-summary",
      owing_summary: "/api/superadmin-dashboard/summary/owing",
      compliance_rate: "/api/superadmin-dashboard/compliance-rate",
      user_count: "/api/superadmin-dashboard/user-counts-by-role",
      vehicle_count_by_lga: "/api/superadmin-dashboard/vehicle-count-by-lga",
      lga_revenue_all: "/api/superadmin-dashboard/revenue-by-lga-all",
      vehicle_category_count:
        "/api/superadmin-dashboard/vehicle-category-counts",
      lga_revenue: "/api/superadmin-dashboard/lga-revenue",
      monthly_revenue_change:
        "/api/superadmin-dashboard/monthly-revenue-change",
    },
    default: "/api/dashboard",
    total_revenue_yearly: "/api/dashboard/total-year-revenue",
    total_revenue_monthly: "/api/dashboard/total-month-revenue",
    total_revenue_weekly: "/api/dashboard/total-week-revenue",
    total_revenue_daily: "/api/dashboard/total-day-revenue",
    net_total: "/api/dashboard/net-total",
    total_tracker_yearly: "/api/dashboard/total-trackers-revenue",
    activities_with_limit: "/api/dashboard/all-activities",
    blacklisted_admin: "/api/dashboard/blacklisted-admins",
    chart: "/api/dashboard/chart",
  },
  driver: {
    all: "/api/drivers",
    blacklist: "/api/drivers/blacklist", // add vehicle to blacklist
  },
  revenue: {
    stats: "/api/revenue/stats",
    report: "/api/revenue/report",
    total: "/api/revenue/total",
    custom: "/api/revenue/customRevenue",
    day: "/api/revenue/daily",
    week: "/api/revenue/weekly",
    month: "/api/revenue/monthly",
    year: "/api/revenue/yearly",
  },
  vehicle: {
    all: "/api/vehicles",
    blacklist: "/api/vehicles/blacklist", // add vehicle to blacklist
    search: "/api/vehicles/search", // add vehicle to blacklist
    asin: "/api/vehicles/verify", // verify vehicle using ASIN
    fareflex: "/api/vehicles/imei", // add fareflex to vehicle
    sticker: "/api/barcode/attach-vehicle", // add fareflex to vehicle
    request: "/api/sticker-requests/sticker-request", // sticker-request
    payment: "/api/vehicles/payment-history", // payment-history
  },
  settings: "/api/settings", // for add ${id} for single.
  tracker: {
    location: "/trackers/find",
    stat: "/stat/find",
  },
  transactions: {
    all: "+/api/transaction",
    "net-total": "/api/transaction/total-net",
    "total-revenue": "/api/transaction/total-revenue",
    "total-tracker": "/api/transaction/total-tracker",
  },
  group: {
    all: "/api/groups",
  },
  user: {
    all: "/api/user",
    admins: "/api/user/admins",
    agents: "/api/user/agents",
    create: "/api/user/create",
    delete: "/api/user/delete",
    me: "/api/user/me",
    one: "/api/user/{id}",
    update: "/api/user/update",
  },
  companies: {
    create: "/api/companies/create",
    update: "/api/companies/update",
    all: "/api/companies/all",
    admin_fetch: "/api/companies/fetch/all",
    add_vehicle: "/api/companies/assign-by-plate-numbers",
    remove_vehicle: "/api/companies/{vehicleId}/remove-from-company",
    delete: "/api/companies/delete",
    restore: "/api/companies/restore",
    one: "/api/companies/one/{id}",
    vehicles: "/api/companies/{companyId}/vehicles",
    company_total: "/api/audit-trails/companies/{userId}",
    audit_trails: "/api/audit-trails/company-created",
  },
  lga: {
    create: "/api/lga/create",
    users: "/api/lga/users/{id}",
    vehicles: "/api/lga/vehicles/{id}",
    scans: "/api/lga/scans/{id}",
  },
  agency: {
    create: "/api/agency/create",
    create_with_Admin: "/api/agency/create-with-admin",
    add_agent: "/api/agency/add-agent",
    all: "/api/agency/all",
    one: "/api/agency/one/{id}",
    agency_dashboard: "/api/agency/dashboard/{id}",
    one_agency_agent: "/api/agency/agents/{id}",
    one_agency_admin: "/api/agency/admin-user/{id}",
    one_agency_transactions: "/api/agency/transactions/{id}",
    admin_with_agency_id: "/api/agency/admin/{id}",
    update: "/api/agency/update/{id}",
    delete: "/api/agency/delete/{id}",
  },
  agency_agent: {
    search: "/api/agency-agent/search-vehicle",
    fund: "/api/agency-agent/initiate-funding",
    payment: "/api/agency-agent/mock-payment",
    transactions: "/api/agency-agent/transactions",
    dashboard: "/api/agency-agent/dashboard",
    discount: "/api/agency-agent/discount-info",
  },
};

export const TRACKER_BASE_URL =
  "https://api.gwgps12580.com/Ch_manage_controller/api";
export const BUS_IMAGE_SAMPLE =
  "https://images.unsplash.com/photo-1616792577902-f1d86383a21b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2803&q=80";
export const SLIDES = [
  <CarouselSlides
    key={1}
    desc="Accountability in a civilized society is the stepping stone to development and progressive environment"
    images="/ondo.png"
    author="Transpay"
    title="Ondo State"
  />,
];

export const PROPERTIES: IProperty[] = [
  {
    propertyId: "ABC123",
    ownerName: "John Doe",
    address: "123 Main Street",
    propertyType: "Residential",
    assessmentValue: 250000,
    taxRate: 0.02,
    taxAmount: 5000,
    paymentDueDate: "2023-12-31",
    isPaid: false,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "DEF456",
    ownerName: "Jane Smith",
    address: "456 Oak Avenue",
    propertyType: "Commercial",
    assessmentValue: 500000,
    taxRate: 0.03,
    taxAmount: 15000,
    paymentDueDate: "2023-11-15",
    isPaid: true,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "GHI789",
    ownerName: "Bob Johnson",
    address: "789 Pine Street",
    propertyType: "Residential",
    assessmentValue: 300000,
    taxRate: 0.025,
    taxAmount: 7500,
    paymentDueDate: "2023-10-31",
    isPaid: false,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "JKL012",
    ownerName: "Alice Williams",
    address: "12 Cedar Avenue",
    propertyType: "Commercial",
    assessmentValue: 700000,
    taxRate: 0.035,
    taxAmount: 24500,
    paymentDueDate: "2023-09-15",
    isPaid: true,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "MNO345",
    ownerName: "Charlie Brown",
    address: "345 Elm Street",
    propertyType: "Residential",
    assessmentValue: 400000,
    taxRate: 0.03,
    taxAmount: 12000,
    paymentDueDate: "2023-08-31",
    isPaid: false,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "PQR678",
    ownerName: "Eva Davis",
    address: "678 Maple Avenue",
    propertyType: "Commercial",
    assessmentValue: 600000,
    taxRate: 0.04,
    taxAmount: 24000,
    paymentDueDate: "2023-07-15",
    isPaid: true,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "STU901",
    ownerName: "David Wilson",
    address: "901 Oak Street",
    propertyType: "Residential",
    assessmentValue: 350000,
    taxRate: 0.028,
    taxAmount: 9800,
    paymentDueDate: "2023-06-30",
    isPaid: false,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "VWX234",
    ownerName: "Grace Taylor",
    address: "234 Birch Avenue",
    propertyType: "Commercial",
    assessmentValue: 800000,
    taxRate: 0.045,
    taxAmount: 36000,
    paymentDueDate: "2023-05-15",
    isPaid: true,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "YZA567",
    ownerName: "Frank Miller",
    address: "567 Pine Street",
    propertyType: "Residential",
    assessmentValue: 450000,
    taxRate: 0.032,
    taxAmount: 14400,
    paymentDueDate: "2023-04-30",
    isPaid: false,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
  {
    propertyId: "BCD890",
    ownerName: "Helen Clark",
    address: "890 Elm Avenue",
    propertyType: "Commercial",
    assessmentValue: 900000,
    taxRate: 0.05,
    taxAmount: 45000,
    paymentDueDate: "2023-03-15",
    isPaid: true,
    paymentRecords: [
      {
        paymentDate: "2023-01-15",
        amountPaid: 2000,
      },
      {
        paymentDate: "2023-02-28",
        amountPaid: 3000,
      },
      {
        paymentDate: "2023-04-15",
        amountPaid: 2500,
      },
    ],
  },
];

export const TRANSPAY = 0.1;
export const AIRS = 0.9;

export const FNTC = new Intl.NumberFormat("en-NG", {
  currency: "NGN",
  style: "currency",
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value);
};

export const DURATIONREVENUESUMMARY: IDurationSummary[] = [
  {
    duration: "YEARLY",
    totalDurationTricycleRev: 1000,
    totalDurationSmallShuttleRev: 2000,
    totalDurationBigShuttleRev: 3000,
    totalDurationTrackerRev: 1000,
    lgaRevenueSummary: [
      {
        lga: "LGA 1",
        totalRev: 200,
        tricycleRev: 300,
        smallshuttleRev: 400,
        bigshuttleRev: 400,
        trackerRev: 400,
      },
      {
        lga: "LGA 2",
        totalRev: 200,
        tricycleRev: 300,
        smallshuttleRev: 400,
        bigshuttleRev: 400,
        trackerRev: 400,
      },
      {
        lga: "LGA 3",
        totalRev: 200,
        tricycleRev: 300,
        smallshuttleRev: 400,
        bigshuttleRev: 400,
        trackerRev: 400,
      },
      {
        lga: "LGA 4",
        totalRev: 200,
        tricycleRev: 300,
        smallshuttleRev: 400,
        bigshuttleRev: 400,
        trackerRev: 400,
      },
    ],
  },
];
export const ALLOWED_VEHICLE_FIELDS = [
  "id",
  "vehicle_id",
  "color",
  "category",
  "plateNumber",
  "image",
  "user_role",
  "user_id",
  "blacklisted",
  "current_driver",
  "status",
  "deleted",
  "vehicle_type",
  "vin",
  "barcode_string",
  "owners_phone_number",
  "owners_name",
  "tracker_id",
  "createdAt",
  "updatedAt",
];

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://transpay.vercel.app"
    : "http://localhost:8726";

export enum TRANSACTION_TYPE {
  all = "ALL",
  daily = "DAILY_FEES",
  tracker = "TRACKER_FEES",
}
export enum WAIVER_STATUS {
  approved = "APPROVED",
  declined = "DECLINED",
  pending = "PENDING",
  cancelled = "CANCELLED",
}
export const LANDING_CARD_CONTENTS: {
  title: string;
  description: string;
}[] = [
  {
    title: "Efficient Revenue Collection",
    description:
      "Our advanced system automates the revenue collection process, reducing human error and ensuring accurate data recording.",
  },
  {
    title: "On and Off Activities",
    description:
      "We detect on and off-road activities using Fare Flex devices.",
  },
  {
    title: "User-Friendly Interface",
    description:
      "Transpay offers an interactive interface for both government officials and vehicle operators, making it easy to manage and monitor transactions.",
  },
  {
    title: "Secure Transactions",
    description:
      "Transpay ensures that all transactions are safe and secure, using security protocols to protect sensitive information.",
  },
];
export const HOW_IT_WORKS: {
  title: string;
  description: string;
}[] = [
  {
    title: " Fare Flex Device Installation",
    description:
      "Each commercial vehicle is equipped with a state-of-the-art Fare Flex Device.",
  },
  {
    title: "Revenue Generation",
    description:
      "Transpay processes the data, calculates the revenue, and facilitates  payment processing.",
  },
  {
    title: "Monitoring and Reporting",
    description:
      "Authorities can monitor the entire process and generate detailed reports for auditing and analysis.",
  },
];
export const DATE_RANGE = [
  {
    title: "All Time Total",
    description: "All Time",
    type: "TOTAL",
  },
  {
    title: "Yearly Total",
    description: "Year Till Date",
    type: "YEAR",
  },
  {
    title: "Monthly Total",
    description: "Month Till Date",
    type: "MONTH",
  },
  {
    title: "Weekly Total",
    description: "Week Till Date",
    type: "WEEK",
  },
  {
    title: "Daily Total",
    description: "Today",
    type: "DAY",
  },
] as const;

export const COLORS = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#7FFF00", // Chartreuse
  "#00FF00", // Green
  "#00FF7F", // Spring Green
  "#00FFFF", // Cyan
  "#007FFF", // Azure
  "#0000FF", // Blue
  "#7F00FF", // Violet
  "#9B30FF", // Purple
  "#9400D3", // Dark Violet
  "#4B0082", // Indigo
  "#8B0000", // Dark Red
  "#FF1493", // Pink
  "#FF69B4", // Hot Pink
  "#FFB6C1", // Light Pink
  "#FFD700", // Gold
  "#ADFF2F", // Green Yellow
  "#00FA9A", // Medium Spring Green
  "#1E90FF", // Dodger Blue
  "#8A2BE2", // Blue Violet
  "#DDA0DD", // Plum
];

export const vehicleTypeData = [
  { name: "TRICYCLE", value: 2000 },
  { name: "BUS", value: 2400 },
  { name: "TAXI", value: 2400 },
  { name: "MOTOR_CYCLE", value: 1000 },
];

export const VEHICLE_CATEGORIES = ["TRICYCLE", "BUS", "TAXI", "MOTOR_CYCLE"];
export const VEHICLE_CATEGORIES_PRICE = [
  { name: "TRICYCLE", price: 1000 },
  { name: "BUS", price: 2400 },
  { name: "TAXI", price: 2400 },
  { name: "MOTOR_CYCLE", price: 3000 },
];

export enum VehicleValues {
  TRICYCLE = 333,
  BUS = 400,
  TAXI = 400,
  MOTOR_CYCLE = 500,
}

export const STICKER_FEE = 500;

export const WEEKLY = [
  {
    name: "Week 1",
    value: "week1",
  },
  {
    name: "Week 2",
    value: "week2",
  },
  {
    name: "Week 3",
    value: "week3",
  },
  {
    name: "Week 4",
    value: "week4",
  },
];
export const MONTHLY = [
  {
    name: "January",
    value: "january",
  },
  {
    name: "February",
    value: "february",
  },
  {
    name: "March",
    value: "march",
  },
  {
    name: "April",
    value: "april",
  },
  {
    name: "May",
    value: "may",
  },
  {
    name: "June",
    value: "june",
  },
  {
    name: "July",
    value: "july",
  },
  {
    name: "August",
    value: "august",
  },
  {
    name: "September",
    value: "september",
  },
  {
    name: "October",
    value: "october",
  },
  {
    name: "November",
    value: "november",
  },
  {
    name: "December",
    value: "december",
  },
];
export const ADMIN_ROLES: string[] = [
  Role.SUPERADMIN,
  Role.ADMIN,
  Role.AGENCY_ADMIN,
];
export const READONLY_ADMIN_ROLES: string[] = [
  Role.SUPERADMIN,
  Role.ADMIN,
  Role.ODIRS_ADMIN,
  Role.AGENCY_ADMIN,
];
export const SUPER_ADMIN_ROLES: string[] = [Role.SUPERADMIN];

export const GENERAL_ACCESS = [Role.SUPERADMIN];

export const freqArray = ["all", "yearly", "monthly", "weekly", "daily"];

export const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
export const HAS_COMPANY_ACCESS = [Role.SUPERADMIN, Role.ADMIN];

export const PIN_ONE = ["150519", "785675"];
export const PIN_TWO = ["1505", "7856"];

export const NIGERIAN_STATES: Record<string, string> = {
  AB: "Abia",
  AD: "Adamawa",
  AK: "Akwa Ibom",
  AN: "Anambra",
  BA: "Bauchi",
  BY: "Bayelsa",
  BE: "Benue",
  BO: "Borno",
  CR: "Cross River",
  DE: "Delta",
  EB: "Ebonyi",
  ED: "Edo",
  EK: "Ekiti",
  EN: "Enugu",
  GO: "Gombe",
  IM: "Imo",
  JI: "Jigawa",
  KD: "Kaduna",
  KN: "Kano",
  KT: "Katsina",
  KE: "Kebbi",
  KO: "Kogi",
  KW: "Kwara",
  LA: "Lagos",
  NA: "Nasarawa",
  NI: "Niger",
  OG: "Ogun",
  ON: "Ondo",
  OS: "Osun",
  OY: "Oyo",
  PL: "Plateau",
  RI: "Rivers",
  SO: "Sokoto",
  TA: "Taraba",
  YO: "Yobe",
  ZA: "Zamfara",
  FC: "Federal Capital Territory",
};
