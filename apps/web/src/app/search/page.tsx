import Image from "next/image";
import Link from "next/link";

import type { ApiFlightCard, ApiFlightSearchCriteria, ApiFlightSearchResponse } from "@qlvmb/shared-types";

import { SectionHeading } from "@/components/section-heading";
import { StatusChip } from "@/components/status-chip";
import {
  createBookingHandoffUrl,
  createHandoffSegmentFromFlight
} from "@/lib/booking-flow";
import { hienThiHanhTrinh, hienThiTenGoiGia } from "@/lib/display";
import {
  FlightSearchApiError,
  chuanHoaTieuChiTimChuyenBay,
  fetchFlightSearch,
  taoDuongDanTimChuyenBay
} from "@/lib/flight-search-api";
import { formatCurrency } from "@/lib/format";

const toneMap = {
  scheduled: "neutral",
  on_time: "success",
  boarding: "info",
  delayed: "warning",
  departed: "neutral",
  landed: "success",
  cancelled: "danger"
} as const;

const labelMap = {
  scheduled: "Lên lịch",
  on_time: "Đúng giờ",
  boarding: "Đang lên máy bay",
  delayed: "Trễ",
  departed: "Đã khởi hành",
  landed: "Đã hạ cánh",
  cancelled: "Hủy"
} as const;

const filterBlocks = ["Giờ bay", "Gói giá", "Ngân sách", "Còn ghế"];

const fareImageMap = {
  pho_thong_tiet_kiem: {
    src: "/images/pho-thong-tiet-kiem-vietnam-airline-3.jpg",
    alt: "Hình minh họa cho gói phổ thông tiết kiệm"
  },
  pho_thong_linh_hoat: {
    src: "/images/phothonglinhhoat-classess.jpg",
    alt: "Hình minh họa cho gói phổ thông linh hoạt"
  },
  thuong_gia: {
    src: "/images/thuonggia-classess.jpg",
    alt: "Hình minh họa cho gói thương gia"
  }
} as const;

interface SearchPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function hienThiKhungNgay(criteria: ApiFlightSearchCriteria): string {
  if (criteria.tripType === "one_way" || !criteria.returnDate) {
    return criteria.departureDate;
  }

  return `${criteria.departureDate} - ${criteria.returnDate}`;
}

function hienThiTrangThaiLocGoiGia(criteria: ApiFlightSearchCriteria): string {
  if (!criteria.fareFamily) {
    return "Tất cả hạng vé";
  }

  return hienThiTenGoiGia(criteria.fareFamily);
}

function taoDuongDanChonChieuDi(
  criteria: ApiFlightSearchCriteria,
  flight: ApiFlightCard
) {
  const basePath = taoDuongDanTimChuyenBay(criteria);
  const [pathname, queryString] = basePath.split("?");
  const nextSearchParams = new URLSearchParams(queryString ?? "");
  nextSearchParams.set("selectedOutbound", String(flight.inventoryId));
  return `${pathname}?${nextSearchParams.toString()}`;
}

function taoDuongDanDatVe(
  criteria: ApiFlightSearchCriteria,
  flights: ApiFlightCard[]
) {
  return createBookingHandoffUrl(
    criteria,
    flights.map((flight) => createHandoffSegmentFromFlight(flight))
  );
}

function taoNutDatVe(
  criteria: ApiFlightSearchCriteria,
  tieuDe: string,
  flight: ApiFlightCard,
  selectedOutboundFlight: ApiFlightCard | null
) {
  if (criteria.tripType === "one_way") {
    return (
      <Link href={taoDuongDanDatVe(criteria, [flight])} className="button button-primary">
        Chọn chuyến này
      </Link>
    );
  }

  if (tieuDe === "Chặng đi") {
    const isSelected = selectedOutboundFlight?.inventoryId === flight.inventoryId;
    return (
      <Link
        href={taoDuongDanChonChieuDi(criteria, flight)}
        className={`button ${isSelected ? "button-secondary" : "button-primary"}`}
      >
        {isSelected ? "Đã chọn chiều đi" : "Chọn chiều đi"}
      </Link>
    );
  }

  if (!selectedOutboundFlight) {
    return (
      <button type="button" className="button button-secondary" disabled>
        Chọn chiều đi trước
      </button>
    );
  }

  return (
    <Link
      href={taoDuongDanDatVe(criteria, [selectedOutboundFlight, flight])}
      className="button button-primary"
    >
      Chọn chiều về
    </Link>
  );
}

