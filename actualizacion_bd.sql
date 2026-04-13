-- ==========================================================
-- 1. ACTUALIZAR LA ESTRUCTURA DE LA TABLA MIEMBROS
-- Ejecuta esto UNA SOLA VEZ para añadir las columnas nuevas
-- ==========================================================

ALTER TABLE members ADD COLUMN address VARCHAR(255) NULL;
ALTER TABLE members ADD COLUMN rh VARCHAR(10) NULL;
ALTER TABLE members ADD COLUMN emergency_contact VARCHAR(150) NULL;
ALTER TABLE members ADD COLUMN observations TEXT NULL;

-- ==========================================================
-- 2. LIMPIEZA DE EJERCICIOS ANTERIORES PARA EVITAR CLONES
-- ==========================================================

DELETE FROM machines WHERE name IN (
 'Sentadilla', 'Peso Muerto', 'Tijera', 'Sumo', 'Hammer', 'Leg curl', 'Leg extension', 'Prensa', 'Hacka maq.', 'Zancadas',
 'Press militar', 'Press mancuerna', 'Elevación frontal', 'Elevación lateral', 'Posterior maq.', 'Pajaritos', 'Posterior acostado', 'Remo al pecho', 'Remo al cuello', 'Encogimientos',
 'Press Banco Plano', 'Press Banco Inclinado', 'Press Banco Declinado', 'Press Hammer inclinado', 'Press Hammer plano', 'Maq. Fly', 'Maq. crossover', 'Aperturas inclinado', 'Fondos en paralelas', 'Flexión de brazos',
 'Dominadas Barra', 'Polea Pecho Abierta', 'Polea Pecho Cerrada', 'Jalón Trasnuca', 'Pull-over polea alta', 'Pull-over Mancuerna', 'Remo bajo Polea', 'Remo en Barra T', 'Remo Mancuerna', 'Remo Hammer', 'Remo con Barra',
 'Curl supino', 'Curl martillo', 'Curl concentrado', 'Curl con barra', 'Predicador', 'Curl polea',
 'Copa', 'Press Francés', 'Polea Barra', 'Polea Lazo', 'Dips o Fondos', 'Patada',
 'Maq. Total Hip', 'Abducción', 'Hip Thrust', 'Sentadilla Búlgara',
 'Maq. Sentado', 'Maq. de pie', 'Maq. Inclinado', 'Barra Supinación', 'Barra Pronación', 'Antebrazos Mancuerna'
);

-- ==========================================================
-- 3. INYECCIÓN DEL CATÁLOGO DE EJERCICIOS MÚSCULO POR MÚSCULO
-- ==========================================================

INSERT INTO machines (name, category, show_in_public, active) VALUES
-- 1. Piernas
('Sentadilla', '1. Piernas', 1, 1),
('Peso Muerto', '1. Piernas', 1, 1),
('Tijera', '1. Piernas', 1, 1),
('Sumo', '1. Piernas', 1, 1),
('Hammer', '1. Piernas', 1, 1),
('Leg curl', '1. Piernas', 1, 1),
('Leg extension', '1. Piernas', 1, 1),
('Prensa', '1. Piernas', 1, 1),
('Hacka maq.', '1. Piernas', 1, 1),
('Zancadas', '1. Piernas', 1, 1),

-- 2. Hombro
('Press militar', '2. Hombro', 1, 1),
('Press mancuerna', '2. Hombro', 1, 1),
('Elevación frontal', '2. Hombro', 1, 1),
('Elevación lateral', '2. Hombro', 1, 1),
('Posterior maq.', '2. Hombro', 1, 1),
('Pajaritos', '2. Hombro', 1, 1),
('Posterior acostado', '2. Hombro', 1, 1),
('Remo al pecho', '2. Hombro', 1, 1),
('Remo al cuello', '2. Hombro', 1, 1),
('Encogimientos', '2. Hombro', 1, 1),

-- 3. Pecho
('Press Banco Plano', '3. Pecho', 1, 1),
('Press Banco Inclinado', '3. Pecho', 1, 1),
('Press Banco Declinado', '3. Pecho', 1, 1),
('Press Hammer inclinado', '3. Pecho', 1, 1),
('Press Hammer plano', '3. Pecho', 1, 1),
('Maq. Fly', '3. Pecho', 1, 1),
('Maq. crossover', '3. Pecho', 1, 1),
('Aperturas inclinado', '3. Pecho', 1, 1),
('Fondos en paralelas', '3. Pecho', 1, 1),
('Flexión de brazos', '3. Pecho', 1, 1),

-- 4. Espalda
('Dominadas Barra', '4. Espalda', 1, 1),
('Polea Pecho Abierta', '4. Espalda', 1, 1),
('Polea Pecho Cerrada', '4. Espalda', 1, 1),
('Jalón Trasnuca', '4. Espalda', 1, 1),
('Pull-over polea alta', '4. Espalda', 1, 1),
('Pull-over Mancuerna', '4. Espalda', 1, 1),
('Remo bajo Polea', '4. Espalda', 1, 1),
('Remo en Barra T', '4. Espalda', 1, 1),
('Remo Mancuerna', '4. Espalda', 1, 1),
('Remo Hammer', '4. Espalda', 1, 1),
('Remo con Barra', '4. Espalda', 1, 1),

-- 5. Bíceps
('Curl supino', '5. Bíceps', 1, 1),
('Curl martillo', '5. Bíceps', 1, 1),
('Curl concentrado', '5. Bíceps', 1, 1),
('Curl con barra', '5. Bíceps', 1, 1),
('Predicador', '5. Bíceps', 1, 1),
('Curl polea', '5. Bíceps', 1, 1),

-- 6. Tríceps
('Copa', '6. Tríceps', 1, 1),
('Press Francés', '6. Tríceps', 1, 1),
('Polea Barra', '6. Tríceps', 1, 1),
('Polea Lazo', '6. Tríceps', 1, 1),
('Dips o Fondos', '6. Tríceps', 1, 1),
('Patada', '6. Tríceps', 1, 1),

-- 7. Glúteos
('Maq. Total Hip', '7. Glúteos', 1, 1),
('Abducción', '7. Glúteos', 1, 1),
('Hip Thrust', '7. Glúteos', 1, 1),
('Sentadilla Búlgara', '7. Glúteos', 1, 1),

-- 8. Gemelos / Antebrazos
('Maq. Sentado', '8. Gemelos / Antebrazos', 1, 1),
('Maq. de pie', '8. Gemelos / Antebrazos', 1, 1),
('Maq. Inclinado', '8. Gemelos / Antebrazos', 1, 1),
('Barra Supinación', '8. Gemelos / Antebrazos', 1, 1),
('Barra Pronación', '8. Gemelos / Antebrazos', 1, 1),
('Antebrazos Mancuerna', '8. Gemelos / Antebrazos', 1, 1);
