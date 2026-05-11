"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type {
  ApiBookingPassengerInput,
  ApiCreateBookingHoldRequest,
  PassengerType
} from "@qlvmb/shared-types";

import { SectionHeading } from "@/components/section-heading";
import { loadActiveAuthSession } from "@/lib/auth-session";
import { createBookingHold } from "@/lib/booking-api";
import { parseBookingHandoffState, type BookingHandoffSegment } from "@/lib/booking-flow";
import { hienThiTenGoiGia } from "@/lib/display";
import { resolveApiClientErrorMessage } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

interface ContactFormState {
  email: string;
  fullName: string;
  phone: string;
}

interface PassengerFormState {
  dateOfBirth: string;
  documentNumber: string;
  documentType: string;
  fullName: string;
  passengerType: PassengerType;
}

function buildPassengerForms(
  adultCount: number,
  childCount: number,
  infantCount: number
): PassengerFormState[] {
  const passengers: PassengerFormState[] = [];

  const buildGroup = (count: number, passengerType: PassengerType) => {
    for (let index = 0; index < count; index += 1) {
      passengers.push({
        dateOfBirth: "",
        documentNumber: "",
        documentType: passengerType === "infant" ? "Giấy khai sinh" : "CCCD",
        fullName: "",
        passengerType
      });
    }
  };

  buildGroup(adultCount, "adult");
  buildGroup(childCount, "child");
  buildGroup(infantCount, "infant");

  return passengers;
}

function formatPassengerType(passengerType: PassengerType) {
  switch (passengerType) {
    case "adult":
      return "Người lớn";
    case "child":
      return "Trẻ em";
    case "infant":
      return "Em bé";
    default:
      return passengerType;
  }
}

function formatDateTime(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsedDate);
}

function tinhTienCoBan(segments: BookingHandoffSegment[], passengerCount: number) {
  return segments.reduce((tongTien, segment) => tongTien + segment.price * passengerCount, 0);
}

