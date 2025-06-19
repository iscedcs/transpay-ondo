import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addDays,
  addHours,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  format,
  getHours,
  getWeek,
  getYear,
  isBefore,
  isSunday,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subYears,
} from "date-fns";
import { PaymentNotification } from "@prisma/client";
import { VehicleValues } from "./const";
import { Address } from "@/actions/users";
import { VehicleFee } from "@/actions/lga";
import { Vehicle } from "@/actions/vehicles";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gupn(objects: Record<string, any>[]): string[] {
  const uniquePropertyNames: string[] = [];

  for (const obj of objects) {
    for (const propertyName in obj) {
      if (!uniquePropertyNames.includes(propertyName)) {
        uniquePropertyNames.push(propertyName);
      }
    }
  }

  return uniquePropertyNames;
}

export function getInitials(name: string): string {
  const words = name.trim().split(" ");

  if (words.length >= 2) {
    const firstInitial = words[0].charAt(0);
    const secondInitial = words[1].charAt(0);
    return `${firstInitial}${secondInitial}`;
  }

  return words[0].charAt(0);
}

/**
 * Takes in a date string and formats it to return a DD-MM-YYYY format date
 * @param {string} inputDate
 * @returns {string}
 */

export function formatDate(inputDate: string): string {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so add 1
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}

/**
 * Takes a number and returns an Array of numbers matching the star ratings
 * @param {number} number
 * @returns {any}
 */
export function cNTA(number: number): number[] {
  if (number < 0 || number > 5) {
    throw new Error("Input number must be between 0 and 5");
  }

  const array: number[] = [0, 0, 0, 0, 0];

  for (let i = 0; i < 5; i++) {
    if (number >= 1) {
      array[i] = 1;
      number -= 1;
    } else if (number > 0) {
      array[i] = number;
      break;
    }
  }

  return array;
}

/**
 * Checks if a string is a valid UUID
 * @param {string} input
 * @returns {boolean}
 */
export function isUUID(input: string): boolean {
  const uuidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidPattern.test(input);
}

/**
 * if string is 13 digits number, then its a barcode id
 * @param {string} str
 * @returns {boolean}
 */
export function isBarcodeId(str: string): boolean {
  const formatRegex = /^\d{13}$/;
  return formatRegex.test(str);
}

