package com.qlvmb.airticket.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class OtpDeliveryServiceTest {

  private static final String FROM_EMAIL = "sender@example.com";

  @Test
  void sendForgotPasswordOtp_shouldSendEmailWhenMailEnabled() {
    JavaMailSender mailSender = mock(JavaMailSender.class);
    OtpDeliveryService otpDeliveryService = new OtpDeliveryService(mailSender, true, FROM_EMAIL);

    otpDeliveryService.sendForgotPasswordOtp("khach@example.com", "123456");

    ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(messageCaptor.capture());

    SimpleMailMessage message = messageCaptor.getValue();
    assertThat(message.getTo()).containsExactly("khach@example.com");
    assertThat(message.getFrom()).isEqualTo(FROM_EMAIL);
    assertThat(message.getSubject()).isEqualTo("Mã OTP đặt lại mật khẩu | Vietnam Airlines");
    assertThat(message.getText()).contains("Mã OTP của bạn là: 123456");
    assertThat(message.getText()).contains("Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu");
  }

  @Test
  void sendBookingLookupOtp_shouldSendEmailWhenMailEnabled() {
    JavaMailSender mailSender = mock(JavaMailSender.class);
    OtpDeliveryService otpDeliveryService = new OtpDeliveryService(mailSender, true, FROM_EMAIL);

    otpDeliveryService.sendBookingLookupOtp("khach@example.com", "654321", "AB12CD");

    ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(messageCaptor.capture());

    SimpleMailMessage message = messageCaptor.getValue();
    assertThat(message.getTo()).containsExactly("khach@example.com");
    assertThat(message.getFrom()).isEqualTo(FROM_EMAIL);
    assertThat(message.getSubject()).isEqualTo("Mã OTP tra cứu đặt chỗ AB12CD | Vietnam Airlines");
    assertThat(message.getText()).contains("Mã OTP của bạn là: 654321");
    assertThat(message.getText()).contains("tra cứu thông tin đặt chỗ AB12CD");
  }

  @Test
  void sendForgotPasswordOtp_shouldNotSendEmailWhenMailDisabled() {
    JavaMailSender mailSender = mock(JavaMailSender.class);
    OtpDeliveryService otpDeliveryService = new OtpDeliveryService(mailSender, false, FROM_EMAIL);

    otpDeliveryService.sendForgotPasswordOtp("khach@example.com", "123456");

    verifyNoInteractions(mailSender);
  }

  @Test
  void sendForgotPasswordOtp_shouldFailWhenMailEnabledButSenderMissing() {
    OtpDeliveryService otpDeliveryService = new OtpDeliveryService(null, true, FROM_EMAIL);

    assertThatThrownBy(() -> otpDeliveryService.sendForgotPasswordOtp("khach@example.com", "123456"))
        .isInstanceOf(IllegalStateException.class)
        .hasMessage("Chưa cấu hình dịch vụ gửi email.");
  }
}