export function BookingPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handoffState = useMemo(
    () => parseBookingHandoffState(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const [contact, setContact] = useState<ContactFormState>({
    email: "",
    fullName: "",
    phone: ""
  });
  const [passengers, setPassengers] = useState<PassengerFormState[]>(() =>
    handoffState
      ? buildPassengerForms(handoffState.adultCount, handoffState.childCount, handoffState.infantCount)
      : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    setAccessToken(loadActiveAuthSession()?.accessToken);
  }, []);

  useEffect(() => {
    if (!handoffState) {
      setPassengers([]);
      return;
    }

    setPassengers(
      buildPassengerForms(
          handoffState.adultCount,
          handoffState.childCount,
          handoffState.infantCount
      )
    );
  }, [handoffState]);

  if (!handoffState) {
    return (
      <section className="section">
        <div className="container">
          <article className="surface-card booking-empty-card">
            <span className="section-eyebrow">Không tìm thấy dữ liệu</span>
            <h1 className="page-title">Không tìm thấy chuyến bay đã chọn</h1>
            <p>Hãy quay lại trang tìm chuyến bay và chọn lại hành trình trước khi nhập thông tin hành khách.</p>
            <Link href="/search" className="button button-primary">
              Quay lại tìm chuyến bay
            </Link>
          </article>
        </div>
      </section>
    );
  }

  const totalPassengerCount = passengers.length;
  const baseAmount = tinhTienCoBan(handoffState.segments, totalPassengerCount);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !handoffState) {
      return;
    }

    const currentHandoffState = handoffState;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: ApiCreateBookingHoldRequest = {
        ancillaries: [],
        contact: {
          email: contact.email.trim(),
          fullName: contact.fullName.trim(),
          phone: contact.phone.trim()
        },
        passengers: passengers.map<ApiBookingPassengerInput>((passenger) => ({
          dateOfBirth: passenger.dateOfBirth,
          documentNumber: passenger.documentNumber.trim(),
          documentType: passenger.documentType.trim(),
          fullName: passenger.fullName.trim(),
          passengerType: passenger.passengerType
        })),
        segments: currentHandoffState.segments.map((segment) => ({
          inventoryId: segment.inventoryId
        })),
        tripType: currentHandoffState.tripType
      };

      const response = await createBookingHold(payload, accessToken);
      router.push(`/booking/${response.bookingCode}/checkout`);
    } catch (error) {
      setSubmitError(resolveApiClientErrorMessage(error, "Không thể giữ chỗ lúc này."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function updatePassenger<FieldName extends keyof PassengerFormState>(
    passengerIndex: number,
    fieldName: FieldName,
    fieldValue: PassengerFormState[FieldName]
  ) {
    setPassengers((currentPassengers) =>
      currentPassengers.map((passenger, index) =>
        index === passengerIndex
          ? {
              ...passenger,
              [fieldName]: fieldValue
            }
          : passenger
      )
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero-card booking-flow-hero">
          <div>
            <span className="section-eyebrow">Đặt vé</span>
            <h1 className="page-title">Nhập thông tin hành khách và giữ chỗ theo chuyến bay đã chọn.</h1>
            <p className="page-hero-copy">
              Luồng này dùng trực tiếp dữ liệu đã chọn từ trang tìm chuyến bay. Khi giữ chỗ thành công,
              hệ thống sẽ tạo mã PNR và chuyển sang bước thanh toán sandbox.
            </p>
          </div>
          <div className="booking-summary-card">
            <span className="pill booking-reference-pill">Giữ chỗ trong 15 phút</span>
            <h3>{handoffState.tripType === "round_trip" ? "Hành trình khứ hồi" : "Hành trình một chiều"}</h3>
            <p>{totalPassengerCount} hành khách • Tổng tiền tạm tính theo hạng vé đã chọn.</p>
            <strong>{formatCurrency(baseAmount)}</strong>
          </div>
        </div>

        <div className="section-gap" />
        <div className="section-split booking-flow-layout">
          <div className="stack-list">
            <SectionHeading
              eyebrow="Chuyến bay đã chọn"
              title="Tóm tắt hành trình"
              description="Thông tin này đi thẳng vào payload giữ chỗ theo inventoryId của từng chặng."
            />
            <div className="stack-list">
              {handoffState.segments.map((segment, index) => (
                <article key={`${segment.inventoryId}-${segment.code}`} className="surface-card booking-segment-card">
                  <div className="result-top">
                    <div>
                      <span className="section-eyebrow">
                        {handoffState.tripType === "round_trip"
                          ? index === 0
                            ? "Chiều đi"
                            : "Chiều về"
                          : "Chặng bay"}
                      </span>
                      <h3>{segment.code}</h3>
                      <p>{segment.from} - {segment.to}</p>
                    </div>
                    <span className="pill">{hienThiTenGoiGia(segment.fareFamily)}</span>
                  </div>
                  <div className="result-grid result-grid-rich">
                    <div>
                      <span>Khởi hành</span>
                      <strong>{formatDateTime(segment.departureAt)}</strong>
                    </div>
                    <div>
                      <span>Hạ cánh</span>
                      <strong>{formatDateTime(segment.arrivalAt)}</strong>
                    </div>
                    <div>
                      <span>Giá mỗi hành khách</span>
                      <strong>{formatCurrency(segment.price)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="stack-list booking-form-wrap">
            <SectionHeading
              eyebrow="Thông tin giữ chỗ"
              title="Người liên hệ và hành khách"
              description="Điền đúng họ tên, giấy tờ và ngày sinh để tránh phát sinh lỗi ở bước xuất vé."
            />
            <form className="surface-card booking-form-card" onSubmit={handleSubmit}>
              <div className="stack-list">
                <div className="booking-form-section">
                  <h3>Người liên hệ</h3>
                  <div className="field-grid">
                    <label className="field">
                      <span>Họ và tên</span>
                      <input
                        required
                        value={contact.fullName}
                        onChange={(event) =>
                          setContact((currentContact) => ({
                            ...currentContact,
                            fullName: event.target.value
                          }))
                        }
                        placeholder="Nguyễn Văn A"
                      />
                    </label>
                    <label className="field">
                      <span>Email</span>
                      <input
                        required
                        type="email"
                        value={contact.email}
                        onChange={(event) =>
                          setContact((currentContact) => ({
                            ...currentContact,
                            email: event.target.value
                          }))
                        }
                        placeholder="ban@example.com"
                      />
                    </label>
                    <label className="field">
                      <span>Số điện thoại</span>
                      <input
                        required
                        value={contact.phone}
                        onChange={(event) =>
                          setContact((currentContact) => ({
                            ...currentContact,
                            phone: event.target.value
                          }))
                        }
                        placeholder="0912345678"
                      />
                    </label>
                  </div>
                </div>

                <div className="booking-form-section">
                  <h3>Danh sách hành khách</h3>
                  <div className="stack-list">
                    {passengers.map((passenger, index) => (
                      <article key={`${passenger.passengerType}-${index}`} className="surface-card booking-passenger-card">
                        <div className="result-top">
                          <div>
                            <span className="section-eyebrow">Hành khách {index + 1}</span>
                            <h3>{formatPassengerType(passenger.passengerType)}</h3>
                          </div>
                          <span className="pill">{passenger.documentType}</span>
                        </div>
                        <div className="field-grid">
                          <label className="field">
                            <span>Họ và tên</span>
                            <input
                              required
                              value={passenger.fullName}
                              onChange={(event) => updatePassenger(index, "fullName", event.target.value)}
                              placeholder="Nhập đúng theo giấy tờ"
                            />
                          </label>
                          <label className="field">
                            <span>Ngày sinh</span>
                            <input
                              required
                              type="date"
                              value={passenger.dateOfBirth}
                              onChange={(event) => updatePassenger(index, "dateOfBirth", event.target.value)}
                            />
                          </label>
                          <label className="field">
                            <span>Loại giấy tờ</span>
                            <select
                              value={passenger.documentType}
                              onChange={(event) => updatePassenger(index, "documentType", event.target.value)}
                            >
                              <option value="CCCD">CCCD</option>
                              <option value="Hộ chiếu">Hộ chiếu</option>
                              <option value="Giấy khai sinh">Giấy khai sinh</option>
                            </select>
                          </label>
                          <label className="field">
                            <span>Số giấy tờ</span>
                            <input
                              required
                              value={passenger.documentNumber}
                              onChange={(event) => updatePassenger(index, "documentNumber", event.target.value)}
                              placeholder="Nhập số giấy tờ"
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              {submitError ? (
                <article className="surface-card booking-inline-error">
                  <strong>Không thể giữ chỗ</strong>
                  <p>{submitError}</p>
                </article>
              ) : null}

              <div className="booking-submit-row">
                <div>
                  <span className="section-eyebrow">Tổng tiền tạm tính</span>
                  <strong className="booking-total-amount">{formatCurrency(baseAmount)}</strong>
                </div>
                <button type="submit" className="button button-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Tiếp tục / Giữ chỗ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isSubmitting ? (
        <div className="booking-processing-overlay" role="status" aria-live="polite">
          <div className="surface-card booking-processing-card">
            <span className="section-eyebrow">Đang xử lý</span>
            <h3>Đang tạo giữ chỗ</h3>
            <p>Hệ thống đang khóa ghế và tạo mã PNR cho lựa chọn hiện tại.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
