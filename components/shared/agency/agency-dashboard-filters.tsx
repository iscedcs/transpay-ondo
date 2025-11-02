import { motion } from "framer-motion";
import { useState } from "react";

const ranges = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Months", value: "quarter" },
  { label: "All-Time", value: "all" },
];

export default function AgencyDashboardFilters({
  onChange,
}: {
  onChange: (range: string) => void;
}) {
  const [active, setActive] = useState("month");

  return (
    <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
      <div className="flex gap-2 bg-muted/40 rounded-xl p-1">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => {
              setActive(r.value);
              onChange(r.value);
            }}
            className={`relative px-3 py-1.5 text-sm rounded-lg transition-all ${
              active === r.value
                ? "text-white font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {active === r.value && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-primary rounded-lg z-0"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
