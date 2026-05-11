package com.qlvmb.airticket.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentCallbackRequest(
    @NotBlank String bookingCode,
    String result
) {

  public String normalizedResult() {
    if (result == null || result.isBlank()) {
      return "success";
    }
    return result.trim().toLowerCase();
  }
}
