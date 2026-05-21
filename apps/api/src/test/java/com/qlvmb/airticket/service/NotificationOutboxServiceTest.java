package com.qlvmb.airticket.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qlvmb.airticket.domain.dto.NotificationOutboxResponse;
import com.qlvmb.airticket.domain.entity.AirportEntity;
import com.qlvmb.airticket.domain.entity.BookingContactEntity;
import com.qlvmb.airticket.domain.entity.BookingEntity;
import com.qlvmb.airticket.domain.entity.FlightEntity;
import com.qlvmb.airticket.domain.entity.NotificationOutboxEntity;
import com.qlvmb.airticket.repository.NotificationOutboxRepository;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class NotificationOutboxServiceTest {

  @Mock
  private NotificationOutboxRepository notificationOutboxRepository;

  @Mock
  private JavaMailSender mailSender;

  private NotificationOutboxService notificationOutboxService;

  @BeforeEach
  void setUp() {
    notificationOutboxService = new NotificationOutboxService(
        notificationOutboxRepository,
        mailSender,
        false,
        "support@airplane.id.vn"
    );
  }

  @Test
  void createAndSendTicketEmail_shouldMarkFailedWhenMailDisabled() {
    ArgumentCaptor<NotificationOutboxEntity> outboxCaptor = ArgumentCaptor.forClass(NotificationOutboxEntity.class);
    when(notificationOutboxRepository.save(any(NotificationOutboxEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    NotificationOutboxResponse response = notificationOutboxService.createAndSendTicketEmail(
        createBooking("QC5004", "quanpm2006git@gmail.com")
    );

    verify(notificationOutboxRepository).save(outboxCaptor.capture());
    assertThat(response.status()).isEqualTo(NotificationOutboxEntity.STATUS_FAILED);
    assertThat(response.lastError()).isEqualTo("Chưa bật cấu hình gửi email.");
    assertThat(outboxCaptor.getValue().getStatus()).isEqualTo(NotificationOutboxEntity.STATUS_FAILED);
  }

  @Test
  void createAndSendTicketEmail_shouldUseProductSubjectAndBody() {
    ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    notificationOutboxService = new NotificationOutboxService(
        notificationOutboxRepository,
        mailSender,
        true,
        "support@airplane.id.vn"
    );
    when(notificationOutboxRepository.save(any(NotificationOutboxEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    NotificationOutboxResponse response = notificationOutboxService.createAndSendTicketEmail(
        createBooking("QC5004", "quanpm2006git@gmail.com")
    );

    verify(mailSender).send(messageCaptor.capture());
    assertThat(response.status()).isEqualTo(NotificationOutboxEntity.STATUS_SENT);
    assertThat(messageCaptor.getValue().getSubject())
        .isEqualTo("Vé điện tử cho mã đặt chỗ QC5004 | Vietnam Airlines");
    assertThat(messageCaptor.getValue().getText())
        .contains("Chúng tôi xác nhận mã đặt chỗ QC5004 đã thanh toán thành công")
        .contains("Vui lòng lưu lại email này để xuất trình khi cần tra cứu")
        .contains("Trân trọng,")
        .contains("Vietnam Airlines");
  }

  @Test
  void createAndSendFlightCancellationEmail_shouldUseProductSubjectAndBody() {
    ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    notificationOutboxService = new NotificationOutboxService(
        notificationOutboxRepository,
        mailSender,
        true,
        "support@airplane.id.vn"
    );
    when(notificationOutboxRepository.save(any(NotificationOutboxEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    NotificationOutboxResponse response = notificationOutboxService.createAndSendFlightCancellationEmail(
        createBooking("QC5004", "quanpm2006git@gmail.com"),
        createFlight("VN123", "Hà Nội", "TP Hồ Chí Minh"),
        "Chuyến bay được điều chỉnh do yêu cầu vận hành."
    );

    verify(mailSender).send(messageCaptor.capture());
    assertThat(response.status()).isEqualTo(NotificationOutboxEntity.STATUS_SENT);
    assertThat(messageCaptor.getValue().getSubject())
        .isEqualTo("Cập nhật hành trình cho mã đặt chỗ QC5004 | Vietnam Airlines");
    assertThat(messageCaptor.getValue().getText())
        .contains("Chúng tôi rất tiếc phải thông báo chuyến bay VN123")
        .contains("Chuyến bay được điều chỉnh do yêu cầu vận hành.")
        .contains("Trân trọng,")
        .contains("Vietnam Airlines");
  }

  @Test
  void retryNotification_shouldSanitizeMailDeliveryFailure() {
    OffsetDateTime currentTime = OffsetDateTime.parse("2026-05-17T14:30:00Z");
    NotificationOutboxEntity outbox = NotificationOutboxEntity.createTicketEmail(
        "QC5004",
        "quanpm2006git@gmail.com",
        "Vé điện tử cho mã đặt chỗ QC5004 | Vietnam Airlines",
        "Nội dung",
        currentTime
    );
    ReflectionTestUtils.setField(outbox, "id", 9L);

    notificationOutboxService = new NotificationOutboxService(
        notificationOutboxRepository,
        mailSender,
        true,
        "support@airplane.id.vn"
    );

    when(notificationOutboxRepository.findById(9L)).thenReturn(Optional.of(outbox));
    doThrow(new MailSendException("smtp timeout"))
        .when(mailSender)
        .send(any(SimpleMailMessage.class));

    NotificationOutboxResponse response = notificationOutboxService.retryNotification(9L);

    assertThat(response.status()).isEqualTo(NotificationOutboxEntity.STATUS_FAILED);
    assertThat(response.lastError()).isEqualTo("Không thể gửi email tới hộp thư người nhận lúc này.");
    assertThat(response.retryCount()).isEqualTo(1);
  }

  private BookingEntity createBooking(String bookingCode, String email) {
    OffsetDateTime currentTime = OffsetDateTime.parse("2026-05-17T14:00:00Z");
    BookingEntity booking = BookingEntity.createHold(
        bookingCode,
        "one_way",
        1490000L,
        0L,
        1490000L,
        "VND",
        currentTime,
        currentTime.plusMinutes(15)
    );
    booking.assignContact(BookingContactEntity.create(
        booking,
        "Khách hàng thử nghiệm",
        email,
        "0900000001"
    ));
    return booking;
  }

  private FlightEntity createFlight(String code, String originCityName, String destinationCityName) {
    FlightEntity flight = mock(FlightEntity.class);
    AirportEntity originAirport = mock(AirportEntity.class);
    AirportEntity destinationAirport = mock(AirportEntity.class);

    when(flight.getCode()).thenReturn(code);
    when(flight.getOriginAirport()).thenReturn(originAirport);
    when(flight.getDestinationAirport()).thenReturn(destinationAirport);
    when(flight.getDepartureAt()).thenReturn(OffsetDateTime.parse("2026-06-01T08:30:00Z"));
    when(originAirport.getCityName()).thenReturn(originCityName);
    when(destinationAirport.getCityName()).thenReturn(destinationCityName);

    return flight;
  }
}
