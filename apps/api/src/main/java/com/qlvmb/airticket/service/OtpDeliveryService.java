package com.qlvmb.airticket.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpDeliveryService {

  private static final Logger LOGGER = LoggerFactory.getLogger(OtpDeliveryService.class);

  private final @Nullable JavaMailSender mailSender;
  private final boolean mailEnabled;
  private final String fromEmail;

  public OtpDeliveryService(
      @Nullable JavaMailSender mailSender,
      @Value("${app.mail.enabled}") boolean mailEnabled,
      @Value("${app.mail.from-email:}") String fromEmail
  ) {
    this.mailSender = mailSender;
    this.mailEnabled = mailEnabled;
    this.fromEmail = fromEmail;
  }

  public void sendForgotPasswordOtp(String email, String otp) {
    if (!mailEnabled) {
      LOGGER.info("Đã tạo OTP đặt lại mật khẩu cho {}", maskEmail(email));
      return;
    }

    if (mailSender == null) {
      throw new IllegalStateException("Chưa cấu hình dịch vụ gửi email.");
    }

    if (fromEmail == null || fromEmail.isBlank()) {
      throw new IllegalStateException("Chưa cấu hình email gửi OTP.");
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(email);
    message.setFrom(fromEmail);
    message.setSubject("Mã OTP đặt lại mật khẩu | Vietnam Airlines");
    message.setText(buildForgotPasswordMessage(otp));
    mailSender.send(message);
    LOGGER.info("Đã gửi OTP đặt lại mật khẩu đến {}", maskEmail(email));
  }

  public void sendBookingLookupOtp(String email, String otp, String bookingCode) {
    if (!mailEnabled) {
      LOGGER.info("Đã tạo OTP tra cứu booking {} cho {}", bookingCode, maskEmail(email));
      return;
    }

    if (mailSender == null) {
      throw new IllegalStateException("Chưa cấu hình dịch vụ gửi email.");
    }

    if (fromEmail == null || fromEmail.isBlank()) {
      throw new IllegalStateException("Chưa cấu hình email gửi OTP.");
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(email);
    message.setFrom(fromEmail);
    message.setSubject("Mã OTP tra cứu đặt chỗ " + bookingCode + " | Vietnam Airlines");
    message.setText(buildBookingLookupMessage(otp, bookingCode));
    mailSender.send(message);
    LOGGER.info("Đã gửi OTP tra cứu booking {} đến {}", bookingCode, maskEmail(email));
  }

  private String maskEmail(String email) {
    int atIndex = email.indexOf("@");
    if (atIndex <= 1) {
      return "***" + email.substring(Math.max(0, atIndex));
    }
    return email.substring(0, 1) + "***" + email.substring(atIndex);
  }

  private String buildForgotPasswordMessage(String otp) {
    return """
        Xin chào,

        Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản Vietnam Airlines của bạn.

        Mã OTP của bạn là: %s

        Mã có hiệu lực trong 5 phút. Để đảm bảo an toàn, vui lòng không chia sẻ mã này với bất kỳ ai.

        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.

        Trân trọng,
        Vietnam Airlines
        """.formatted(otp);
  }

  private String buildBookingLookupMessage(String otp, String bookingCode) {
    return """
        Xin chào,

        Chúng tôi đã nhận được yêu cầu xác minh để tra cứu thông tin đặt chỗ %s.

        Mã OTP của bạn là: %s

        Mã có hiệu lực trong 5 phút. Để bảo vệ thông tin hành trình, vui lòng không chia sẻ mã này với bất kỳ ai.

        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.

        Trân trọng,
        Vietnam Airlines
        """.formatted(bookingCode, otp);
  }
}
