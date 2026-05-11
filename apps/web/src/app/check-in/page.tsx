import { Suspense } from "react";

import { CheckInPageClient } from "@/components/check-in-page-client";

function CheckInFallback() {
  return (
    <section className="section">
      <div className="container">
        <article className="surface-card booking-empty-card">
          <span className="section-eyebrow">Đang tải</span>
          <h1 className="page-title">Đang chuẩn bị làm thủ tục trực tuyến</h1>
          <p>Hệ thống đang đọc tham số PNR và tải dữ liệu ticket từ backend.</p>
        </article>
      </div>
    </section>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<CheckInFallback />}>
      <CheckInPageClient />
    </Suspense>
  );
}
