package com.qlvmb.airticket.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CheckinCompleteRequest(
    @NotBlank String bookingCode,
    @NotEmpty @Size(max = 9) List<@NotBlank String> ticketNumbers
) {

  public CheckinCompleteRequest {
    ticketNumbers = List.copyOf(ticketNumbers);
  }
}