function taoTheKetQua(
  tieuDe: string,
  flights: ApiFlightCard[],
  criteria: ApiFlightSearchCriteria,
  selectedOutboundFlight: ApiFlightCard | null
) {
  const selectedNotice = criteria.tripType === "round_trip" && tieuDe === "Chặng về" && selectedOutboundFlight
    ? `Chiều đi đã chọn: ${selectedOutboundFlight.code} • ${selectedOutboundFlight.departureTime} - ${selectedOutboundFlight.arrivalTime}`
    : null;

  return (
    <div className="stack-list">
      <div className="surface-card result-card">
        <div className="result-top">
          <div>
            <span className="section-eyebrow">{tieuDe}</span>
            <h3>{flights.length} chuyến bay phù hợp</h3>
            <p>
              {selectedNotice ??
                "Danh sách được lấy trực tiếp từ tồn ghế và lịch bay hiện có của backend."}
            </p>
          </div>
        </div>
      </div>

      {flights.length > 0 ? (
        flights.map((flight) => (
          <article key={`${tieuDe}-${flight.inventoryId}`} className="surface-card result-card">
            <div className="result-top">
              <div>
                <span className="section-eyebrow">Chuyến bay {flight.code}</span>
                <h3>{hienThiHanhTrinh(flight.from, flight.to)}</h3>
                <p>{flight.duration}</p>
              </div>
              <StatusChip
                tone={toneMap[flight.status]}
                label={labelMap[flight.status]}
              />
            </div>

            <div className="result-timeline">
              <div className="timeline-stop">
                <span>Khởi hành</span>
                <strong>{flight.departureTime}</strong>
              </div>
              <div className="timeline-line" />
              <div className="timeline-stop">
                <span>Hạ cánh</span>
                <strong>{flight.arrivalTime}</strong>
              </div>
            </div>

            <div className="result-grid result-grid-rich">
              <div>
                <span>Gói giá</span>
                <strong>{hienThiTenGoiGia(flight.fareFamily)}</strong>
              </div>
              <div>
                <span>Còn lại</span>
                <strong>{flight.seatsLeft} ghế</strong>
              </div>
              <div>
                <span>Giá từ</span>
                <strong>{formatCurrency(flight.price)}</strong>
              </div>
            </div>

            <div className="result-actions">
              <div className="assurance-row">
                <span className="assurance-chip">Giữ chỗ 15 phút</span>
                <span className="assurance-chip">Hiển thị điều kiện đổi hoặc hoàn</span>
              </div>
              {taoNutDatVe(criteria, tieuDe, flight, selectedOutboundFlight)}
            </div>
          </article>
        ))
      ) : (
        <article className="surface-card result-card">
          <div className="result-top">
            <div>
              <span className="section-eyebrow">{tieuDe}</span>
              <h3>Không tìm thấy chuyến bay phù hợp</h3>
              <p>Hãy thử đổi ngày bay, tuyến hoặc gói giá để xem thêm kết quả.</p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const criteria = chuanHoaTieuChiTimChuyenBay(resolvedSearchParams);
  const selectedOutboundInventoryId = Number.parseInt(
    Array.isArray(resolvedSearchParams.selectedOutbound)
      ? resolvedSearchParams.selectedOutbound[0] ?? ""
      : resolvedSearchParams.selectedOutbound ?? "",
    10
  );

  let searchData: ApiFlightSearchResponse | null = null;
  let searchError: string | null = null;

  try {
    searchData = await fetchFlightSearch(criteria);
  } catch (error) {
    searchError = error instanceof FlightSearchApiError
      ? error.message
      : "Không tải được dữ liệu tìm chuyến bay lúc này.";
  }

  const outboundFlights = searchData?.outboundFlights ?? [];
  const returnFlights = searchData?.returnFlights ?? [];
  const allFlights = searchData?.flights ?? [];
  const fares = searchData?.fares ?? [];
  const selectedOutboundFlight = Number.isFinite(selectedOutboundInventoryId)
    ? outboundFlights.find((flight) => flight.inventoryId === selectedOutboundInventoryId) ?? null
    : null;

  const insights = [
    {
      label: "Tuyến đang xem",
      value: hienThiHanhTrinh(criteria.from, criteria.to),
      compact: true
    },
    {
      label: "Khung ngày",
      value: hienThiKhungNgay(criteria),
      compact: true
    },
    {
      label: "Mức giá tốt nhất",
      value: allFlights.length > 0 ? formatCurrency(Math.min(...allFlights.map((flight) => flight.price))) : "Chưa có",
      compact: false
    }
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero-card search-page-hero">
          <div>
            <span className="section-eyebrow">Tìm chuyến bay</span>
            <h1 className="page-title">Chọn chuyến bay phù hợp theo giờ khởi hành, gói giá và ngân sách.</h1>
            <p className="page-hero-copy">
              So sánh nhanh giờ bay, thời lượng, số ghế còn lại và điều kiện gói giá để chốt
              hành trình phù hợp ngay từ bước tìm kiếm.
            </p>
          </div>
          <div className="page-hero-stat-grid">
            {insights.map((item) => (
              <article key={item.label} className="page-hero-stat">
                <span>{item.label}</span>
                <strong className={item.compact ? "stat-value-compact" : undefined}>
                  {item.value}
                </strong>
              </article>
            ))}
          </div>
        </div>

        <div className="section-gap" />
        <div className="search-layout">
          <aside className="surface-card sticky-card filter-card">
            <h3>Bộ lọc đề xuất</h3>
            <div className="filter-chip-list">
              {(searchData?.filters ?? filterBlocks).map((item) => (
                <span key={item} className="assurance-chip">
                  {item}
                </span>
              ))}
            </div>
            <div className="filter-note">
              Bộ lọc ưu tiên các tiêu chí hành khách thường dùng để rút ngắn thời gian tìm
              chuyến bay trên những tuyến đông khách.
            </div>
            <div className="filter-note">
              Đang áp dụng hạng vé: <strong>{hienThiTrangThaiLocGoiGia(criteria)}</strong>
            </div>
            {criteria.tripType === "round_trip" ? (
              <div className="filter-note">
                {selectedOutboundFlight
                  ? `Đã chọn chiều đi: ${selectedOutboundFlight.code} • ${selectedOutboundFlight.departureTime}`
                  : "Hãy chọn chiều đi trước khi chốt chiều về."}
              </div>
            ) : null}
          </aside>

          <div className="stack-list">
            {searchError ? (
              <article className="surface-card result-card">
                <div className="result-top">
                  <div>
                    <span className="section-eyebrow">Không thể tải dữ liệu</span>
                    <h3>Không thể lấy kết quả tìm chuyến bay</h3>
                    <p>{searchError}</p>
                  </div>
                </div>
              </article>
            ) : null}

            {taoTheKetQua("Chặng đi", outboundFlights, criteria, selectedOutboundFlight)}
            {criteria.tripType === "round_trip"
              ? taoTheKetQua("Chặng về", returnFlights, criteria, selectedOutboundFlight)
              : null}
          </div>
        </div>

        {fares.length > 0 ? (
          <>
            <div className="section-gap" />
            <SectionHeading
              eyebrow="So sánh gói giá"
              title="So sánh gói giá để chọn đúng nhu cầu của từng hành trình"
              description="Mỗi gói vé làm rõ quyền lợi về hành lý, đổi hoặc hoàn và lựa chọn chỗ ngồi để hành khách đưa ra quyết định ngay tại bước tìm chuyến."
            />
            <div className="card-grid card-grid-3">
              {fares.map((fare) => (
                <article key={fare.title} className="surface-card fare-card">
                  <div className="fare-card-image">
                    <Image
                      src={fareImageMap[fare.fareFamily].src}
                      alt={fareImageMap[fare.fareFamily].alt}
                      fill
                      sizes="(max-width: 820px) 100vw, 360px"
                    />
                  </div>
                  <span className="pill">{fare.title}</span>
                  <strong className="fare-price">{formatCurrency(fare.price)}</strong>
                  <ul className="list-clean">
                    {fare.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
