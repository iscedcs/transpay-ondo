import { format, subMonths } from "date-fns";
import { API, URLS } from "../const";
import { getSSession } from "../get-data";

export const getRevenueStats = async (
     start?: string,
     end?: string,
     type?: "DAILY_FEES" | "ALL" | "TRACKER_FEES",
) => {
     const session = await getSSession();
     const headers = {
          "Content-Type": "application/json",
          "api-secret": process.env.API_SECRET || "",
          Authorization: `Bearer ${session.access_token}`,
     };
     const today = new Date();
     const oneMonthAgo = subMonths(today, 1);

     const url = `${API}${
          type === "ALL"
               ? URLS.transactions["net-total"]
               : type === "DAILY_FEES"
                 ? URLS.transactions["total-revenue"]
                 : URLS.transactions["total-tracker"]
     }?startDate=${start ?? format(oneMonthAgo, "yyyy-MM-dd")}&endDate=${
          end ?? format(today, "yyyy-MM-dd")
     }`;
     const res = await fetch(url, { headers, cache: "no-store" });
     const result = await res.json();
     if (!res.ok) return undefined;

     const total: number = result.data;
     return total;
};

export const getDashboardTotalRevenue = async (
  startDate?: string,
  endDate?: string
) => {
  try {
    const session = await getSSession();
    const headers = {
      "Content-Type": "application/json",
      "api-secret": process.env.API_SECRET || "",
      Authorization: `Bearer ${session.access_token}`,
    };
    const url = `${API}${URLS.transactions["total-revenue"]}?startDate=${startDate}&endDate=${endDate}`;
    const res = await fetch(url, { headers, cache: "no-store" });
    const result = await res.json();
    if (!result.status) {
      return undefined;
    }
    return result.data;
  } catch (error: any) {
    return undefined;
  }
};

export const getDashboardTotalTracker = async (
  startDate: string,
  endDate: string
) => {
  try {
    const session = await getSSession();
    const headers = {
      "Content-Type": "application/json",
      "api-secret": process.env.API_SECRET || "",
      Authorization: `Bearer ${session.access_token}`,
    };
    const url = `${API}${URLS.transactions["total-tracker"]}?startDate=${startDate}&endDate=${endDate}`;
    const res = await fetch(url, { headers, cache: "no-store" });
    const result = await res.json();

    if (!result.status) {
      return undefined;
    }

    return result.data;
  } catch (error: any) {
    return undefined;
  }
};

export const getTotalRevenue = async (
     type: "TOTAL" | "YEAR" | "MONTH" | "WEEK" | "DAY" | "CUSTOM",
     startDate?: string,
     endDate?: string,
): Promise<number> => {
     try {
          const session = await getSSession();
          const headers = {
               "Content-Type": "application/json",
               "api-secret": process.env.API_SECRET || "",
               Authorization: `Bearer ${session.access_token}`,
          };

          //@ts-ignore
          let url = `${API}${URLS.revenue[type.toLowerCase()]}`;

          if (type === "CUSTOM" && startDate && endDate) {
               url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
          }

          const res = await fetch(url, { headers, cache: "no-store" });
          const result = await res.json();

          let data = 0;
          if (result.data) {
               switch (type) {
                    case "TOTAL":
                         data = result.data.totalRevenue;
                         break;
                    case "YEAR":
                         data = result.data.yearlyRevenue;
                         break;
                    case "MONTH":
                         data = result.data.monthlyRevenue;
                         break;
                    case "WEEK":
                         data = result.data.weeklyRevenue;
                         break;
                    case "DAY":
                         data = result.data.dailyRevenue;
                         break;
                    default:
                         data = Number(result.data) || 0;
               }
          }

          if (!result.status) {
               return 0;
          }

          return data;
     } catch (error: any) {
          return 0;
     }
};
