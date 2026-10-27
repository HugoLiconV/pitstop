-- A client token per form submission, so a double tap or network retry can't create two services.
alter table services add column client_token uuid unique;

drop function record_service(uuid, date, integer, text, numeric, text, jsonb);

create function record_service(
  p_vehicle_id uuid,
  p_date date,
  p_km integer,
  p_workshop text,
  p_total_cost numeric,
  p_notes text,
  p_items jsonb,
  p_client_token uuid
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_service_id uuid;
begin
  select id into v_service_id from services where client_token = p_client_token;
  if found then
    return v_service_id;
  end if;

  if not exists (select 1 from vehicles where id = p_vehicle_id) then
    raise exception 'vehicle not found' using errcode = 'P0002';
  end if;

  insert into services (vehicle_id, date, km, workshop, total_cost_mxn, notes, client_token)
  values (p_vehicle_id, p_date, p_km, p_workshop, p_total_cost, p_notes, p_client_token)
  returning id into v_service_id;

  insert into service_items (service_id, maintenance_item_id, cost_mxn)
  select v_service_id, (i ->> 'maintenance_item_id')::uuid, (i ->> 'cost_mxn')::numeric
  from jsonb_array_elements(p_items) as i;

  insert into odometer_readings (vehicle_id, date, km, source)
  values (p_vehicle_id, p_date, p_km, 'service');

  return v_service_id;
exception
  -- Two concurrent calls with the same token: the loser returns the winner's service.
  when unique_violation then
    select id into v_service_id from services where client_token = p_client_token;
    if v_service_id is null then
      raise;
    end if;
    return v_service_id;
end;
$$;
