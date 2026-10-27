begin;
select plan(5);

-- A second user with no data.
insert into auth.users (id, aud, role, email) values
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'other@pitstop.local');

-- As the owner: can record a service, which also writes items and a reading.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select isnt(
  record_service(
    (select id from vehicles limit 1), '2026-10-01', 70000, 'Taller', 1850, null,
    jsonb_build_array(jsonb_build_object('maintenance_item_id',
      (select id from maintenance_items where name like 'Cambio de aceite%'), 'cost_mxn', 900))),
  null, 'owner can record a service');
select is((select count(*)::int from service_items), 1, 'service items saved with the service');
select is((select count(*)::int from odometer_readings where source = 'service'), 1, 'odometer reading saved with the service');

select set_config('test.vehicle', (select id::text from vehicles limit 1), true);

-- As the other user: sees nothing and cannot write to the owner's vehicle.
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
select is((select count(*)::int from services), 0, 'other user sees no services');
select throws_ok(
  $$select record_service(current_setting('test.vehicle')::uuid, '2026-10-01', 1, null, null, null, '[]'::jsonb)$$,
  'P0002', 'vehicle not found', 'other user cannot record a service on the owner''s vehicle');

select * from finish();
rollback;
