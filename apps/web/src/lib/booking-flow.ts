import type {
  ApiCreateBookingHoldRequest,
  ApiFlightCard,
  ApiFlightSearchCriteria,
  FareFamily
} from "@qlvmb/shared-types";

export interface BookingHandoffSegment {
  arrivalAt: string;
  arrivalTime: string;
  code: string;
  departureAt: string;
  departureTime: string;
  destinationCode: string;
  fareFamily: FareFamily;
  from: string;
  inventoryId: number;
  originCode: string;
  price: number;
  to: string;
}

export interface BookingHandoffState {
  adultCount: number;
  childCount: number;
  infantCount: number;
  segments: BookingHandoffSegment[];
  tripType: ApiCreateBookingHoldRequest["tripType"];
}

function readPositiveInteger(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function readSegment(searchParams: URLSearchParams, index: number): BookingHandoffSegment | null {
  const prefix = `segment${index}`;
  const inventoryId = readPositiveInteger(searchParams.get(`${prefix}InventoryId`));
  const code = searchParams.get(`${prefix}Code`);
  const from = searchParams.get(`${prefix}From`);
  const to = searchParams.get(`${prefix}To`);
  const originCode = searchParams.get(`${prefix}OriginCode`);
  const destinationCode = searchParams.get(`${prefix}DestinationCode`);
  const departureAt = searchParams.get(`${prefix}DepartureAt`);
  const arrivalAt = searchParams.get(`${prefix}ArrivalAt`);
  const departureTime = searchParams.get(`${prefix}DepartureTime`);
  const arrivalTime = searchParams.get(`${prefix}ArrivalTime`);
  const fareFamily = searchParams.get(`${prefix}FareFamily`) as FareFamily | null;
  const price = readPositiveInteger(searchParams.get(`${prefix}Price`));

  if (
    inventoryId === null ||
    !code ||
    !from ||
    !to ||
    !originCode ||
    !destinationCode ||
    !departureAt ||
    !arrivalAt ||
    !departureTime ||
    !arrivalTime ||
    !fareFamily ||
    price === null
  ) {
    return null;
  }

  return {
    arrivalAt,
    arrivalTime,
    code,
    departureAt,
    departureTime,
    destinationCode,
    fareFamily,
    from,
    inventoryId,
    originCode,
    price,
    to
  };
}

export function createBookingHandoffUrl(
  criteria: ApiFlightSearchCriteria,
  segments: BookingHandoffSegment[]
): string {
  const searchParams = new URLSearchParams({
    adultCount: String(criteria.adultCount),
    childCount: String(criteria.childCount),
    infantCount: String(criteria.infantCount),
    tripType: criteria.tripType
  });

  segments.forEach((segment, index) => {
    const segmentNumber = index + 1;
    searchParams.set(`segment${segmentNumber}InventoryId`, String(segment.inventoryId));
    searchParams.set(`segment${segmentNumber}Code`, segment.code);
    searchParams.set(`segment${segmentNumber}From`, segment.from);
    searchParams.set(`segment${segmentNumber}To`, segment.to);
    searchParams.set(`segment${segmentNumber}OriginCode`, segment.originCode);
    searchParams.set(`segment${segmentNumber}DestinationCode`, segment.destinationCode);
    searchParams.set(`segment${segmentNumber}DepartureAt`, segment.departureAt);
    searchParams.set(`segment${segmentNumber}ArrivalAt`, segment.arrivalAt);
    searchParams.set(`segment${segmentNumber}DepartureTime`, segment.departureTime);
    searchParams.set(`segment${segmentNumber}ArrivalTime`, segment.arrivalTime);
    searchParams.set(`segment${segmentNumber}FareFamily`, segment.fareFamily);
    searchParams.set(`segment${segmentNumber}Price`, String(segment.price));
  });

  return `/booking?${searchParams.toString()}`;
}

export function createHandoffSegmentFromFlight(flight: ApiFlightCard): BookingHandoffSegment {
  return {
    arrivalAt: flight.arrivalAt,
    arrivalTime: flight.arrivalTime,
    code: flight.code,
    departureAt: flight.departureAt,
    departureTime: flight.departureTime,
    destinationCode: flight.destinationCode,
    fareFamily: flight.fareFamily,
    from: flight.from,
    inventoryId: flight.inventoryId,
    originCode: flight.originCode,
    price: flight.price,
    to: flight.to
  };
}

export function parseBookingHandoffState(searchParams: URLSearchParams): BookingHandoffState | null {
  const tripType = searchParams.get("tripType");
  if (tripType !== "one_way" && tripType !== "round_trip") {
    return null;
  }

  const adultCount = readPositiveInteger(searchParams.get("adultCount"));
  const childCount = readPositiveInteger(searchParams.get("childCount"));
  const infantCount = readPositiveInteger(searchParams.get("infantCount"));

  if (adultCount === null || childCount === null || infantCount === null || adultCount < 1) {
    return null;
  }

  const firstSegment = readSegment(searchParams, 1);
  const secondSegment = readSegment(searchParams, 2);
  const segments = [firstSegment, secondSegment].filter(
    (segment): segment is BookingHandoffSegment => segment !== null
  );

  if (tripType === "one_way" && segments.length !== 1) {
    return null;
  }

  if (tripType === "round_trip" && segments.length !== 2) {
    return null;
  }

  return {
    adultCount,
    childCount,
    infantCount,
    segments,
    tripType
  };
}
