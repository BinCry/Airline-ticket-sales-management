package com.qlvmb.airticket.repository;

import com.qlvmb.airticket.domain.entity.BookingEntity;
import jakarta.persistence.LockModeType;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

  boolean existsByBookingCodeIgnoreCase(String bookingCode);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
      select distinct booking from BookingEntity booking
      left join fetch booking.contact
      left join fetch booking.passengers
      left join fetch booking.segments segment
      left join fetch segment.inventory inventory
      left join fetch inventory.flight flight
      left join fetch flight.originAirport
      left join fetch flight.destinationAirport
      left join fetch booking.ancillaries
      left join fetch booking.tickets ticket
      left join fetch ticket.passenger
      left join fetch ticket.boardingPass
      left join fetch booking.refundRequests
      where upper(booking.bookingCode) = upper(:bookingCode)
      """)
  Optional<BookingEntity> lockDetailedByBookingCode(@Param("bookingCode") String bookingCode);

  @Query("""
      select distinct booking from BookingEntity booking
      left join fetch booking.contact
      left join fetch booking.passengers
      left join fetch booking.segments segment
      left join fetch segment.inventory inventory
      left join fetch inventory.flight flight
      left join fetch flight.originAirport
      left join fetch flight.destinationAirport
      left join fetch booking.ancillaries
      left join fetch booking.tickets ticket
      left join fetch ticket.passenger
      left join fetch ticket.boardingPass
      left join fetch booking.refundRequests
      where upper(booking.bookingCode) = upper(:bookingCode)
      """)
  Optional<BookingEntity> findDetailedByBookingCode(@Param("bookingCode") String bookingCode);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
      select distinct booking from BookingEntity booking
      join fetch booking.segments segment
      join fetch segment.inventory inventory
      join fetch inventory.flight flight
      join fetch flight.originAirport
      join fetch flight.destinationAirport
      where booking.status = :status
        and booking.expiresAt <= :currentTime
        and inventory.id in :inventoryIds
      """)
  List<BookingEntity> lockExpiredHoldsByInventoryIds(
      @Param("status") String status,
      @Param("currentTime") OffsetDateTime currentTime,
      @Param("inventoryIds") Collection<Long> inventoryIds
  );
}
