import type { ApiManageBookingOverview } from "@qlvmb/shared-types";

import { ApiClientError, requestApi } from "@/lib/api-client";

export type ManageBookingOverview = ApiManageBookingOverview;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isManageBookingOverview(value: unknown): value is ManageBookingOverview {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.bookingCode === "string" &&
    typeof value.status === "string" &&
    typeof value.paymentStatus === "string" &&
    (value.holdExpiresAt === null || typeof value.holdExpiresAt === "string") &&
    (value.ticketedAt === null || typeof value.ticketedAt === "string") &&
    typeof value.tripType === "string" &&
    Array.isArray(value.steps) &&
    Array.isArray(value.segments) &&
    Array.isArray(value.passengers) &&
    Array.isArray(value.ancillaries) &&
    Array.isArray(value.tickets) &&
    Array.isArray(value.boardingPasses) &&
    (value.refundRequest === null || isObject(value.refundRequest)) &&
    Array.isArray(value.paymentMethods) &&
    isStringArray(value.paymentMethods) &&
    Boolean(value.priceSummary && typeof value.priceSummary === "object")
  );
}

export async function fetchManageBooking(
  bookingCode: string,
  accessToken?: string
): Promise<ManageBookingOverview> {
  const payload = await requestApi<unknown>(
    `/api/bookings/manage/${encodeURIComponent(bookingCode.trim())}`,
    {
      accessToken,
      fallbackMessage: "Kh\u00f4ng th\u1ec3 tra c\u1ee9u th\u00f4ng tin \u0111\u1eb7t ch\u1ed7 l\u00fac n\u00e0y."
    }
  );

  if (!isManageBookingOverview(payload)) {
    throw new ApiClientError("D\u1eef li\u1ec7u qu\u1ea3n l\u00fd \u0111\u1eb7t ch\u1ed7 tr\u1ea3 v\u1ec1 kh\u00f4ng h\u1ee3p l\u1ec7.", 500);
  }

  return payload;
}
