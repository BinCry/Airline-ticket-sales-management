"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { ApiPaymentSessionResponse } from "@qlvmb/shared-types";

import { SectionHeading } from "@/components/section-heading";
import { resolveApiClientErrorMessage } from "@/lib/api-client";
import { loadActiveAuthSession } from "@/lib/auth-session";
import { createPaymentSession, submitSandboxPayment } from "@/lib/booking-api";
import { pushToast } from "@/lib/toast";

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

export default function BookingCheckoutPage() {
  const params = useParams<{ pnr: string }>();
  const router = useRouter();
  const [bookingCode, setBookingCode] = useState("");
  const [session, setSession] = useState<ApiPaymentSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (params?.pnr) {
      setBookingCode(params.pnr.trim().toUpperCase());
    }
  }, [params]);

  useEffect(() => {
    setAccessToken(loadActiveAuthSession()?.accessToken);
  }, []);

  useEffect(() => {
    if (!bookingCode) {
      return;
    }

    let isMounted = true;

    async function initSession() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextSession = await createPaymentSession(bookingCode, accessToken);
        if (!isMounted) {
          return;
        }
        setSession(nextSession);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setSession(null);
        setErrorMessage(resolveApiClientErrorMessage(error, "Không thể khởi tạo phiên thanh toán."));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, bookingCode]);

  async function handleSandboxPayment() {
    if (!bookingCode || isPaying) {
      return;
    }

    setIsPaying(true);
    setErrorMessage(null);

    try {
      await submitSandboxPayment(
        {
          bookingCode,
          result: "success"
        },
        accessToken
      );

      pushToast({
        message: "Thanh toán thành công.",
        title: "Đã xuất vé",
        tone: "success"
      });

      router.replace(`/manage-booking?bookingCode=${encodeURIComponent(bookingCode)}`);
    } catch (error) {
      setErrorMessage(resolveApiClientErrorMessage(error, "Không thể xác nhận thanh toán."));
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero-card booking-flow-hero">
          <div>
            <span className="section-eyebrow">Thanh toán sandbox</span>
            <h1 className="page-title">Xác nhận thanh toán cho mã đặt chỗ {bookingCode || "..."}</h1>
            <p className="page-hero-copy">
              Trang này khởi tạo phiên thanh toán giả lập, sau đó gọi callback backend để chuyển
              trạng thái từ giữ chỗ sang xuất vé.
            </p>
          </div>
          <div className="booking-summary-card">
            <span className="pill booking-reference-pill">Bước thanh toán</span>
            <h3>{session?.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}</h3>
            <p>{session ? `Hết hạn lúc ${formatDateTime(session.expiresAt)}` : "Đang đồng bộ phiên thanh toán."}</p>
            <strong>{session?.paymentUrl ?? "/payment-sandbox"}</strong>
          </div>
        </div>

        <div className="section-gap" />
        <div className="section-split booking-flow-layout">
          <div className="stack-list">
            <SectionHeading
              eyebrow="Phiên thanh toán"
              title="Thông tin từ API sandbox"
              description="Mỗi lần bấm nút thanh toán sẽ gửi callback về backend để xuất vé cho booking."
            />
            <article className="surface-card booking-payment-card">
              {isLoading ? (
                <>
                  <span className="section-eyebrow">Đang tải</span>
                  <h3>Đang khởi tạo phiên thanh toán...</h3>
                  <p>Vui lòng chờ trong giây lát để hệ thống kiểm tra hạn giữ chỗ.</p>
                </>
              ) : errorMessage ? (
                <>
                  <span className="section-eyebrow">Không thể tải dữ liệu</span>
                  <h3>Không thể khởi tạo phiên thanh toán</h3>
                  <p>{errorMessage}</p>
                </>
              ) : session ? (
                <>
                  <div className="result-grid result-grid-rich">
                    <div>
                      <span>Mã PNR</span>
                      <strong>{session.bookingCode}</strong>
                    </div>
                    <div>
                      <span>Trạng thái</span>
                      <strong>{session.paymentStatus}</strong>
                    </div>
                    <div>
                      <span>Hết hạn giữ chỗ</span>
                      <strong>{formatDateTime(session.expiresAt)}</strong>
                    </div>
                  </div>
                  <div className="booking-submit-row">
                    <div>
                      <span className="section-eyebrow">URL sandbox</span>
                      <strong className="booking-total-amount">{session.paymentUrl}</strong>
                    </div>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={handleSandboxPayment}
                      disabled={isPaying}
                    >
                      {isPaying ? "Đang xác nhận..." : "Thanh toán (Sandbox)"}
                    </button>
                  </div>
                </>
              ) : null}
            </article>
          </div>

          <div className="stack-list">
            <SectionHeading
              eyebrow="Đi tiếp"
              title="Sau khi callback thành công"
              description="Hệ thống sẽ tạo ticket cho từng hành khách và chuyển bạn sang trang quản lý đặt chỗ."
            />
            <article className="surface-card booking-payment-card">
              <h3>Quản lý đặt chỗ thật</h3>
              <p>
                Sau khi thanh toán thành công, trang quản lý đặt chỗ sẽ hiển thị trạng thái vé,
                danh sách hành khách và ticket đã tạo từ dữ liệu backend.
              </p>
              <Link href="/manage-booking" className="button button-secondary">
                Mở trang quản lý đặt chỗ
              </Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
