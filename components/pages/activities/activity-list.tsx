"use client";

import { PaginationISCE } from "@/components/shared/pagination-isce";
import { format } from "date-fns";
import ActivityCardGS from "./activity-card-google-style";

interface ActivityListProps {
  allActivities: IActivity[];
  meta: { total: number; total_pages: number; page: number };
  page: number;
  limit: number;
}

export default function ActivityList({
  allActivities,
  meta,
  page,
  limit,
}: ActivityListProps) {
  const total = meta.total || 0;
  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);

  return (
    <div className="w-full">
      <h1 className="text-center text-[30px] font-bold md:text-left">
        All Activities ({total})
      </h1>
      <div className="mt-[20px] grid grid-cols-1 gap-3 md:grid-cols-2">
        {allActivities.length > 0 ? (
          allActivities?.map((activity: IActivity) => (
            <ActivityCardGS
              key={activity.id}
              name={activity.name}
              description={activity.description}
              date={format(new Date(activity.createdAt), "yyyy-MM-dd hh:mm:ss")}
              link={`/activities/${activity.id}`}
            />
          ))
        ) : (
          <div className="flex items-center justify-center p-4">
            No Activities Found
          </div>
        )}
      </div>
      {total > 0 ? (
        <PaginationISCE
          hasNextPage={end < total}
          hasPrevPage={page > 1}
          page={page}
          limit={limit}
          total={total}
          hrefPrefix="/activities"
        />
      ) : (
        ""
      )}
    </div>
  );
}
