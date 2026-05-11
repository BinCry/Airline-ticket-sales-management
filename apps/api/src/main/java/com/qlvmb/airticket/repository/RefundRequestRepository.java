package com.qlvmb.airticket.repository;

import com.qlvmb.airticket.domain.entity.RefundRequestEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefundRequestRepository extends JpaRepository<RefundRequestEntity, Long> {

  Optional<RefundRequestEntity> findFirstByBooking_BookingCodeIgnoreCaseOrderByCreatedAtDesc(String bookingCode);
}
