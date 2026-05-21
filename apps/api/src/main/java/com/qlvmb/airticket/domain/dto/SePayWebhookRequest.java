package com.qlvmb.airticket.domain.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public record SePayWebhookRequest(
    Long id,
    String gateway,
    @JsonAlias("transaction_date") String transactionDate,
    @JsonAlias("account_number") String accountNumber,
    @JsonAlias("sub_account") String subAccount,
    String code,
    String content,
    @JsonAlias("transfer_type") String transferType,
    String description,
    @JsonAlias("transfer_amount") Long transferAmount,
    Long accumulated,
    @JsonAlias("reference_code") String referenceCode
) {

  private static final Pattern PAYMENT_CODE_PATTERN =
      Pattern.compile("SEPAY-?(\\d{12})", Pattern.CASE_INSENSITIVE);

  public boolean isIncomingTransfer() {
    return transferType != null && "in".equalsIgnoreCase(transferType.trim());
  }

  public String normalizedCode() {
    String normalized = extractNormalizedPaymentCode(code);
    if (normalized != null) {
      return normalized;
    }
    normalized = extractNormalizedPaymentCode(content);
    if (normalized != null) {
      return normalized;
    }
    normalized = extractNormalizedPaymentCode(description);
    if (normalized != null) {
      return normalized;
    }
    return extractNormalizedPaymentCode(referenceCode);
  }

  public static String extractNormalizedPaymentCode(String rawValue) {
    if (rawValue == null || rawValue.isBlank()) {
      return null;
    }

    Matcher matcher = PAYMENT_CODE_PATTERN.matcher(rawValue.trim());
    if (!matcher.find()) {
      return null;
    }

    return "SEPAY-" + matcher.group(1);
  }
}
