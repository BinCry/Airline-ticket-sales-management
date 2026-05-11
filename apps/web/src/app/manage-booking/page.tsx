import { Suspense } from "react";

import { ManageBookingPageClient } from "@/components/manage-booking-page-client";

function ManageBookingFallback() {
  return (
    <section className="section">
      <div className="container">
        <article className="surface-card booking-empty-card">
          <span className="section-eyebrow">Đang tải</span>
          <h1 className="page-title">Đang chuẩn bị tra cứu đặt chỗ</h1>
          <p>Hệ thống đang đọc tham số PNR và đồng bộ dữ liệu cần hiển thị.</p>
        </article>
      </div>
    </section>
  );
}

export default function ManageBookingPage() {
  return (
    <Suspense fallback={<ManageBookingFallback />}>
      <ManageBookingPageClient />
    </Suspense>
  );
}
