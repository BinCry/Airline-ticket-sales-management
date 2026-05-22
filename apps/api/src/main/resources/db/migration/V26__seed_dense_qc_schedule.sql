insert into airport (code, city_name, airport_name, terminal_label)
values
  ('SGN', 'Thành phố Hồ Chí Minh', 'Tân Sơn Nhất', 'Nhà ga nội địa'),
  ('HAN', 'Hà Nội', 'Nội Bài', 'Nhà ga nội địa'),
  ('DAD', 'Đà Nẵng', 'Đà Nẵng', 'Nhà ga nội địa'),
  ('PQC', 'Phú Quốc', 'Phú Quốc', 'Nhà ga nội địa'),
  ('CXR', 'Nha Trang', 'Cam Ranh', 'Nhà ga nội địa'),
  ('HUI', 'Huế', 'Phú Bài', 'Nhà ga nội địa'),
  ('VCA', 'Cần Thơ', 'Cần Thơ', 'Nhà ga nội địa'),
  ('HPH', 'Hải Phòng', 'Cát Bi', 'Nhà ga nội địa'),
  ('VII', 'Vinh', 'Vinh', 'Nhà ga nội địa'),
  ('VDH', 'Đồng Hới', 'Đồng Hới', 'Nhà ga nội địa'),
  ('UIH', 'Quy Nhơn', 'Phù Cát', 'Nhà ga nội địa'),
  ('THD', 'Thanh Hóa', 'Thọ Xuân', 'Nhà ga nội địa'),
  ('DLI', 'Đà Lạt', 'Liên Khương', 'Nhà ga nội địa'),
  ('PXU', 'Pleiku', 'Pleiku', 'Nhà ga nội địa'),
  ('BMV', 'Buôn Ma Thuột', 'Buôn Ma Thuột', 'Nhà ga nội địa'),
  ('CAH', 'Cà Mau', 'Cà Mau', 'Nhà ga nội địa'),
  ('VCL', 'Chu Lai', 'Chu Lai', 'Nhà ga nội địa'),
  ('DIN', 'Điện Biên', 'Điện Biên Phủ', 'Nhà ga nội địa'),
  ('TBB', 'Tuy Hòa', 'Tuy Hòa', 'Nhà ga nội địa'),
  ('VCS', 'Côn Đảo', 'Côn Đảo', 'Nhà ga nội địa'),
  ('VKG', 'Rạch Giá', 'Rạch Giá', 'Nhà ga nội địa')
on conflict (code) do update set
  city_name = excluded.city_name,
  airport_name = excluded.airport_name,
  terminal_label = excluded.terminal_label;

update flight
set
  sales_open = false,
  hidden_at = coalesce(hidden_at, '2026-05-23T00:00:00+07:00'::timestamptz),
  operations_note = coalesce(operations_note, 'Ẩn bộ dữ liệu chuyến bay seed cũ để dùng lịch QC mới.')
where code like 'AU%'
   or code in (
     'VN5201', 'VN5205', 'VN5211', 'VN5302', 'VN5308', 'VN5316',
     'VN6101', 'VN6201', 'VN7101', 'VN7201',
     'VN5401', 'VN5407', 'VN5413', 'VN5502', 'VN5508', 'VN5516',
     'VN6113', 'VN6119', 'VN6125', 'VN6214', 'VN6220', 'VN6226',
     'VN7303', 'VN7309', 'VN7315', 'VN7404', 'VN7410', 'VN7416',
     'VN7511', 'VN7517', 'VN7523', 'VN7612', 'VN7618', 'VN7624',
     'VN6701', 'VN6707', 'VN6802', 'VN6808',
     'VN7813', 'VN7819', 'VN7904', 'VN7910',
     'VN8801', 'VN8802', 'VN8901', 'VN8902'
   );

