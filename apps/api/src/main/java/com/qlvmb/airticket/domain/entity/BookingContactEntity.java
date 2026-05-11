package com.qlvmb.airticket.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "booking_contact")
public class BookingContactEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "booking_id", nullable = false, unique = true)
  private BookingEntity booking;

  @Column(name = "full_name", nullable = false, length = 160)
  private String fullName;

  @Column(nullable = false, length = 160)
  private String email;

  @Column(nullable = false, length = 20)
  private String phone;

  protected BookingContactEntity() {
  }

  public static BookingContactEntity create(
      BookingEntity booking,
      String fullName,
      String email,
      String phone
  ) {
    BookingContactEntity contact = new BookingContactEntity();
    contact.booking = booking;
    contact.fullName = fullName;
    contact.email = email;
    contact.phone = phone;
    return contact;
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

  public String getEmail() {
    return email;
  }

  public String getPhone() {
    return phone;
  }
}
