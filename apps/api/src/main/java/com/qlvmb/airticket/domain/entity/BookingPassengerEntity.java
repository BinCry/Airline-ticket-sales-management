package com.qlvmb.airticket.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "booking_passenger")
public class BookingPassengerEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "booking_id", nullable = false)
  private BookingEntity booking;

  @Column(name = "full_name", nullable = false, length = 160)
  private String fullName;

  @Column(name = "passenger_type", nullable = false, length = 16)
  private String passengerType;

  @Column(name = "date_of_birth", nullable = false)
  private LocalDate dateOfBirth;

  @Column(name = "document_type", nullable = false, length = 32)
  private String documentType;

  @Column(name = "document_number", nullable = false, length = 64)
  private String documentNumber;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected BookingPassengerEntity() {
  }

  public static BookingPassengerEntity create(
      BookingEntity booking,
      String fullName,
      String passengerType,
      LocalDate dateOfBirth,
      String documentType,
      String documentNumber,
      OffsetDateTime createdAt
  ) {
    BookingPassengerEntity passenger = new BookingPassengerEntity();
    passenger.booking = booking;
    passenger.fullName = fullName;
    passenger.passengerType = passengerType;
    passenger.dateOfBirth = dateOfBirth;
    passenger.documentType = documentType;
    passenger.documentNumber = documentNumber;
    passenger.createdAt = createdAt;
    return passenger;
  }

  public Long getId() {
    return id;
  }

  public BookingEntity getBooking() {
    return booking;
  }

  public String getFullName() {
    return fullName;
  }

  public String getPassengerType() {
    return passengerType;
  }

  public LocalDate getDateOfBirth() {
    return dateOfBirth;
  }

  public String getDocumentType() {
    return documentType;
  }

  public String getDocumentNumber() {
    return documentNumber;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }
}
