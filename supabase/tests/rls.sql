begin;
select plan(6);

-- A second user with no data.
insert into auth.users (id, aud, role, email) values
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'other@pitstop.local');

-- As the owner: can record a service, which also writes items and a reading.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select set_config('test.service', record_service(
    (select id from vehicles limit 1), '2026-10-01', 70000, 'Taller', 1850, null,
    jsonb_build_array(jsonb_build_object('maintenance_item_id',
      (select id from maintenance_items where name like 'Cambio de aceite%'), 'cost_mxn', 900)), gen_random_uuid())::text, true);
select isnt(current_setting('test.service'), '', 'owner can record a service');
select is((select count(*)::int from service_items where service_id = current_setting('test.service')::uuid), 1,
  'service items saved with the service');
select is((select count(*)::int from odometer_readings where source = 'service' and date = '2026-10-01' and km = 70000), 1,
  'odometer reading saved with the service');

-- The same client token twice (double tap, network retry) yields one service.
select is(
  (select count(distinct x)::int from (
    select record_service((select id from vehicles limit 1), '2026-10-02', 70100, null, null, null,
      jsonb_build_array(jsonb_build_object('maintenance_item_id',
        (select id from maintenance_items where name like 'Rotación%'))), 'aaaaaaaa-0000-4000-8000-000000000001') as x
    from generate_series(1, 2)) t),
  1, 'repeated client token returns the same service');

select set_config('test.vehicle', (select id::text from vehicles limit 1), true);

-- As the other user: sees nothing and cannot write to the owner's vehicle.
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
select is((select count(*)::int from services), 0, 'other user sees no services');
select throws_ok(
  $$select record_service(current_setting('test.vehicle')::uuid, '2026-10-01', 1, null, null, null, '[]'::jsonb, gen_random_uuid())$$,
  'P0002', 'vehicle not found', 'other user cannot record a service on the owner''s vehicle');

select * from finish();
rollback;
