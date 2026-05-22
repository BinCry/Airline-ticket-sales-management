import { describe, expect, it } from "vitest";

import type { ApiFlightCard, ApiFlightSearchCriteria } from "@qlvmb/shared-types";

import {
  createBookingHandoffUrl,
  createHandoffSegmentFromFlight,
  parseBookingHandoffState
} from "@/lib/booking-flow";

const criteria: ApiFlightSearchCriteria = {
  adultCount: 1,
  childCount: 0,
  departureDate: "2026-03-20",
  from: "SGN",
  infantCount: 0,
  returnDate: null,
  to: "HAN",
  tripType: "one_way"
};

const flight: ApiFlightCard = {
  arrivalAt: "2026-03-20T08:20:00+07:00",
  arrivalTime: "08:20",
  code: "AU201",
  departureAt: "2026-03-20T06:10:00+07:00",
  departureTime: "06:10",
  destinationCode: "HAN",
  duration: "2 gio 10 phut",
  fares: [
    {
      fareFamily: "pho_thong_tiet_kiem",
      inventoryId: 20101,
      price: 1490000,
      seatsLeft: 120,
      title: "Phổ thông tiết kiệm",
      totalSeats: 120
    },
    {
      fareFamily: "pho_thong_linh_hoat",
      inventoryId: 20102,
      price: 1990000,
      seatsLeft: 36,
      title: "Phổ thông linh hoạt",
      totalSeats: 36
    },
    {
      fareFamily: "thuong_gia",
      inventoryId: 20103,
      price: 2490000,
      seatsLeft: 12,
      title: "Thương gia",
      totalSeats: 12
    }
  ],
  flightId: 201,
  from: "Thanh pho Ho Chi Minh",
  originCode: "SGN",
  baseFare: 1490000,
  status: "on_time",
  to: "Ha Noi"
};

describe("booking-flow", () => {
  it("tao duong dan handoff sang trang dat ve", () => {
    expect(
      createBookingHandoffUrl(criteria, [createHandoffSegmentFromFlight(flight)])
    ).toContain("/booking?");
  });

  it("doc lai duoc handoff state tu query string", () => {
    const url = createBookingHandoffUrl(criteria, [createHandoffSegmentFromFlight(flight)]);
    const queryString = url.split("?")[1] ?? "";
    const handoffState = parseBookingHandoffState(new URLSearchParams(queryString));

    expect(handoffState).toMatchObject({
      adultCount: 1,
      tripType: "one_way"
    });
    expect(handoffState?.segments[0].flightId).toBe(201);
    expect(handoffState?.segments[0].baseFare).toBe(1490000);
  });
});
