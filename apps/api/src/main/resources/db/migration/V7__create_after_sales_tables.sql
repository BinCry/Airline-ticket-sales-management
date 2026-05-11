alter table booking
  drop constraint if exists ck_booking_status;

alter table booking
  add constraint ck_booking_status
    check (status in ('HOLD', 'TICKETED', 'REFUND_PENDING', 'CANCELLED'));

alter table ticket
  drop constraint if exists ck_ticket_status;

alter table ticket
  add constraint ck_ticket_status
    check (status in ('ISSUED', 'CHECKED_IN', 'CANCELLED'));

create table boarding_pass (
  id bigserial primary key,
  ticket_id bigint not null unique references ticket (id) on delete cascade,
  seat_number varchar(8) not null,
  gate varchar(12) not null,
  boarding_time timestamptz not null,
  barcode varchar(64) not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index idx_boarding_pass_ticket_id on boarding_pass (ticket_id);

create table refund_request (
  id bigserial primary key,
  booking_code varchar(6) not null references booking (booking_code) on delete cascade,
  reason varchar(500) not null,
  refund_amount bigint not null,
  status varchar(16) not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint ck_refund_request_amount_non_negative check (refund_amount >= 0),
  constraint ck_refund_request_status check (status in ('PENDING', 'APPROVED', 'REJECTED'))
);

create index idx_refund_request_booking_code on refund_request (booking_code);
create index idx_refund_request_booking_code_status on refund_request (booking_code, status);
