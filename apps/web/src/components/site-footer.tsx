import Image from "next/image";
import Link from "next/link";

import { footerSections } from "@/lib/public-content";

const footerHighlights = [
  "Tổng đài hỗ trợ 1900 6868",
  "Tra cứu đặt chỗ và làm thủ tục mọi lúc",
  "Thông báo chuyến bay và hỗ trợ sau bán luôn sẵn sàng"
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-intro">
        <div className="footer-brand">
          <span className="footer-brand-logo">
            <Image
              src="/images/logo-vietnamairlines.jpg"
              alt="Logo Vietnam Airlines"
              width={1086}
              height={159}
              sizes="(max-width: 640px) 260px, 360px"
              unoptimized
            />
          </span>
          <div>
            <p>
              Hãng hàng không nội địa với dịch vụ đặt vé, quản lý hành trình,
              hỗ trợ hành khách và vận hành khai thác được kết nối liền mạch.
            </p>
          </div>
        </div>
        <div className="footer-highlight-list">
          {footerHighlights.map((item) => (
            <span key={item} className="assurance-chip">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="container footer-grid">
        {footerSections.map((column) => (
          <section key={column.title} className="footer-section">
            <h3>{column.title}</h3>
            <ul className="footer-links">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="container footer-legal">
        <span>
          © 2026 Vietnam Airlines. Hỗ trợ thanh toán, đổi hoặc hoàn và theo dõi tình
          trạng chuyến bay trên cùng một cổng dịch vụ.
        </span>
        <span>
          Phục vụ đặt vé, quản lý hành trình và khai thác các đường bay nội địa.
        </span>
      </div>
    </footer>
  );
}
