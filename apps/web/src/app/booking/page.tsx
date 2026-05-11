import { Suspense } from "react";

import { BookingPageClient } from "@/components/booking-page-client";

function BookingPageFallback() {
  return (
    <section className="section">
      <div className="container">
        <article className="surface-card booking-empty-card">
          <span className="section-eyebrow">Đang tải</span>
          <h1 className="page-title">Đang chuẩn bị biểu mẫu đặt vé</h1>
          <p>Hệ thống đang đồng bộ lựa chọn chuyến bay từ query string.</p>
        </article>
      </div>
    </section>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingPageFallback />}>
      <BookingPageClient />
    </Suspense>
  );
}
