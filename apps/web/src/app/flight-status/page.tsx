import { SectionHeading } from "@/components/section-heading";

const flightStatusNotes = [
  {
    title: "Dữ liệu đang cập nhật",
    description:
      "Bảng tình trạng chuyến bay sẽ hiển thị khi nguồn dữ liệu vận hành được kết nối ổn định."
  },
  {
    title: "Kênh kiểm tra thay thế",
    description:
      "Trong lúc chờ dữ liệu thật, bạn có thể theo dõi email, SMS hoặc liên hệ tổng đài nếu chuyến bay có thay đổi quan trọng."
  },
  {
    title: "Luồng tiếp theo",
    description:
      "Khi API tình trạng chuyến bay sẵn sàng, trang này sẽ hiển thị giờ bay, cửa ra tàu và trạng thái mới nhất theo thời gian thực."
  }
];

export default function FlightStatusPage() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Tình trạng chuyến bay"
          title="Theo dõi giờ bay, cửa ra tàu và trạng thái mới nhất của chuyến bay"
          description="Hành khách có thể kiểm tra nhanh thời gian khởi hành, cửa ra tàu và các thay đổi quan trọng trước khi di chuyển ra sân bay."
        />
        <div className="card-grid card-grid-3">
          {flightStatusNotes.map((item) => (
            <article key={item.title} className="surface-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
