-- Saves a service, its items and its odometer reading in one transaction.
-- security invoker: RLS applies, so another user's vehicle cannot be written to.
create function record_service(
  p_vehicle_id uuid,
  p_date date,
  p_km integer,
  p_workshop text,
  p_total_cost numeric,
  p_notes text,
  p_items jsonb
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_service_id uuid;
begin
  if not exists (select 1 from vehicles where id = p_vehicle_id) then
    raise exception 'vehicle not found' using errcode = 'P0002';
  end if;

  insert into services (vehicle_id, date, km, workshop, total_cost_mxn, notes)
  values (p_vehicle_id, p_date, p_km, p_workshop, p_total_cost, p_notes)
  returning id into v_service_id;

  insert into service_items (service_id, maintenance_item_id, cost_mxn)
  select v_service_id, (i ->> 'maintenance_item_id')::uuid, (i ->> 'cost_mxn')::numeric
  from jsonb_array_elements(p_items) as i;

  insert into odometer_readings (vehicle_id, date, km, source)
  values (p_vehicle_id, p_date, p_km, 'service');

  return v_service_id;
end;
$$;
