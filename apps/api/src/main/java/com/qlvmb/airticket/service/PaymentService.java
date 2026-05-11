package com.qlvmb.airticket.service;

import com.qlvmb.airticket.domain.dto.BookingOverviewResponse;
import com.qlvmb.airticket.domain.dto.PaymentCallbackRequest;
import com.qlvmb.airticket.domain.dto.PaymentSessionResponse;
import com.qlvmb.airticket.domain.entity.BookingEntity;
import com.qlvmb.airticket.domain.entity.BookingPassengerEntity;
import com.qlvmb.airticket.domain.entity.TicketEntity;
import com.qlvmb.airticket.exception.BadRequestException;
import com.qlvmb.airticket.exception.NotFoundException;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

  private static final String PAYMENT_FAILED_MESSAGE =
      "Thanh to\u00e1n ch\u01b0a th\u00e0nh c\u00f4ng.";

  private final BookingService bookingService;

  public PaymentService(BookingService bookingService) {
    this.bookingService = bookingService;
  }

  @Transactional
  public PaymentSessionResponse createPaymentSession(String bookingCode) {
    BookingEntity booking = bookingService.findBookingForPayment(bookingCode);
    OffsetDateTime currentTime = OffsetDateTime.now();

    if (!booking.isHold()) {
      throw new BadRequestException(bookingService.getWaitingPaymentMessage());
    }

    String paymentUrl = "/payment-sandbox?pnr=" + booking.getBookingCode();
    booking.markPaymentSessionPending(paymentUrl, currentTime);

    return new PaymentSessionResponse(
        booking.getBookingCode(),
        paymentUrl,
        bookingService.mapPaymentStatus(booking.getPaymentStatus()),
        booking.getExpiresAt()
    );
  }

  @Transactional
  public BookingOverviewResponse handlePaymentCallback(PaymentCallbackRequest request) {
    BookingEntity booking = bookingService.findBookingForPayment(request.bookingCode());
    OffsetDateTime currentTime = OffsetDateTime.now();

    if (BookingEntity.STATUS_CANCELLED.equals(booking.getStatus())
        && BookingEntity.PAYMENT_STATUS_EXPIRED.equals(booking.getPaymentStatus())) {
      throw new NotFoundException(bookingService.getBookingExpiredMessage());
    }

    if (!booking.isHold()) {
      throw new BadRequestException(bookingService.getWaitingPaymentMessage());
    }

    if (!"success".equals(request.normalizedResult())) {
      booking.markPaymentFailed(currentTime);
      throw new BadRequestException(PAYMENT_FAILED_MESSAGE);
    }

    String paymentReference = bookingService.generatePaymentReference();
    booking.markTicketed(paymentReference, currentTime);

    if (booking.getTickets().isEmpty()) {
      for (BookingPassengerEntity passenger : booking.getPassengers()) {
        booking.addTicket(
            TicketEntity.issue(
                booking,
                passenger,
                bookingService.generateUniqueTicketNumber(),
                currentTime
            )
        );
      }
    }

    return bookingService.mapOverviewResponse(booking);
  }
}
