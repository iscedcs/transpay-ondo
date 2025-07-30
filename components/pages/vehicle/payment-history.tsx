import {
  PaymentNotificationFilter,
  getPaymentNotifications,
} from "@/actions/payment-notification";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FNTC } from "@/lib/const";
import { getRevenueType } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function PaymentHistory({
  page = 1,
  pageSize = 10,
  filter = {},
  hasPagination = false,
  hasMore = true,
}: {
  filter?: PaymentNotificationFilter;
  page?: number;
  pageSize?: number;
  hasPagination?: boolean;
  hasMore?: boolean;
}) {
  const { notifications, pagination } = await getPaymentNotifications(
    page,
    pageSize,
    filter
  );
  const isFirstPage = pagination.page === 1;
  const isLastPage = pagination.page === pagination.totalPages;
  // const hasMore = notifications.length > pageSize;

  return (
    <div className="space-y-2">
      {/* <form
                    onSubmit={handleSearch}
                    className="mb-4 flex items-center space-x-2"
               >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                         type="text"
                         placeholder="Search by reference or name"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="flex-grow"
                    />
                    <Button type="submit">Search</Button>
               </form> */}
      <Table className="rounded-lg">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {/* <TableHead>Reference</TableHead> */}
            <TableHead>Amount</TableHead>
            <TableHead>Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>
                  {format(notification.paymentDate, "MMMM dd, hh:mm aa")}
                </TableCell>
                {/* <TableCell>
                                             {notification.payment_reference}
                                        </TableCell> */}
                <TableCell>
                  {FNTC.format(Number(notification.amount))}
                </TableCell>
                <TableCell>
                  {getRevenueType(notification.revenueName)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No Payment History
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {hasPagination && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm" disabled={isFirstPage}>
            <Link
              href={
                isFirstPage
                  ? "#"
                  : `?page=${pagination.page - 1}&pagesize=${
                      pagination.pageSize
                    }`
              }
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Link>
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={isLastPage}>
            <Link
              href={
                isLastPage
                  ? "#"
                  : `?page=${pagination.page + 1}&pagesize=${
                      pagination.pageSize
                    }`
              }
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
      {notifications && notifications.length >= 10
        ? hasMore && (
            <Link
              href={`/search/${filter.plateNumber}/payment-history-display`}
              className="flex justify-center"
            >
              <Button>View More</Button>
            </Link>
          )
        : null}
    </div>
  );
}
