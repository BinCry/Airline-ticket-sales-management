package com.qlvmb.airticket.domain.dto;

import java.time.OffsetDateTime;

public record PaymentSessionResponse(
    String bookingCode,
    String paymentUrl,
    String paymentStatus,
    OffsetDateTime expiresAt
) {
}
