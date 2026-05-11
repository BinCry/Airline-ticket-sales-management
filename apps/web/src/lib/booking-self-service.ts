import type { ApiManageBookingOverview, ApiManageBookingTicket } from "@qlvmb/shared-types";

export function layVeCoTheCheckin(
  bookingOverview: ApiManageBookingOverview
): ApiManageBookingTicket[] {
  if (bookingOverview.tripType !== "one_way") {
    return [];
  }

  if (bookingOverview.status !== "ticketed") {
    return [];
  }

  return bookingOverview.tickets.filter((ticket) => ticket.status === "issued");
}

export function coTheLamThuTuc(bookingOverview: ApiManageBookingOverview): boolean {
  return layVeCoTheCheckin(bookingOverview).length > 0;
}

export function coTheYeuCauHoanVe(bookingOverview: ApiManageBookingOverview): boolean {
  if (bookingOverview.status !== "ticketed") {
    return false;
  }

  if (bookingOverview.refundRequest?.status === "pending") {
    return false;
  }

  return bookingOverview.tickets.every((ticket) => ticket.status !== "checked_in");
}
