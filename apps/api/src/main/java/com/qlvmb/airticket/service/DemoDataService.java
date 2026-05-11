package com.qlvmb.airticket.service;

import com.qlvmb.airticket.domain.dto.AdminDashboardResponse;
import com.qlvmb.airticket.domain.dto.AuthSummaryResponse;
import com.qlvmb.airticket.domain.dto.BookingOverviewResponse;
import com.qlvmb.airticket.domain.dto.CmsHomepageResponse;
import com.qlvmb.airticket.domain.dto.CustomerOverviewResponse;
import com.qlvmb.airticket.domain.dto.FlightSearchResponse;
import com.qlvmb.airticket.domain.dto.SupportOverviewResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DemoDataService {

  public AuthSummaryResponse getAuthSummary() {
    return new AuthSummaryResponse(
        List.of(
            new AuthSummaryResponse.RoleItem(
                "customer_support",
                "Nhân viên chăm sóc khách hàng",
                List.of(
                    "Tra cứu booking có xác minh",
                    "Bán vé hộ, hỗ trợ sau bán, hoàn tiền",
                    "Quản lý nội dung hỗ trợ và bù dịch vụ"
                )
            ),
            new AuthSummaryResponse.RoleItem(
                "operations_staff",
                "Nhân viên vận hành",
                List.of(
                    "Quản lý giá, lịch bay, tồn ghế",
                    "Mở hoặc đóng bán chặng",
                    "Kiểm soát cấu hình và nhật ký hệ thống"
                )
            )
        ),
        List.of(
            "Khách vãng lai không được vào backoffice.",
            "Nhân viên chăm sóc khách hàng không được đổi lịch bay tổng hoặc sửa giá gốc.",
            "Nhân viên vận hành không xem dữ liệu thẻ thanh toán đầy đủ."
        )
    );
  }

  public CustomerOverviewResponse getCustomerOverview() {
    return new CustomerOverviewResponse(
        "Nguyễn Minh Anh",
        "Hạng Vàng",
        12480,
        List.of(
            "AA215 • SGN → HAN • 20/03/2026",
            "AA330 • HAN → DAD • 23/03/2026"
        ),
        List.of(
            "Booking A6C2P1 đã thanh toán và gửi email.",
            "Check-in cho AA215 sẽ mở sau 12 giờ nữa."
        )
    );
  }

  public FlightSearchResponse searchFlights(String from, String to, String tripType) {
    List<FlightSearchResponse.FlightCard> outboundFlights = List.of(
        new FlightSearchResponse.FlightCard(
            20101L,
            201L,
            "AA201",
            "Thanh pho Ho Chi Minh",
            "Ha Noi",
            from,
            to,
            "2026-03-20T06:10:00+07:00",
            "2026-03-20T08:20:00+07:00",
            "06:10",
            "08:20",
            "2 gio 10 phut",
            "on_time",
            "pho_thong_tiet_kiem",
            1490000L,
            8L
        ),
        new FlightSearchResponse.FlightCard(
            20102L,
            215L,
            "AA215",
            "Thanh pho Ho Chi Minh",
            "Ha Noi",
            from,
            to,
            "2026-03-20T09:45:00+07:00",
            "2026-03-20T11:55:00+07:00",
            "09:45",
            "11:55",
            "2 gio 10 phut",
            "boarding",
            "pho_thong_linh_hoat",
            1890000L,
            5L
        ),
        new FlightSearchResponse.FlightCard(
            20103L,
            233L,
            "AA233",
            "Thanh pho Ho Chi Minh",
            "Ha Noi",
            from,
            to,
            "2026-03-20T18:20:00+07:00",
            "2026-03-20T20:35:00+07:00",
            "18:20",
            "20:35",
            "2 gio 15 phut",
            "scheduled",
            "thuong_gia",
            3490000L,
            3L
        )
    );

    List<FlightSearchResponse.FareCard> fares = List.of(
        new FlightSearchResponse.FareCard(
            "pho_thong_tiet_kiem",
            "Pho thong tiet kiem",
            1490000L,
            List.of("7kg hanh ly xach tay", "Doi ve co phi", "Ghe tinh phi")
        ),
        new FlightSearchResponse.FareCard(
            "pho_thong_linh_hoat",
            "Pho thong linh hoat",
            1890000L,
            List.of("1 kien 23kg", "Doi ve it phi hon", "Giu gia 24 gio")
        ),
        new FlightSearchResponse.FareCard(
            "thuong_gia",
            "Thuong gia",
            3490000L,
            List.of("2 kien 32kg", "Phong cho", "Hoan doi linh hoat")
        )
    );

    FlightSearchResponse.SearchCriteria criteria = new FlightSearchResponse.SearchCriteria(
        from,
        to,
        "2026-03-20",
        "round_trip".equals(tripType) ? "2026-03-23" : null,
        tripType,
        null,
        1,
        0,
        0
    );

    return new FlightSearchResponse(
        tripType,
        from,
        to,
        List.of("Gio bay", "Goi gia", "Ngan sach", "Con ghe"),
        outboundFlights,
        fares,
        criteria,
        outboundFlights,
        List.of()
    );
  }

  public BookingOverviewResponse getBookingOverview(String bookingCode) {
    return new BookingOverviewResponse(
        bookingCode,
        "held",
        "2026-03-11T14:15:00+07:00",
        List.of(
            "Chọn chuyến bay",
            "Thông tin hành khách",
            "Dịch vụ bổ trợ",
            "Thanh toán & xuất vé"
        ),
        List.of(
            new BookingOverviewResponse.AncillaryItem(
                "SEAT_PLUS",
                "Ghế hàng đầu",
                "Thêm chỗ duỗi chân và ưu tiên xuống tàu.",
                320000
            ),
            new BookingOverviewResponse.AncillaryItem(
                "BAG_23",
                "Hành lý 23kg",
                "Cho phép mua trước thanh toán hoặc sau đặt chỗ.",
                290000
            )
        ),
        List.of("QR ngân hàng", "Thẻ", "Ví điện tử")
    );
  }

  public SupportOverviewResponse getSupportOverview() {
    return new SupportOverviewResponse(
        List.of(
            new SupportOverviewResponse.TicketCard(
                "TK-2401",
                "Yêu cầu hoàn vé do delay hơn 4 giờ",
                "escalated",
                "Còn 25 phút"
            ),
            new SupportOverviewResponse.TicketCard(
                "TK-2402",
                "Cập nhật họ tên sau xuất vé",
                "open",
                "Còn 1 giờ 40 phút"
            )
        ),
        List.of(
            "Tôi có thể đổi chuyến sau khi đã thanh toán không?",
            "Nếu callback thanh toán về trễ thì sao?",
            "Chatbot có thể chuyển tôi sang CSKH không?"
        ),
        List.of("1900 6868", "support@vietnam-airlines.vn", "Chatbot widget")
    );
  }

  public CmsHomepageResponse getCmsHomepage() {
    return new CmsHomepageResponse(
        List.of(
            new CmsHomepageResponse.HeroBanner(
                "Bay sớm đến Đà Nẵng với combo ghế + hành lý",
                "Chiến dịch mùa hè cho khách nội địa",
                "Xem ưu đãi",
                "vi"
            ),
            new CmsHomepageResponse.HeroBanner(
                "Summer routes with baggage bundles",
                "Localized promo block ready for English",
                "Explore now",
                "en"
            )
        ),
        List.of(
            new CmsHomepageResponse.ContentCard(
                "Cẩm nang đi Nội Bài gọn trong 10 phút đọc",
                "Cẩm nang",
                "Mô tả luồng check-in, hành lý và lối vào nhanh cho khách công tác.",
                "vi"
            ),
            new CmsHomepageResponse.ContentCard(
                "How flexible fares work for post-booking changes",
                "Guide",
                "Support content wired to self-service and chatbot.",
                "en"
            )
        ),
        List.of(
            new CmsHomepageResponse.ContentCard(
                "Tôi có thể đổi chuyến sau khi thanh toán không?",
                "FAQ",
                "Có. Hệ thống sẽ kiểm tra gói giá và chênh lệch trước khi xác nhận.",
                "vi"
            ),
            new CmsHomepageResponse.ContentCard(
                "Can I check in online 24 hours before departure?",
                "FAQ",
                "Yes. Online check-in opens 24 hours before and closes 60 minutes before.",
                "en"
            )
        )
    );
  }

  public AdminDashboardResponse getAdminDashboard() {
    return new AdminDashboardResponse(
        List.of(
            new AdminDashboardResponse.MetricCard(
                "Doanh thu hôm nay",
                "3,48 tỷ",
                "+12% so với hôm qua"
            ),
            new AdminDashboardResponse.MetricCard(
                "Tỉ lệ chuyển đổi",
                "4,8%",
                "+0,6 điểm"
            ),
            new AdminDashboardResponse.MetricCard(
                "Booking giữ chỗ",
                "126",
                "37 mã còn dưới 5 phút"
            )
        ),
        List.of(
            new AdminDashboardResponse.ModuleCard(
                "sales",
                "Bán vé nội bộ",
                "Tạo booking hộ, giữ chỗ và xuất lại vé.",
                List.of("customer_support")
            ),
            new AdminDashboardResponse.ModuleCard(
                "operations",
                "Điều hành chuyến bay",
                "Quản lý giá, lịch bay, tồn ghế, delay hoặc cancel và khóa bán.",
                List.of("operations_staff")
            ),
            new AdminDashboardResponse.ModuleCard(
                "cms",
                "Nội dung hỗ trợ",
                "Banner, FAQ, cẩm nang và nội dung song ngữ phục vụ khách hàng.",
                List.of("customer_support")
            )
        ),
        List.of(
            new AdminDashboardResponse.AuditCard(
                "ops.huyen",
                "Cập nhật rule hoàn vé",
                "FareRule: Phổ thông linh hoạt",
                "11/03 09:12"
            ),
            new AdminDashboardResponse.AuditCard(
                "ops.khoa",
                "Đổi trạng thái chuyến bay",
                "AA330 -> delayed",
                "11/03 08:41"
            )
        )
    );
  }
}
