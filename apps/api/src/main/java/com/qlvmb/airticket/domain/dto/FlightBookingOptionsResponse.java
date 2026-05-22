package com.qlvmb.airticket.domain.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record FlightBookingOptionsResponse(
    long flightId,
    String code,
    String originCode,
    String destinationCode,
    String from,
    String to,
    OffsetDateTime departureAt,
    OffsetDateTime arrivalAt,
    long baseFare,
    List<FareOptionItem> fareOptions,
    List<SeatItem> seats
) {

  public record FareOptionItem(
      long inventoryId,
      String fareFamily,
      String title,
      long price,
      int seatsLeft,
      int totalSeats,
      int rowStart,
      int rowEnd
  ) {
  }

  public record SeatItem(
      String seatNumber,
      String fareFamily,
      boolean occupied
  ) {
  }
}
