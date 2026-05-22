package com.qlvmb.airticket.repository;

import com.qlvmb.airticket.domain.entity.BookingSeatSelectionEntity;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingSeatSelectionRepository extends JpaRepository<BookingSeatSelectionEntity, Long> {

  @Query("""
      select distinct selection.seatNumber
      from BookingSeatSelectionEntity selection
      where selection.segment.inventory.flight.id = :flightId
        and (
          (selection.booking.status = 'HOLD' and selection.booking.expiresAt > :currentTime)
          or selection.booking.status = 'TICKETED'
          or selection.booking.status = 'REFUND_PENDING'
        )
      """)
  List<String> findOccupiedSeatNumbersByFlightId(
      @Param("flightId") Long flightId,
      @Param("currentTime") OffsetDateTime currentTime
  );
}
