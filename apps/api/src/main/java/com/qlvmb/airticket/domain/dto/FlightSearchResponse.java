package com.qlvmb.airticket.domain.dto;

import java.util.List;

public record FlightSearchResponse(
    String tripType,
    String from,
    String to,
    List<String> filters,
    List<FlightCard> flights,
    List<FareCard> fares,
    SearchCriteria criteria,
    List<FlightCard> outboundFlights,
    List<FlightCard> returnFlights
) {

  public record SearchCriteria(
      String from,
      String to,
      String departureDate,
      String returnDate,
      String tripType,
      int adultCount,
      int childCount,
      int infantCount
  ) {
  }

  public record FlightCard(
      long flightId,
      String code,
      String from,
      String to,
      String originCode,
      String destinationCode,
      String departureAt,
      String arrivalAt,
      String departureTime,
      String arrivalTime,
      String duration,
      String status,
      long baseFare,
      List<FareOption> fares
  ) {
  }

  public record FareOption(
      long inventoryId,
      String fareFamily,
      String title,
      long price,
      int seatsLeft,
      int totalSeats
  ) {
  }

  public record FareCard(
      String fareFamily,
      String title,
      long price,
      List<String> perks
  ) {
  }
}
