delete from notification_outbox
where booking_code in ('QC5001', 'QC5002', 'QC5003', 'QC5004');

delete from booking
where booking_code in ('QC5001', 'QC5002', 'QC5003', 'QC5004');

delete from flight
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
