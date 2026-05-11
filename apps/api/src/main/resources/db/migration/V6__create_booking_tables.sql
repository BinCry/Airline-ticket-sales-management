alter table flight_fare_inventory
  add column available_seats integer;

update flight_fare_inventory
set available_seats = total_seats
where available_seats is null;

alter table flight_fare_inventory
  alter column available_seats set not null;

alter table flight_fare_inventory
  add constraint ck_flight_fare_inventory_available_seats_non_negative
    check (available_seats >= 0);

create table booking (
  id bigserial primary key,
  booking_code varchar(6) not null unique,
  status varchar(16) not null,
  payment_status varchar(16) not null,
  trip_type varchar(16) not null,
  base_amount bigint not null,
  ancillary_amount bigint not null,
  total_amount bigint not null,
  currency varchar(8) not null,
  expires_at timestamptz not null,
  ticketed_at timestamptz,
  payment_reference varchar(64),
  payment_session_url varchar(255),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint ck_booking_status check (status in ('HOLD', 'TICKETED', 'CANCELLED')),
  constraint ck_booking_payment_status check (payment_status in ('PENDING', 'PAID', 'FAILED', 'EXPIRED')),
  constraint ck_booking_trip_type check (trip_type in ('one_way', 'round_trip')),
  constraint ck_booking_amounts_non_negative check (
    base_amount >= 0
    and ancillary_amount >= 0
    and total_amount >= 0
  )
);

create index idx_booking_status_expires_at on booking (status, expires_at);

create table booking_contact (
  id bigserial primary key,
  booking_id bigint not null unique references booking (id) on delete cascade,
  full_name varchar(160) not null,
  email varchar(160) not null,
  phone varchar(20) not null
);

create table booking_passenger (
  id bigserial primary key,
  booking_id bigint not null references booking (id) on delete cascade,
  full_name varchar(160) not null,
  passenger_type varchar(16) not null,
  date_of_birth date not null,
  document_type varchar(32) not null,
  document_number varchar(64) not null,
  created_at timestamptz not null
);

create index idx_booking_passenger_booking_id on booking_passenger (booking_id);

create table booking_segment (
  id bigserial primary key,
  booking_id bigint not null references booking (id) on delete cascade,
  inventory_id bigint not null references flight_fare_inventory (id),
  flight_code varchar(16) not null,
  from_city varchar(120) not null,
  to_city varchar(120) not null,
  origin_code varchar(8) not null,
  destination_code varchar(8) not null,
  departure_at timestamptz not null,
  arrival_at timestamptz not null,
  fare_family varchar(64) not null,
  fare_title varchar(120) not null,
  price_per_passenger bigint not null,
  passenger_count integer not null,
  subtotal_amount bigint not null,
  created_at timestamptz not null,
  constraint ck_booking_segment_passenger_count check (passenger_count > 0),
  constraint ck_booking_segment_amount_non_negative check (
    price_per_passenger >= 0
    and subtotal_amount >= 0
  )
);

create index idx_booking_segment_booking_id on booking_segment (booking_id);
create index idx_booking_segment_inventory_id on booking_segment (inventory_id);

create table booking_ancillary (
  id bigserial primary key,
  booking_id bigint not null references booking (id) on delete cascade,
  code varchar(32) not null,
  name varchar(160) not null,
  description varchar(255) not null,
  unit_price bigint not null,
  quantity integer not null,
  subtotal_amount bigint not null,
  created_at timestamptz not null,
  constraint ck_booking_ancillary_quantity check (quantity > 0),
  constraint ck_booking_ancillary_amount_non_negative check (
    unit_price >= 0
    and subtotal_amount >= 0
  )
);

create index idx_booking_ancillary_booking_id on booking_ancillary (booking_id);

create table ticket (
  id bigserial primary key,
  booking_id bigint not null references booking (id) on delete cascade,
  booking_passenger_id bigint not null unique references booking_passenger (id) on delete cascade,
  ticket_number varchar(20) not null unique,
  status varchar(16) not null,
  issued_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint ck_ticket_status check (status in ('ISSUED', 'CANCELLED'))
);

create index idx_ticket_booking_id on ticket (booking_id);
