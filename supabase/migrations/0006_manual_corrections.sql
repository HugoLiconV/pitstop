-- Corrections after reviewing the manual (pp. 6-13 to 6-17, 9-6 to 9-8):
-- evaporative system is every 20,000 km / 12 months, the brake booster is part of the brake lines check,
-- and the notes carry oil, tire pressure and brake fluid specs.

update maintenance_items set interval_km = 20000, interval_months = 12
where source = 'manual' and name = 'Sistema evaporativo (inspección)';

update maintenance_items set name = 'Inspección de líneas de freno, mangueras y reforzador'
where source = 'manual' and name = 'Inspección de líneas de freno y mangueras';

update maintenance_items
set notes = 'Cambiar más seguido en condiciones severas (calor, polvo, montaña, trayectos cortos o mucho tiempo en marcha lenta). Aceite 0W-20 (Mazda Supra) o 5W-30, API SN o ILSAC GF-V. Capacidad: 4.5 L con filtro. Después del cambio, reinicia el aviso del tablero: con el encendido apagado mantén TRIP, enciende y sigue oprimiendo más de 5 segundos.'
where source = 'manual' and name = 'Cambio de aceite de motor y filtro';

update maintenance_items
set notes = 'Incluye la llanta de refacción. Presión en frío: 33 psi (230 kPa) delanteras y traseras; a carga máxima, 36 psi delanteras y 46 psi traseras. Después de ajustar, inicializa el monitor de presión (TPMS).'
where source = 'manual' and name = 'Inspección de neumáticos y presión';

update maintenance_items
set notes = 'Revisar el nivel cada 10,000 km. Usar DOT-3 o DOT-4. Cambiar cada año si se usan mucho los frenos (montaña) o en clima muy húmedo.'
where source = 'manual' and name = 'Líquido de frenos';

create or replace function seed_pitstop(p_user uuid, p_initial_km integer, p_purchase_date date)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_vehicle uuid;
  severe constant text := 'Cambiar más seguido en condiciones severas (calor, polvo, montaña, trayectos cortos o mucho tiempo en marcha lenta).';
  oil constant text := 'Aceite 0W-20 (Mazda Supra) o 5W-30, API SN o ILSAC GF-V. Capacidad: 4.5 L con filtro. Después del cambio, reinicia el aviso del tablero: con el encendido apagado mantén TRIP, enciende y sigue oprimiendo más de 5 segundos.';
  tires constant text := 'Incluye la llanta de refacción. Presión en frío: 33 psi (230 kPa) delanteras y traseras; a carga máxima, 36 psi delanteras y 46 psi traseras. Después de ajustar, inicializa el monitor de presión (TPMS).';
  brake_fluid constant text := 'Revisar el nivel cada 10,000 km. Usar DOT-3 o DOT-4. Cambiar cada año si se usan mucho los frenos (montaña) o en clima muy húmedo.';
begin
  insert into vehicles (user_id, name, purchase_date, initial_km)
  values (p_user, 'Mazda 6 2015 Grand Touring Plus', p_purchase_date, p_initial_km)
  returning id into v_vehicle;

  insert into odometer_readings (user_id, vehicle_id, date, km, source)
  values (p_user, v_vehicle, p_purchase_date, p_initial_km, 'manual');

  insert into maintenance_items (user_id, vehicle_id, name, interval_km, interval_months, notes, source, manual_page)
  select p_user, v_vehicle, name, km, months, notes, 'manual', page
  from (values
    ('Cambio de aceite de motor y filtro', 10000, 6, severe || ' ' || oil, '6-14'),
    ('Rotación de neumáticos', 10000, null, null, '6-15'),
    ('Inspección de neumáticos y presión', 10000, 6, tires, '6-15'),
    ('Inspección de frenos de disco y freno de mano', 10000, 6, null, '6-14'),
    ('Inspección de correas de mando', 10000, 6, severe, '6-14'),
    ('Filtro de aire de cabina', 20000, 12, null, '6-15'),
    ('Inspección de batería', 20000, 12, 'En clima muy caluroso o frío, revisar cada 10,000 km o 6 meses.', '6-14'),
    ('Inspección de sistema de enfriamiento', 20000, 12, null, '6-14'),
    ('Inspección de líneas de freno, mangueras y reforzador', 20000, 12, null, '6-14'),
    ('Inspección de dirección y suspensión', 20000, 12, null, '6-14'),
    ('Inspección de líneas de combustible', 20000, 12, null, '6-14'),
    ('Pernos y tuercas de chasis y carrocería (apretar)', 20000, 12, null, '6-14'),
    ('Filtro de aire de motor (cambio)', 60000, 36, 'Se limpia cada 20,000 km o 12 meses. En zonas con mucho polvo, más seguido.', '6-14'),
    ('Líquido de frenos', 40000, 24, brake_fluid, '6-14'),
    ('Sistema evaporativo (inspección)', 20000, 12, null, '6-13'),
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

