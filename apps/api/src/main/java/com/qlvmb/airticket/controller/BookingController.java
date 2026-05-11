package com.qlvmb.airticket.controller;

import com.qlvmb.airticket.domain.dto.BookingHoldRequest;
import com.qlvmb.airticket.domain.dto.BookingHoldResponse;
import com.qlvmb.airticket.domain.dto.BookingOverviewResponse;
import com.qlvmb.airticket.domain.dto.PaymentSessionResponse;
import com.qlvmb.airticket.domain.dto.RefundRequestCreateRequest;
import com.qlvmb.airticket.service.BookingService;
import com.qlvmb.airticket.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

  private final BookingService bookingService;
  private final PaymentService paymentService;

  public BookingController(
      BookingService bookingService,
      PaymentService paymentService
  ) {
    this.bookingService = bookingService;
    this.paymentService = paymentService;
  }

  @PostMapping("/holds")
  public BookingHoldResponse createHold(@Valid @RequestBody BookingHoldRequest request) {
    return bookingService.createHold(request);
  }

  @GetMapping("/manage/{bookingCode}")
  public BookingOverviewResponse getBooking(@PathVariable String bookingCode) {
    return bookingService.getBookingOverview(bookingCode);
  }

  @PostMapping("/{bookingCode}/refund-request")
  public BookingOverviewResponse createRefundRequest(
      @PathVariable String bookingCode,
      @Valid @RequestBody RefundRequestCreateRequest request
  ) {
    return bookingService.requestRefund(bookingCode, request);
  }

  @PostMapping("/{bookingCode}/payments/session")
  public PaymentSessionResponse createPaymentSession(@PathVariable String bookingCode) {
    return paymentService.createPaymentSession(bookingCode);
  }
}
