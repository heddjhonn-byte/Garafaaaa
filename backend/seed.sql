-- Local/demo credentials for all three test users:
-- password: GarrafaYa123!
INSERT INTO usuarios (nombre, email, password_hash, telefono, ci, rol)
VALUES
  ('Administración GarrafaYa', 'admin@garrafaya.bo', '$2b$12$qD.ZWvPMr7UgY9AlcEBOsumfx/XQYxG4bzjjsOT/QXMvqTOgNk1WO', '+59170000001', '1000001 LP', 'Administrador'),
  ('Camionero de prueba', 'camionero@garrafaya.bo', '$2b$12$qD.ZWvPMr7UgY9AlcEBOsumfx/XQYxG4bzjjsOT/QXMvqTOgNk1WO', '+59170000002', '1000002 LP', 'Camionero'),
  ('Cliente de prueba', 'cliente@garrafaya.bo', '$2b$12$qD.ZWvPMr7UgY9AlcEBOsumfx/XQYxG4bzjjsOT/QXMvqTOgNk1WO', '+59170000003', '1000003 LP', 'Cliente')
ON CONFLICT DO NOTHING;

INSERT INTO zonas (nombre, ciudad, macrodistrito)
VALUES
  ('Calacoto', 'La Paz', 'Sur'),
  ('Obrajes', 'La Paz', 'Sur'),
  ('Achumani', 'La Paz', 'Sur'),
  ('Chasquipampa', 'La Paz', 'Sur'),
  ('Miraflores', 'La Paz', 'Centro'),
  ('Sopocachi', 'La Paz', 'Centro'),
  ('Cotahuma', 'La Paz', 'Cotahuma'),
  ('Max Paredes', 'La Paz', 'Max Paredes'),
  ('Periférica', 'La Paz', 'Periférica'),
  ('San Antonio', 'La Paz', 'San Antonio'),
  ('Mallasa', 'La Paz', 'Mallasa'),
  ('Ciudad Satélite', 'El Alto', 'El Alto'),
  ('Villa Adela', 'El Alto', 'El Alto'),
  ('Río Seco', 'El Alto', 'El Alto'),
  ('Senkata', 'El Alto', 'El Alto')
ON CONFLICT (ciudad, nombre) DO NOTHING;

INSERT INTO inventario_planta (capacidad_kg, cantidad)
VALUES (10, 0), (45, 0)
ON CONFLICT (capacidad_kg) DO NOTHING;

INSERT INTO configuracion_precios (capacidad_kg, precio_bs)
VALUES (10, 22.50), (45, 101.25)
ON CONFLICT (capacidad_kg) DO UPDATE
  SET precio_bs = EXCLUDED.precio_bs, updated_at = NOW();

INSERT INTO camiones (placa, camionero_id)
SELECT v.placa, u.id
  FROM (VALUES ('4238-KFP'), ('3178-UGT'), ('4821-NSE')) AS v(placa)
  CROSS JOIN usuarios u
 WHERE u.email = 'camionero@garrafaya.bo'
ON CONFLICT (placa) DO NOTHING;
