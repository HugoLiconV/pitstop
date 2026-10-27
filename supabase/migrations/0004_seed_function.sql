-- One-time setup: creates the Mazda 6 and its maintenance schedule for a user.
-- Source: Mazda 6 2015 Manual del propietario, table "Excepto Israel/Rusia/Bielorrusia/Azerbaiyán/Kazajistán" (pp. 6-13 to 6-16).
-- Run from the SQL editor: select seed_pitstop('<user uuid>', <current km>, '<purchase date>');
create function seed_pitstop(p_user uuid, p_initial_km integer, p_purchase_date date)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_vehicle uuid;
  severe constant text := 'Cambiar más seguido en condiciones severas (calor, polvo, montaña, trayectos cortos o mucho tiempo en marcha lenta).';
begin
  insert into vehicles (user_id, name, purchase_date, initial_km)
  values (p_user, 'Mazda 6 2015 Grand Touring Plus', p_purchase_date, p_initial_km)
  returning id into v_vehicle;

  insert into odometer_readings (user_id, vehicle_id, date, km, source)
  values (p_user, v_vehicle, p_purchase_date, p_initial_km, 'manual');

  insert into maintenance_items (user_id, vehicle_id, name, interval_km, interval_months, notes, source, manual_page)
  select p_user, v_vehicle, name, km, months, notes, 'manual', page
  from (values
    ('Cambio de aceite de motor y filtro', 10000, 6, severe, '6-14'),
    ('Rotación de neumáticos', 10000, null, null, '6-15'),
    ('Inspección de neumáticos y presión', 10000, 6, 'Incluye la llanta de refacción.', '6-15'),
    ('Inspección de frenos de disco y freno de mano', 10000, 6, null, '6-14'),
    ('Inspección de correas de mando', 10000, 6, severe, '6-14'),
    ('Filtro de aire de cabina', 20000, 12, null, '6-15'),
    ('Inspección de batería', 20000, 12, 'En clima muy caluroso o frío, revisar cada 10,000 km o 6 meses.', '6-14'),
    ('Inspección de sistema de enfriamiento', 20000, 12, null, '6-14'),
    ('Inspección de líneas de freno y mangueras', 20000, 12, null, '6-14'),
    ('Inspección de dirección y suspensión', 20000, 12, null, '6-14'),
    ('Inspección de líneas de combustible', 20000, 12, null, '6-14'),
    ('Pernos y tuercas de chasis y carrocería (apretar)', 20000, 12, null, '6-14'),
    ('Filtro de aire de motor (cambio)', 60000, 36, 'Se limpia cada 20,000 km o 12 meses. En zonas con mucho polvo, más seguido.', '6-14'),
    ('Líquido de frenos', 40000, 24, 'Cambiar cada año si se usan mucho los frenos (montaña) o en clima muy húmedo.', '6-14'),
    ('Sistema evaporativo (inspección)', 40000, 24, null, '6-13'),
    ('Inspección de fundas de ejes', 40000, 24, null, '6-14'),
    ('Filtro de combustible', 60000, null, null, '6-13'),
    ('Cubierta térmica del escape (inspección)', 80000, null, null, '6-14'),
    ('Bujías de encendido', 120000, null, null, '6-13'),
    ('Refrigerante de motor (FL-22)', 200000, 120, 'Primer cambio a los 200,000 km o 10 años. Después, cada 100,000 km o 5 años: edita este intervalo tras el primer cambio.', '6-14'),
    ('Condición de carrocería (óxido y corrosión)', null, 12, null, '6-15')
  ) as s(name, km, months, notes, page);

  return v_vehicle;
end;
$$;

revoke execute on function seed_pitstop(uuid, integer, date) from public, anon, authenticated;
