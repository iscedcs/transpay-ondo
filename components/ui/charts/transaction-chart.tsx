"use client";
import { getPaymentTotalsOld } from "@/actions/payment-notification";
import { formatCurrency } from "@/lib/utils";
import {
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfDay,
  endOfHour,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScrollArea, ScrollBar } from "../scroll-area";

export function AllTransactionChart() {
  const [isMounted, setIsMounted] = useState(false);
  const [allTotals, setAllTotals] = useState<ChartDataPoint[]>([]);
  const allTimeHistory = eachYearOfInterval({
    start: new Date("2024-11-01"),
    end: new Date(),
  });

  useEffect(() => {
    setIsMounted(true);
    const fetchAllTotal = async () => {
      const totals = await Promise.all(
        allTimeHistory.map(async (all) => {
          const total = await getPaymentTotalsOld(all, all);
          return {
            name: format(all, "yyyy"),
            disp: formatCurrency(Math.round(Number(total.yearToDateTotal))),
            total: Math.ceil(Number(total.yearToDateTotal)),
          };
        })
      );
      setAllTotals(totals);
    };
    fetchAllTotal();
  }, [allTimeHistory]);

  useEffect(() => {}, []);

  if (!isMounted) {
    return null;
  }

  // const displayPrice = allTimeHistory;

  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    payload: any;
    label?: any;
    active?: boolean;
  }) {
    if (active && payload && payload.length) {
      return (
        <div className="shadows rounded-xl bg-white px-[30px] py-[10px]">
          <p className="desc">{payload[0].payload.disp}</p>
        </div>
      );
    }

    return null;
  }

  return (
    <ScrollArea>
      <BarChart width={900} height={300} data={allTotals}>
        <XAxis dataKey="name" stroke="#8884d8" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip
          content={
            <CustomTooltip payload={allTotals.map((item) => item.disp)} />
          }
        />
        <CartesianGrid stroke="#f3efd0" strokeDasharray="5 5" />
        <Legend
          width={100}
          wrapperStyle={{
            top: 40,
            right: 20,
            backgroundColor: "#f5f5f5",
            border: "1px solid #d5d5d5",
            borderRadius: 3,
            lineHeight: "40px",
          }}
        />
        <Bar dataKey="total" fill="#4d4100" barSize={30} />
      </BarChart>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function DailyTransactionChart({ day }: { day: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [dayTotal, setDayTotal] = useState<ChartDataPoint[]>([]);

  const startDate = new Date(day);
  const endDate = endOfDay(startDate);
  const dayHistory = eachHourOfInterval({ start: startDate, end: endDate });

  useEffect(() => {
    setIsMounted(true);
    const fetchAllTotal = async () => {
      const totals = await Promise.all(
        dayHistory.map(async (time) => {
          const total = await getPaymentTotalsOld(
            startOfHour(time),
            endOfHour(time)
          );
          return {
            name: format(time, "kk"),
            disp: formatCurrency(Math.round(Number(total.customRangeTotal))),
            total: Math.ceil(Number(total.customRangeTotal)),
          };
        })
      );
      setDayTotal(totals);
    };
    fetchAllTotal();
  }, [dayHistory]);

  if (!isMounted) {
    return null;
  }

  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    payload: any;
    label?: any;
    active?: boolean;
  }) {
    if (active && payload && payload.length) {
      return (
        <div className="shadows rounded-xl bg-white px-[30px] py-[10px]">
          <p className="desc">{payload[0].payload.disp}</p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="">
      {day}
      <BarChart width={800} height={300} data={dayTotal}>
        <XAxis dataKey="name" stroke="#8884d8" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip
          content={
            <CustomTooltip payload={dayTotal.map((item) => item.disp)} />
          }
        />
        <Legend
          width={100}
          wrapperStyle={{
            top: 40,
            right: 20,
            backgroundColor: "#f5f5f5",
            border: "1px solid #d5d5d5",
            borderRadius: 3,
            lineHeight: "40px",
          }}
        />
        <CartesianGrid stroke="#f3efd0" strokeDasharray="5 5" />
        <Bar dataKey="total" fill="#4d4100" barSize={30} />
      </BarChart>
    </div>
  );
}

export function WeeklyTransactionChart({
  week,
  month,
  year,
}: {
  week: string;
  month: string;
  year: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [monthTotal, setMonthTotal] = useState<ChartDataPoint[]>([]);
  const months = [
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

  const monthNumber = months.indexOf(month.toLowerCase()) + 1;
  const startDate = new Date(Number(year), monthNumber - 1, 1);
  const endDate = endOfMonth(startDate);
  const monthHistory = eachWeekOfInterval({ start: startDate, end: endDate });

  const selectedDate = useMemo(() => {
    switch (week) {
      case "week1":
        return eachDayOfInterval({
          start: new Date(Number(year), monthNumber - 1, 1),
          end: endOfWeek(new Date(Number(year), monthNumber - 1, 1)),
        });
      case "week2":
        return eachDayOfInterval({
          start: new Date(Number(year), monthNumber - 1, 8),
          end: endOfWeek(new Date(Number(year), monthNumber - 1, 8)),
        });
      case "week3":
        return eachDayOfInterval({
          start: new Date(Number(year), monthNumber - 1, 15),
          end: endOfWeek(new Date(Number(year), monthNumber - 1, 15)),
        });
      case "week4":
        return eachDayOfInterval({
          start: new Date(Number(year), monthNumber - 1, 22),
          end: endOfWeek(new Date(Number(year), monthNumber - 1, 22)),
        });
      default:
        return [];
    }
  }, [week, year, monthNumber]);

  // var monthHistory: Date[];

  // switch (month) {
  //      case "December":
  //           monthHistory = eachWeekOfInterval({ start: new Date(`${year}-12-01`), end: endOfMonth(new Date(month)) });
  // }

  // if (month === "december") {
  //      var monthHistory = eachWeekOfInterval({ start: new Date(`${year}-12-01`), end: endOfMonth(new Date(month)) });
  // }

  useEffect(() => {
    setIsMounted(true);
    const fetchAllTotal = async () => {
      const totals = await Promise.all(
        selectedDate.map(async (week) => {
          const total = await getPaymentTotalsOld(
            startOfDay(week),
            endOfDay(week)
          );
          return {
            name: format(week, "iiii"),
            disp: formatCurrency(Math.round(Number(total.customRangeTotal))),
            total: Math.ceil(Number(total.customRangeTotal)),
          };
        })
      );
      setMonthTotal(totals);
    };
    fetchAllTotal();
  }, [selectedDate]);

  if (!isMounted) {
    return null;
  }

  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    payload: any;
    label?: any;
    active?: boolean;
  }) {
    if (active && payload && payload.length) {
      return (
        <div className="shadows rounded-xl bg-white px-[30px] py-[10px]">
          <p className="desc">{payload[0].payload.disp}</p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="">
      {month} {year} {week}
      <BarChart width={800} height={300} data={monthTotal}>
        <XAxis dataKey="name" stroke="#8884d8" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip
          content={
            <CustomTooltip payload={monthTotal.map((item) => item.disp)} />
          }
        />
        <Legend
          width={100}
          wrapperStyle={{
            top: 40,
            right: 20,
            backgroundColor: "#f5f5f5",
            border: "1px solid #d5d5d5",
            borderRadius: 3,
            lineHeight: "40px",
          }}
        />
        <CartesianGrid stroke="#f3efd0" strokeDasharray="5 5" />
        <Bar dataKey="total" fill="#4d4100" barSize={30} />
      </BarChart>
    </div>
  );
}

export function MonthlyTransactionChart({
  month,
  year,
}: {
  month: string;
  year: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [monthTotal, setMonthTotal] = useState<ChartDataPoint[]>([]);
  const months = [
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

  const monthNumber = months.indexOf(month.toLowerCase()) + 1;
  const startDate = new Date(Number(year), monthNumber - 1, 1);
  const endDate = endOfMonth(startDate);
  const monthHistory = eachWeekOfInterval({ start: startDate, end: endDate });

  // var monthHistory: Date[];

  // switch (month) {
  //      case "December":
  //           monthHistory = eachWeekOfInterval({ start: new Date(`${year}-12-01`), end: endOfMonth(new Date(month)) });
  // }

  // if (month === "december") {
  //      var monthHistory = eachWeekOfInterval({ start: new Date(`${year}-12-01`), end: endOfMonth(new Date(month)) });
  // }

  useEffect(() => {
    setIsMounted(true);
    const fetchAllTotal = async () => {
      const totals = await Promise.all(
        monthHistory.map(async (month) => {
          const total = await getPaymentTotalsOld(
            startOfWeek(month),
            endOfWeek(month)
          );
          return {
            name: `${format(startOfWeek(month), "MM/dd")} - ${format(
              endOfWeek(month),
              "MM/dd"
            )}`,
            disp: formatCurrency(Math.round(Number(total.customRangeTotal))),
            total: Math.ceil(Number(total.customRangeTotal)),
          };
        })
      );
      setMonthTotal(totals);
    };
    fetchAllTotal();
  }, [monthHistory]);

  if (!isMounted) {
    return null;
  }

  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    payload: any;
    label?: any;
    active?: boolean;
  }) {
    if (active && payload && payload.length) {
      return (
        <div className="shadows rounded-xl bg-white px-[30px] py-[10px]">
          <p className="desc">{payload[0].payload.disp}</p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="">
      {month} {year}
      <BarChart width={800} height={300} data={monthTotal}>
        <XAxis dataKey="name" stroke="#8884d8" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip
          content={
            <CustomTooltip payload={monthTotal.map((item) => item.disp)} />
          }
        />
        <Legend
          width={100}
          wrapperStyle={{
            top: 40,
            right: 20,
            backgroundColor: "#f5f5f5",
            border: "1px solid #d5d5d5",
            borderRadius: 3,
            lineHeight: "40px",
          }}
        />
        <CartesianGrid stroke="#f3efd0" strokeDasharray="5 5" />
        <Bar dataKey="total" fill="#4d4100" barSize={30} />
      </BarChart>
    </div>
  );
}

export function YearlyTransactionChart() {
  const [isMounted, setIsMounted] = useState(false);
  const [yearTotal, setYearTotal] = useState<ChartDataPoint[]>([]);
  const yearHistory = eachMonthOfInterval({
    start: new Date("2024-08-01"),
    end: new Date(),
  });

  useEffect(() => {
    setIsMounted(true);
    const fetchAllTotal = async () => {
      const totals = await Promise.all(
        yearHistory.map(async (year) => {
          const total = await getPaymentTotalsOld(
            startOfMonth(year),
            endOfMonth(year)
          );
          return {
            name: format(year, "LLLL"),
            disp: formatCurrency(Math.round(Number(total.customRangeTotal))),
            total: Math.ceil(Number(total.customRangeTotal)),
          };
        })
      );
      setYearTotal(totals);
    };
    fetchAllTotal();
  }, [yearHistory]);

  if (!isMounted) {
    return null;
  }

  // const displayPrice = allTimeHistory;
  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    payload: any;
    label?: any;
    active?: boolean;
  }) {
    if (active && payload && payload.length) {
      return (
        <div className="shadows rounded-xl bg-white px-[30px] py-[10px]">
          <p className="desc">{payload[0].payload.disp}</p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="">
      <BarChart width={800} height={300} data={yearTotal}>
        <XAxis dataKey="name" stroke="#8884d8" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip
          content={
            <CustomTooltip payload={yearTotal.map((item) => item.disp)} />
          }
        />
        <Legend
          width={100}
          wrapperStyle={{
            top: 40,
            right: 20,
            backgroundColor: "#f5f5f5",
            border: "1px solid #d5d5d5",
            borderRadius: 3,
            lineHeight: "40px",
          }}
        />
        <CartesianGrid stroke="#f3efd0" strokeDasharray="5 5" />
        <Bar dataKey="total" fill="#4d4100" barSize={30} />
      </BarChart>
    </div>
  );
}
