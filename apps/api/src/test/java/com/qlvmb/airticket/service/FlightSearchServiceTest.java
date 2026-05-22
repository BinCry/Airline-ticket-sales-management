package com.qlvmb.airticket.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qlvmb.airticket.domain.dto.FlightSearchResponse;
import com.qlvmb.airticket.domain.entity.AirportEntity;
import com.qlvmb.airticket.domain.entity.FlightEntity;
import com.qlvmb.airticket.domain.entity.FlightFareInventoryEntity;
import com.qlvmb.airticket.domain.mapper.FlightSearchMapper;
import com.qlvmb.airticket.exception.BadRequestException;
import com.qlvmb.airticket.repository.AirportRepository;
import com.qlvmb.airticket.repository.BookingSeatSelectionRepository;
import com.qlvmb.airticket.repository.FlightRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.BeanUtils;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class FlightSearchServiceTest {

  @Mock
  private AirportRepository airportRepository;

  @Mock
  private FlightRepository flightRepository;

  @Mock
  private BookingSeatSelectionRepository bookingSeatSelectionRepository;

  private FlightSearchService flightSearchService;

  @BeforeEach
  void setUp() {
    flightSearchService = new FlightSearchService(
        airportRepository,
        bookingSeatSelectionRepository,
        flightRepository,
        new ProductCatalogService(),
        new FlightSearchMapper()
    );
  }

  @Test
  void searchFlights_shouldReturnOutboundFlightsForOneWayTrip() {
    mockAirportExists("SGN", "HAN");
    FlightEntity outboundFlight = mockFlight(
        201L,
        "AU201",
        "SGN",
        "Thanh pho Ho Chi Minh",
        "HAN",
        "Ha Noi",
        "2026-03-20T06:10:00+07:00",
        "2026-03-20T08:20:00+07:00",
        "on_time",
        List.of(mockInventory(2001L, "pho_thong_tiet_kiem", 8, 1490000L))
    );
    when(flightRepository.searchRoute(eq("SGN"), eq("HAN"), any(), any())).thenReturn(List.of(outboundFlight));

    FlightSearchResponse response = flightSearchService.searchFlights(
        "sgn",
        "han",
        LocalDate.of(2026, 3, 20),
        null,
        "one_way",
        1,
        0,
        0
    );

    assertThat(response.tripType()).isEqualTo("one_way");
    assertThat(response.outboundFlights()).hasSize(1);
    assertThat(response.returnFlights()).isEmpty();
    assertThat(response.outboundFlights().getFirst().code()).isEqualTo("AU201");
    assertThat(response.outboundFlights().getFirst().departureTime()).isEqualTo("06:10");
    verify(flightRepository, never()).searchRoute(eq("HAN"), eq("SGN"), any(), any());
  }

  @Test
  void searchFlights_shouldReturnRoundTripFlights() {
    mockAirportExists("SGN", "HAN");
    FlightEntity outboundFlight = mockFlight(
        215L,
        "AU215",
        "SGN",
        "Thanh pho Ho Chi Minh",
        "HAN",
        "Ha Noi",
        "2026-03-20T09:45:00+07:00",
        "2026-03-20T11:55:00+07:00",
        "boarding",
        List.of(mockInventory(2002L, "pho_thong_linh_hoat", 5, 1890000L))
    );
    FlightEntity returnFlight = mockFlight(
        330L,
        "AU330",
        "HAN",
        "Ha Noi",
        "SGN",
        "Thanh pho Ho Chi Minh",
        "2026-03-23T14:20:00+07:00",
        "2026-03-23T16:30:00+07:00",
        "on_time",
        List.of(mockInventory(2003L, "pho_thong_linh_hoat", 4, 1920000L))
    );
    when(flightRepository.searchRoute(eq("SGN"), eq("HAN"), any(), any())).thenReturn(List.of(outboundFlight));
    when(flightRepository.searchRoute(eq("HAN"), eq("SGN"), any(), any())).thenReturn(List.of(returnFlight));

    FlightSearchResponse response = flightSearchService.searchFlights(
        "SGN",
        "HAN",
        LocalDate.of(2026, 3, 20),
        LocalDate.of(2026, 3, 23),
        "round_trip",
        1,
        0,
        0
    );

    assertThat(response.outboundFlights()).hasSize(1);
    assertThat(response.returnFlights()).hasSize(1);
    assertThat(response.flights()).hasSize(2);
    assertThat(response.fares()).hasSize(3);
    assertThat(response.criteria().returnDate()).isEqualTo("2026-03-23");
  }

  @Test
  void searchFlights_shouldReturnFareOptionsTheoChuyenBay() {
    mockAirportExists("SGN", "HAN");
    FlightEntity outboundFlight = mockFlight(
        233L,
        "AU233",
        "SGN",
        "Thanh pho Ho Chi Minh",
        "HAN",
        "Ha Noi",
        "2026-03-20T18:20:00+07:00",
        "2026-03-20T20:35:00+07:00",
        "scheduled",
        List.of(
            mockInventory(2004L, "pho_thong_tiet_kiem", 9, 1490000L),
            mockInventory(2005L, "thuong_gia", 3, 3490000L)
        )
    );
    when(flightRepository.searchRoute(eq("SGN"), eq("HAN"), any(), any())).thenReturn(List.of(outboundFlight));

    FlightSearchResponse response = flightSearchService.searchFlights(
        "SGN",
        "HAN",
        LocalDate.of(2026, 3, 20),
        null,
        "one_way",
        1,
        0,
        0
    );

    assertThat(response.outboundFlights()).hasSize(1);
    assertThat(response.outboundFlights().getFirst().baseFare()).isEqualTo(1490000L);
    assertThat(response.outboundFlights().getFirst().fares())
        .extracting(FlightSearchResponse.FareOption::fareFamily)
        .containsExactly("pho_thong_tiet_kiem", "thuong_gia");
  }

  @Test
  void searchFlights_shouldReturnGiaThapNhatChoTungHangVe() {
    mockAirportExists("SGN", "HAN");
    FlightEntity firstFlight = mockFlight(
        701L,
        "AU701",
        "SGN",
        "Thanh pho Ho Chi Minh",
        "HAN",
        "Ha Noi",
        "2026-03-20T07:00:00+07:00",
        "2026-03-20T09:10:00+07:00",
        "scheduled",
        List.of(
            mockInventory(2701L, "pho_thong_tiet_kiem", 12, 1490000L),
            mockInventory(2702L, "pho_thong_linh_hoat", 8, 1990000L),
            mockInventory(2703L, "thuong_gia", 3, 3490000L)
        )
    );
    FlightEntity secondFlight = mockFlight(
        702L,
        "AU702",
        "SGN",
        "Thanh pho Ho Chi Minh",
        "HAN",
        "Ha Noi",
        "2026-03-20T11:30:00+07:00",
        "2026-03-20T13:40:00+07:00",
        "scheduled",
        List.of(
            mockInventory(2711L, "pho_thong_tiet_kiem", 9, 1590000L),
            mockInventory(2712L, "pho_thong_linh_hoat", 6, 2090000L),
            mockInventory(2713L, "thuong_gia", 2, 3290000L)
        )
    );
    when(flightRepository.searchRoute(eq("SGN"), eq("HAN"), any(), any()))
        .thenReturn(List.of(firstFlight, secondFlight));

    FlightSearchResponse response = flightSearchService.searchFlights(
        "SGN",
        "HAN",
        LocalDate.of(2026, 3, 20),
        null,
        "one_way",
        1,
        0,
        0
    );

    assertThat(response.fares())
        .extracting(FlightSearchResponse.FareCard::fareFamily, FlightSearchResponse.FareCard::price)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("pho_thong_tiet_kiem", 1490000L),
            org.assertj.core.groups.Tuple.tuple("pho_thong_linh_hoat", 1990000L),
            org.assertj.core.groups.Tuple.tuple("thuong_gia", 3290000L)
        );
  }

  @Test
  void searchFlights_shouldRejectUnknownAirportCode() {
    when(airportRepository.existsByCodeIgnoreCase("XXX")).thenReturn(false);

    assertThatThrownBy(() -> flightSearchService.searchFlights(
        "XXX",
        "HAN",
        LocalDate.of(2026, 3, 20),
        null,
        "one_way",
        1,
        0,
        0
    ))
        .isInstanceOf(BadRequestException.class)
        .hasMessage("Mã sân bay đi không hợp lệ.");
  }

  @Test
  void searchFlights_shouldRejectReturnDateBeforeDepartureDate() {
    mockAirportExists("SGN", "HAN");

    assertThatThrownBy(() -> flightSearchService.searchFlights(
        "SGN",
        "HAN",
        LocalDate.of(2026, 3, 20),
        LocalDate.of(2026, 3, 19),
        "round_trip",
        1,
        0,
        0
    ))
        .isInstanceOf(BadRequestException.class)
        .hasMessage("Ngày về không được trước ngày đi.");
  }

  @Test
  void searchFlights_shouldRejectPassengerCountOverLimit() {
    mockAirportExists("SGN", "HAN");

    assertThatThrownBy(() -> flightSearchService.searchFlights(
        "SGN",
        "HAN",
        LocalDate.of(2026, 3, 20),
        null,
        "one_way",
        4,
        4,
        2
    ))
        .isInstanceOf(BadRequestException.class)
        .hasMessage("Tổng số hành khách vượt quá giới hạn 9 người.");
  }

  @Test
  void searchFlights_shouldRejectNegativePassengerCount() {
    mockAirportExists("SGN", "HAN");

    assertThatThrownBy(() -> flightSearchService.searchFlights(
        "SGN",
        "HAN",
        LocalDate.of(2026, 3, 20),
        null,
        "one_way",
        1,
        -1,
        0
    ))
        .isInstanceOf(BadRequestException.class)
        .hasMessage("Số lượng hành khách không hợp lệ.");
  }

  @Test
  void searchFlights_shouldUseAvailableSeatsInsteadOfTotalSeats() {
    mockAirportExists("SGN", "HAN");
    FlightEntity outboundFlight = mockFlight(
        450L,
        "AU450",
        "SGN",
        "Thanh pho Ho Chi Minh",
        "HAN",
        "Ha Noi",
        "2026-03-20T21:00:00+07:00",
        "2026-03-20T23:10:00+07:00",
        "scheduled",
        List.of(mockInventory(2450L, "pho_thong_tiet_kiem", 2, 18, 1590000L))
    );
    when(flightRepository.searchRoute(eq("SGN"), eq("HAN"), any(), any())).thenReturn(List.of(outboundFlight));

    FlightSearchResponse response = flightSearchService.searchFlights(
        "SGN",
        "HAN",
        LocalDate.of(2026, 3, 20),
        null,
        "one_way",
        1,
        0,
        0
    );

    assertThat(response.outboundFlights()).hasSize(1);
    assertThat(response.outboundFlights().getFirst().fares()).hasSize(1);
    assertThat(response.outboundFlights().getFirst().fares().getFirst().seatsLeft()).isEqualTo(2);
  }

  private void mockAirportExists(String... airportCodes) {
    for (String airportCode : airportCodes) {
      when(airportRepository.existsByCodeIgnoreCase(airportCode)).thenReturn(true);
    }
  }

  private FlightEntity mockFlight(
      long flightId,
      String flightCode,
      String originCode,
      String originCity,
      String destinationCode,
      String destinationCity,
      String departureAt,
      String arrivalAt,
      String status,
      List<FlightFareInventoryEntity> inventories
  ) {
    FlightEntity flight = BeanUtils.instantiateClass(FlightEntity.class);
    AirportEntity originAirport = mockAirport(originCode, originCity);
    AirportEntity destinationAirport = mockAirport(destinationCode, destinationCity);
    ReflectionTestUtils.setField(flight, "id", flightId);
    ReflectionTestUtils.setField(flight, "code", flightCode);
    ReflectionTestUtils.setField(flight, "originAirport", originAirport);
    ReflectionTestUtils.setField(flight, "destinationAirport", destinationAirport);
    ReflectionTestUtils.setField(flight, "departureAt", OffsetDateTime.parse(departureAt));
    ReflectionTestUtils.setField(flight, "arrivalAt", OffsetDateTime.parse(arrivalAt));
    ReflectionTestUtils.setField(flight, "status", status);
    ReflectionTestUtils.setField(flight, "salesOpen", true);
    ReflectionTestUtils.setField(flight, "fareInventories", new ArrayList<>(inventories));
    for (FlightFareInventoryEntity inventory : inventories) {
      lenient().when(inventory.getFlight()).thenReturn(flight);
    }
    return flight;
  }

  private AirportEntity mockAirport(String code, String cityName) {
    AirportEntity airport = org.mockito.Mockito.mock(AirportEntity.class);
    when(airport.getCode()).thenReturn(code);
    when(airport.getCityName()).thenReturn(cityName);
    return airport;
  }

  private FlightFareInventoryEntity mockInventory(long id, String fareFamily, int availableSeats, long price) {
    return mockInventory(id, fareFamily, availableSeats, availableSeats, price);
  }

  private FlightFareInventoryEntity mockInventory(
      long id,
      String fareFamily,
      int availableSeats,
      int totalSeats,
      long price
  ) {
    FlightFareInventoryEntity inventory = org.mockito.Mockito.mock(FlightFareInventoryEntity.class);
    when(inventory.getId()).thenReturn(id);
    when(inventory.getFareFamily()).thenReturn(fareFamily);
    lenient().when(inventory.getTotalSeats()).thenReturn(totalSeats);
    when(inventory.getAvailableSeats()).thenReturn(availableSeats);
    when(inventory.getPrice()).thenReturn(price);
    return inventory;
  }
}
