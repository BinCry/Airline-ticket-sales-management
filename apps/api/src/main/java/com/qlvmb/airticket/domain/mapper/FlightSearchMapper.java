package com.qlvmb.airticket.domain.mapper;

import com.qlvmb.airticket.domain.dto.FlightSearchResponse;
import com.qlvmb.airticket.domain.entity.FlightEntity;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class FlightSearchMapper {

  private static final ZoneId DISPLAY_ZONE_ID = ZoneId.of("Asia/Ho_Chi_Minh");
  private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

  public FlightSearchResponse.SearchCriteria toCriteria(
      String from,
      String to,
      String departureDate,
      String returnDate,
      String tripType,
      int adultCount,
      int childCount,
      int infantCount
  ) {
    return new FlightSearchResponse.SearchCriteria(
        from,
        to,
        departureDate,
        returnDate,
        tripType,
        adultCount,
        childCount,
        infantCount
    );
  }

  public FlightSearchResponse.FlightCard toFlightCard(
      FlightEntity flight,
      long baseFare,
      List<FlightSearchResponse.FareOption> fares
  ) {
    OffsetDateTime departureAt = convertDisplayZone(flight.getDepartureAt());
    OffsetDateTime arrivalAt = convertDisplayZone(flight.getArrivalAt());

    return new FlightSearchResponse.FlightCard(
        flight.getId(),
        flight.getCode(),
        flight.getOriginAirport().getCityName(),
        flight.getDestinationAirport().getCityName(),
        flight.getOriginAirport().getCode(),
        flight.getDestinationAirport().getCode(),
        departureAt.toString(),
        arrivalAt.toString(),
        formatTime(departureAt),
        formatTime(arrivalAt),
        buildDuration(departureAt, arrivalAt),
        flight.getStatus(),
        baseFare,
        fares
    );
  }

  private OffsetDateTime convertDisplayZone(OffsetDateTime dateTime) {
    return dateTime.atZoneSameInstant(DISPLAY_ZONE_ID).toOffsetDateTime();
  }

  private String formatTime(OffsetDateTime dateTime) {
    return dateTime.format(TIME_FORMATTER);
  }

  private String buildDuration(OffsetDateTime departureAt, OffsetDateTime arrivalAt) {
    Duration duration = Duration.between(departureAt, arrivalAt);
    long hours = duration.toHours();
    long minutes = duration.toMinutesPart();
    return hours + " giờ " + minutes + " phút";
  }
}