with route_template(route_id, origin_code, destination_code, departure_local, duration_minutes, base_fare) as (
  values
    (1, 'SGN', 'HAN', '06:00', 130, 1290000),
    (2, 'SGN', 'HAN', '11:30', 130, 1490000),
    (3, 'SGN', 'HAN', '18:45', 130, 1690000),
    (4, 'HAN', 'SGN', '07:00', 130, 1290000),
    (5, 'HAN', 'SGN', '13:15', 130, 1490000),
    (6, 'HAN', 'SGN', '20:00', 130, 1690000),
    (7, 'SGN', 'DAD', '07:10', 85, 1090000),
    (8, 'DAD', 'SGN', '18:20', 85, 1090000),
    (9, 'HAN', 'DAD', '08:00', 80, 990000),
    (10, 'DAD', 'HAN', '19:10', 80, 990000),
    (11, 'SGN', 'PQC', '09:15', 65, 1190000),
    (12, 'PQC', 'SGN', '15:40', 65, 1190000),
    (13, 'HAN', 'CXR', '10:00', 110, 1590000),
    (14, 'CXR', 'HAN', '16:30', 110, 1590000),
    (15, 'SGN', 'VCA', '06:45', 50, 720000),
    (16, 'VCA', 'SGN', '17:45', 50, 720000),
    (17, 'HAN', 'HUI', '11:20', 75, 860000),
    (18, 'HUI', 'HAN', '18:30', 75, 860000),
    (19, 'SGN', 'HPH', '12:10', 125, 1780000),
    (20, 'HPH', 'SGN', '19:20', 125, 1780000),
    (21, 'HAN', 'VII', '09:10', 55, 690000),
    (22, 'VII', 'HAN', '17:10', 55, 690000),
    (23, 'SGN', 'UIH', '13:40', 70, 930000),
    (24, 'UIH', 'SGN', '20:10', 70, 930000),
    (25, 'HAN', 'DLI', '06:50', 105, 1450000),
    (26, 'DLI', 'HAN', '13:50', 105, 1450000),
    (27, 'SGN', 'THD', '08:40', 120, 1350000),
    (28, 'THD', 'SGN', '16:20', 120, 1350000)
),
flight_day(schedule_day) as (
  select generate_series('2026-05-23'::date, '2026-06-30'::date, interval '1 day')::date
),
generated_flight as (
  select
    concat('QC', lpad(route_template.route_id::text, 2, '0'), to_char(flight_day.schedule_day, 'MMDD')) as code,
    route_template.origin_code,
    route_template.destination_code,
    route_template.base_fare,
    ((flight_day.schedule_day::text || ' ' || route_template.departure_local)::timestamp at time zone 'Asia/Ho_Chi_Minh') as departure_at,
    ((flight_day.schedule_day::text || ' ' || route_template.departure_local)::timestamp at time zone 'Asia/Ho_Chi_Minh')
      + make_interval(mins => route_template.duration_minutes) as arrival_at,
    case when route_template.route_id % 3 = 0 then 'on_time' else 'scheduled' end as status,
    concat('G', ((route_template.route_id - 1) % 12) + 1) as gate
  from route_template
  cross join flight_day
)
insert into flight (
  code,
  origin_airport_id,
  destination_airport_id,
  departure_at,
  arrival_at,
  status,
  gate,
  operations_note,
  sales_open,
  hidden_at,
  cancelled_at
)
select
  generated_flight.code,
  origin.id,
  destination.id,
  generated_flight.departure_at,
  generated_flight.arrival_at,
  generated_flight.status,
  generated_flight.gate,
  'Lịch QC dày đặc phục vụ kiểm thử luồng 3 hạng vé cố định.',
  true,
  null,
  null
from generated_flight
join airport origin on origin.code = generated_flight.origin_code
join airport destination on destination.code = generated_flight.destination_code
on conflict (code) do update set
  origin_airport_id = excluded.origin_airport_id,
  destination_airport_id = excluded.destination_airport_id,
  departure_at = excluded.departure_at,
  arrival_at = excluded.arrival_at,
  status = excluded.status,
  gate = excluded.gate,
  operations_note = excluded.operations_note,
  sales_open = true,
  hidden_at = null,
  cancelled_at = null;

with route_template(route_id, base_fare) as (
  values
    (1, 1290000), (2, 1490000), (3, 1690000),
    (4, 1290000), (5, 1490000), (6, 1690000),
    (7, 1090000), (8, 1090000),
    (9, 990000), (10, 990000),
    (11, 1190000), (12, 1190000),
    (13, 1590000), (14, 1590000),
    (15, 720000), (16, 720000),
    (17, 860000), (18, 860000),
    (19, 1780000), (20, 1780000),
    (21, 690000), (22, 690000),
    (23, 930000), (24, 930000),
    (25, 1450000), (26, 1450000),
    (27, 1350000), (28, 1350000)
),
flight_day(schedule_day) as (
  select generate_series('2026-05-23'::date, '2026-06-30'::date, interval '1 day')::date
),
generated_inventory as (
  select
    concat('QC', lpad(route_template.route_id::text, 2, '0'), to_char(flight_day.schedule_day, 'MMDD')) as flight_code,
    route_template.base_fare
  from route_template
  cross join flight_day
),
fare_meta(fare_family, total_seats, price_offset) as (
  values
    ('pho_thong_tiet_kiem', 120, 0),
    ('pho_thong_linh_hoat', 36, 500000),
    ('thuong_gia', 12, 1000000)
)
insert into flight_fare_inventory (flight_id, fare_family, total_seats, available_seats, price)
select
  flight.id,
  fare_meta.fare_family,
  fare_meta.total_seats,
  fare_meta.total_seats,
  generated_inventory.base_fare + fare_meta.price_offset
from generated_inventory
join flight on flight.code = generated_inventory.flight_code
cross join fare_meta
on conflict (flight_id, fare_family) do update set
  total_seats = excluded.total_seats,
  available_seats = excluded.available_seats,
  price = excluded.price;