/**
 * Description
 * @param {string} text
 * @returns {any}
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric characters
    .replace(/--+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-|-$/g, ""); // Remove leading and trailing hyphens
}

export function unslugify(slug: string): string {
  const words = slug.split("-");
  const final = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return final.join(" ");
}
export function transformTransactionsToMonthsData(
  transactions: ITransaction[]
): { name: string; total: number }[] {
  const totalByMonth: { [month: string]: number } = {};

  transactions.forEach((transaction: ITransaction) => {
    const transactionDate = new Date(transaction.createdAt);
    const monthName = transactionDate.toLocaleString("en-US", {
      month: "short",
    });

    // Initialize total for the month if not present
    if (!totalByMonth[monthName]) {
      totalByMonth[monthName] = 0;
    }

    // Add transaction amount to the total for the month
    totalByMonth[monthName] += Number(transaction.amount);
  });

  // Convert totalByMonth object to the required format
  const transformedData: { name: string; total: number }[] = Object.entries(
    totalByMonth
  ).map(([month, total]) => ({
    name: month,
    total,
  }));

  return transformedData;
}
export function transformTransactionsToYearsData(
  transactions: ITransaction[]
): { name: string; total: number }[] {
  const totalByYear: { [year: string]: number } = {};

  transactions.forEach((transaction: ITransaction) => {
    const transactionDate = new Date(transaction.createdAt);
    const year = transactionDate.getFullYear().toString(); // Get the full year

    // Initialize total for the year if not present
    if (!totalByYear[year]) {
      totalByYear[year] = 0;
    }

    // Add transaction amount to the total for the year
    totalByYear[year] += Number(transaction.amount);
  });

  // Convert totalByYear object to the required format
  const transformedData: { name: string; total: number }[] = Object.entries(
    totalByYear
  ).map(([year, total]) => ({
    name: year,
    total,
  }));

  return transformedData;
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffInDays = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((diffInDays + startOfYear.getDay() + 1) / 7);
  return weekNumber;
}
// export function transformTransactionsToWeeksData(
// 	transactions: ITransaction[]
// ): { name: string; total: number }[] {
// 	const totalByWeek: { [week: string]: number } = {};

// 	transactions.forEach((transaction: ITransaction) => {
// 		const transactionDate = new Date(transaction.createdAt);
// 		const weekNumber = getWeekNumber(transactionDate);
// 		const weekKey = `Week ${weekNumber}`;
// 		if (!totalByWeek[weekKey]) {
// 			totalByWeek[weekKey] = 0;
// 		}
// 		totalByWeek[weekKey] += transaction.amount;
// 	});
// 	const transformedData: { name: string; total: number }[] = Object.entries(
// 		totalByWeek
// 	).map(([week, total]) => ({
// 		name: week,
// 		total,
// 	}));
// 	return transformedData;
// }

export function transformTransactionsToWeeksData(
  transactions: ITransaction[]
): { name: string; total: number }[] {
  const totalByWeek: { [weekKey: string]: number } = {};

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.createdAt);

    // Get the ISO week number (1-52/53) considering year rollover
    const weekNumber = getWeekNumber(transactionDate);
    const year = transactionDate.getFullYear().toString();

    // Combine year and week for unique key
    const weekKey = `week ${weekNumber}-${year}`;

    // Initialize total for the week if not present
    if (!totalByWeek[weekKey]) {
      totalByWeek[weekKey] = 0;
    }

    // Add transaction amount to the total for the week
    totalByWeek[weekKey] += Number(transaction.amount);
  });

  // Convert totalByWeek object to the required format
  const transformedData: { name: string; total: number }[] = Object.entries(
    totalByWeek
  ).map(([weekKey, total]) => ({
    name: weekKey,
    total,
  }));

  return transformedData;
}

// export function transformTransactionsToDaysData(
// 	transactions: ITransaction[]
// ): { name: string; total: number }[] {
// 	const totalByDay: { [day: string]: number } = {};

// 	transactions.forEach((transaction: ITransaction) => {
// 		const transactionDate = new Date(transaction.createdAt);
// 		// Using the transaction date directly as the key
// 		const dayKey = format(new Date(transactionDate), 'dd-mm');

// 		if (!totalByDay[dayKey]) {
// 			totalByDay[dayKey] = 0;
// 		}
// 		totalByDay[dayKey] += transaction.amount;
// 	});

// 	const transformedData: { name: string; total: number }[] = Object.entries(
// 		totalByDay
// 	).map(([day, total]) => ({
// 		name: day,
// 		total,
// 	}));

// 	return transformedData;
// }

// export function transformTransactionsToDaysData(
// 	transactions: ITransaction[]
// ): { name: string; total: number }[] {
// 	// 1. Get the range of days
// 	const earliestTransaction = transactions.reduce((min, t) =>
// 		new Date(t.createdAt) < new Date(min.createdAt) ? t : min
// 	);
// 	const latestTransaction = transactions.reduce((max, t) =>
// 		new Date(t.createdAt) > new Date(max.createdAt) ? t : max
// 	);

// 	let currentDate = startOfDay(new Date(earliestTransaction.createdAt));
// 	const endDate = startOfDay(new Date(latestTransaction.createdAt));

// 	// 2. Initialize the daily data
// 	const dailyData: { name: string; total: number }[] = [];
// 	while (currentDate <= endDate) {
// 		dailyData.push({
// 			name: format(currentDate, 'MMM d'), // Format like 'Mar 10'
// 			total: 0,
// 		});
// 		currentDate = addDays(currentDate, 1);
// 	}

// 	// 3. Aggregate transactions into daily buckets
// 	transactions.forEach((t) => {
// 		const transactionDate = startOfDay(new Date(t.createdAt));
// 		const transactionDateStr = format(transactionDate, 'MMM d');
// 		const matchingDay = dailyData.find(
// 			(d) => d.name === transactionDateStr
// 		);
// 		if (matchingDay) {
// 			matchingDay.total += Number(t.amount);
// 		}
// 	});

// 	return dailyData;
// }

export function transformTransactionsToDaysData(
  transactions: ITransaction[]
): { name: string; total: number }[] {
  // 1. Get the range of days (handle empty transactions)
  const earliestTransaction =
    transactions.length > 0
      ? transactions.reduce((min, t) =>
          new Date(t.createdAt) < new Date(min.createdAt) ? t : min
        )
      : new Date(); // Use today's date if no transactions

  const latestTransaction =
    transactions.length > 0
      ? transactions.reduce((max, t) =>
          new Date(t.createdAt) > new Date(max.createdAt) ? t : max
        )
      : new Date(); // Use today's date if no transactions

  //@ts-ignore
  let currentDate = startOfDay(earliestTransaction);
  //@ts-ignore
  const endDate = startOfDay(latestTransaction);

  // 2. Initialize the daily data (ensure at least one day)
  const dailyData: { name: string; total: number }[] = [
    { name: format(currentDate, "MMM d"), total: 0 },
  ];

  while (currentDate <= endDate) {
    currentDate = addDays(currentDate, 1);
    dailyData.push({ name: format(currentDate, "MMM d"), total: 0 });
  }

  // 3. Aggregate transactions into daily buckets (handle empty transactions)
  if (transactions.length > 0) {
    transactions.forEach((t) => {
      const transactionDate = startOfDay(new Date(t.createdAt));
      const transactionDateStr = format(transactionDate, "MMM d");
      const matchingDay = dailyData.find((d) => d.name === transactionDateStr);
      if (matchingDay) {
        matchingDay.total += Number(t.amount);
      }
    });
  }

  return dailyData;
}

export function transformTransactionsToHoursData(
  transactions: ITransaction[]
): { name: string; total: number }[] {
  const hourlyData: { name: string; total: number }[] = [];
  // 1. Get the start of the day from the earliest transaction
  if (transactions.length !== 0) {
    const earliestTransaction = transactions.reduce((min, t) =>
      new Date(t.createdAt) < new Date(min.createdAt) ? t : min
    );
    const startOfChartDay = startOfDay(new Date(earliestTransaction.createdAt));

    // 2. Initialize the hourly data
    for (let i = 0; i < 24; i++) {
      const hourStart = addHours(startOfChartDay, i);
      hourlyData.push({
        name: format(hourStart, "h a"), // Format like '9 AM', '10 AM', etc.
        total: 0,
      });
    }

    // 3. Aggregate transactions into hourly buckets
    transactions.forEach((t) => {
      const transactionHour = getHours(new Date(t.createdAt));
      hourlyData[transactionHour].total += Number(t.amount);
    });

    return hourlyData;
  }

  return hourlyData;
}

export function isUuid(input: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(input);
}

export function isURL(str: string): boolean {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  return urlRegex.test(str);
}

export const checkEnvironment = () => {
  let base_url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8726"
      : "https://transpay.vercel.app/";

  return base_url;
};

export function generateRandomLocation(): {
  lat: number;
  lng: number;
} {
  const minlat: number = 6.0233;
  const maxlat: number = 6.2322;
  const minLng: number = 7.0733;
  const maxLng: number = 7.2822;

  // Generate random lat and lng
  const lat: number = parseFloat(
    (Math.random() * (maxlat - minlat) + minlat).toFixed(6)
  );
  const lng: number = parseFloat(
    (Math.random() * (maxLng - minLng) + minLng).toFixed(6)
  );

  return { lat, lng };
}

export function generateRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateTransactionTotals(transactions: ITransaction[]): {
  totalRevenue: number;
  totalDailyFees: number;
  totalTrackerFees: number;
} {
  let totalRevenue = 0;
  let totalDailyFees = 0;
  let totalTrackerFees = 0;

  transactions.forEach((transaction: ITransaction) => {
    totalRevenue += Number(transaction.amount);

    if (transaction.transaction_type === "DAILY_FEES") {
      totalDailyFees += Number(transaction.amount);
    } else if (transaction.transaction_type === "TRACKER_FEES") {
      totalTrackerFees += Number(transaction.amount);
    }
  });

  return {
    totalRevenue,
    totalDailyFees,
    totalTrackerFees,
  };
}

export function calculatePercentageDifference(
  lastYearTotals: number,
  newYearTotals: number
): number {
  if (lastYearTotals === 0) {
    return 0;
  }

  return ((newYearTotals - lastYearTotals) / lastYearTotals) * 100;
}

export function filterTransactionsByDateRange(
  transactions: ITransaction[],
  startDate: Date,
  endDate: Date
): ITransaction[] {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.createdAt);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

// Set last year dynamically
export const LAST_YEAR_startDate = subYears(startOfYear(new Date()), 1); // Start of last year
export const LAST_YEAR_endDate = new Date(
  startOfYear(new Date()).getTime() - 1
);
export const NEW_YEAR_startDate = startOfYear(new Date()); // Start of current year

export const createDataForTable = (transactions: ITransaction[]) => {
  const yearlyTotals: { [year: string]: number } = {};

  transactions.forEach((transaction: ITransaction) => {
    const transactionDate = new Date(transaction.createdAt);
    const transactionYear = transactionDate.getFullYear().toString();

    if (!yearlyTotals[transactionYear]) {
      yearlyTotals[transactionYear] = 0;
    }

    yearlyTotals[transactionYear] += Number(transaction.amount);
  });

  const dataForTable = Object.entries(yearlyTotals).map(([year, total]) => ({
    name: year,
    total,
  }));

  return dataForTable;
};
interface DaysOwedObject {
  createdAt: string;
  amount: string;
  transaction_type: string;
}

export function generateDaysOwedArray(
  dateSupplied: Date,
  fee: "200" | "250" | "300"
): DaysOwedObject[] {
  const presentDate = new Date();
  const timeDiff = Math.ceil(
    (dateSupplied.getTime() - presentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysOwedArray: DaysOwedObject[] = [];

  for (let i = 0; i <= -timeDiff; i++) {
    const transactionDate = new Date(presentDate);
    transactionDate.setDate(presentDate.getDate() + timeDiff + i);

    const daysOwedObject: DaysOwedObject = {
      createdAt: transactionDate.toISOString().split("T")[0],
      amount: fee, // Replace with the actual amount
      transaction_type: "DAILY_FEES",
    };

    daysOwedArray.push(daysOwedObject);
  }
  return daysOwedArray;
}

export function compareDates(
  date1: string,
  date2: string
): "daily" | "weekly" | "monthly" | "yearly" | "hourly" {
  const parsedDate1 = new Date(date1);
  const parsedDate2 = new Date(date2);

  // Calculate differences using date-fns for accuracy and convenience
  const daysDifference = differenceInDays(parsedDate2, parsedDate1);
  const weeksDifference = differenceInWeeks(parsedDate2, parsedDate1);
  const monthsDifference = differenceInMonths(parsedDate2, parsedDate1);
  const yearsDifference = differenceInYears(parsedDate2, parsedDate1);

  if (daysDifference < 2) {
    return "hourly";
  } else if (daysDifference <= 31) {
    return "daily";
  } else if (weeksDifference <= 16) {
    return "weekly";
  } else if (monthsDifference <= 12) {
    return "monthly";
  } else {
    return "yearly";
  }
}

export function isEmpty(value: string | any[] | object): boolean {
  if (typeof value === "string") {
    return value.trim() === "";
  } else if (Array.isArray(value)) {
    return value.length === 0;
  } else if (typeof value === "object" && value !== null) {
    return Object.keys(value).length === 0;
  } else {
    throw new Error("Unsupported type for isEmpty check");
  }
}

export const isOwing = (date: string) =>
  isBefore(addDays(new Date(date), 1), new Date());

export function formatChartData(
  transactions: PaymentNotification[],
  filterType: FilterType
): ChartDataPoint[] {
  const groupedData = transactions.reduce((acc, transaction) => {
    let key: string;
    const date = new Date(transaction.paymentDate);

    switch (filterType) {
      case "day":
        key = format(startOfDay(date), "yyyy-MM-dd");
        break;
      case "week":
        key = `Week ${getWeek(date)}`;
        break;
      case "month":
        key = format(startOfMonth(date), "MMM yyyy");
        break;
      case "year":
        key = getYear(date).toString();
        break;
    }

    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += Number(transaction.amount);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(groupedData).map(([name, total]) => ({
    name,
    total: Number(total.toFixed(2)), // Ensure we don't have too many decimal places
  }));
}

export function formatCurrency(value: number): string {
  let formattedValue: string;

  if (value >= 1_000_000_000) {
    // Format to billions (B)
    formattedValue = `₦${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    // Format to millions (M)
    formattedValue = `₦${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    // Format to thousands (K)
    formattedValue = `₦${(value / 1_000).toFixed(2)}K`;
  } else {
    // Format for values less than 1,000
    formattedValue = `₦${value.toFixed(2)}`;
  }

  return formattedValue;
}

export function getNextPaymentDate(
  cvofBalance: number,
  cvofOwing: number,
  vehicleCategory: keyof typeof VehicleValues
): Date {
  const today = new Date();
  let nextPaymentDate = new Date(today);

  // Get the fee amount for the vehicle category
  const dailyFee = VehicleValues[vehicleCategory];

  // console.log({ cvofBalance, cvofOwing, vehicleCategory, dailyFee });

  if (cvofOwing > 0) {
    // Vehicle is owing, calculate how many days in the past
    const daysOwing = Math.floor(cvofOwing / dailyFee);
    nextPaymentDate = subDays(today, daysOwing); // Set to past date

    // Skip Sundays
    while (isSunday(nextPaymentDate)) {
      nextPaymentDate = subDays(nextPaymentDate, 1);
    }
  } else if (cvofBalance > 0) {
    // Vehicle has paid, calculate how many days into the future
    const daysPaid = Math.floor(cvofBalance / dailyFee);
    nextPaymentDate = addDays(today, daysPaid); // Set to future date

    // Skip Sundays
    while (isSunday(nextPaymentDate)) {
      nextPaymentDate = addDays(nextPaymentDate, 1);
    }
  }
  // console.log(nextPaymentDate, "PAYMENT DATE");
  return nextPaymentDate;
}

export const getRevenueType = (name: string) => {
  const revenueTypes = [
    { keyword: "CVOF", aliases: ["Commercial Vehicle Operational"] },
    { keyword: "FAREFLEX", aliases: ["Fair Flex"] },
    {
      keyword: "DEVICE",
      aliases: ["Device", "Device Maintenance", "Device Installation"],
    },
  ];

  const upperName = name.toUpperCase();

  for (const type of revenueTypes) {
    if (type.aliases.some((alias) => upperName.includes(alias.toUpperCase()))) {
      return type.keyword;
    }
  }

  return "OTHERS";
};
// Utility function to safely convert a value to uppercase
export const safeToUpperCase = (value: any): string | undefined => {
  if (typeof value === "string" && value.trim() !== "") {
    return value.toUpperCase();
  }
  return undefined;
};

// Utility function to safely handle optional fields
export const safeString = (value: any): string => {
  return typeof value === "string" ? value : "";
};

// Utility function to transform phone number format
export const transformPhoneNumber = (
  phone: string | undefined
): string | undefined => {
  if (!phone || typeof phone !== "string") return undefined;
  if (phone.startsWith("+234")) {
    return "0" + phone.slice(4); // e.g., +2348121075147 -> 08121075147
  }
  return phone;
};
export const formatAddress = (
  address: {
    TEXT?: string;
    CITY?: string;
    STATE?: string;
    COUNTRY?: string;
    LGA?: string;
    UNIT?: string;
    POSTAL_CODE?: string;
  } | null
): string => {
  if (!address) return "No Address Provided";

  const { TEXT, CITY, STATE, COUNTRY, LGA, UNIT, POSTAL_CODE } = address;
  const addressParts = [
    TEXT,
    UNIT,
    LGA,
    CITY,
    STATE,
    COUNTRY,
    POSTAL_CODE,
  ].filter((part) => part && part.trim() !== "");
  return addressParts.length > 0 ? addressParts.join(", ") : "N/A";
};

export function formatRoleName(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function parseAddress(addressString: string | null): Address | null {
  if (!addressString) return null;

  try {
    return JSON.parse(addressString) as Address;
  } catch {
    return null;
  }
}

export function parseAddressExtended(addressString: string | null): {
  text?: string;
  lga?: string;
  city?: string;
  state?: string;
  unit?: string;
  country?: string;
  postal_code?: string;
} {
  if (!addressString) return {};

  try {
    const parsed = JSON.parse(addressString);
    return {
      text: parsed.TEXT,
      lga: parsed.LGA,
      city: parsed.CITY,
      state: parsed.STATE,
      unit: parsed.UNIT,
      country: parsed.COUNTRY,
      postal_code: parsed.POSTAL_CODE,
    };
  } catch (error) {
    console.error("Error parsing address:", error);
    return {};
  }
}

export const formatFees = (fees: VehicleFee[]) => {
  if (!Array.isArray(fees) || fees.length === 0) return "No fees set";

  return fees
    .map((fee) => `${fee.vehicleCategory}: ₦${fee.fee.toLocaleString()}`)
    .join(", ");
};

export function formatVehicleStatus(status: Vehicle["status"]): string {
  const statusMap = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended",
    PENDING: "Pending",
  };
  return statusMap[status] || status;
}

export function getStatusColor(
  status: Vehicle["status"]
): "default" | "secondary" | "destructive" | "outline" {
  const colorMap = {
    ACTIVE: "default" as const,
    INACTIVE: "outline" as const,
    SUSPENDED: "destructive" as const,
    PENDING: "outline" as const,
  };
  return colorMap[status] || "outline";
}

export function formatCurrencyFull(amount: string | number): string {
  const numAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(numAmount);
}