-- Migración 011: Agregar campo creado_por_rol a hitos_cronograma
ALTER TABLE hitos_cronograma
    ADD COLUMN creado_por_rol ENUM('guia', 'informante', 'admin') DEFAULT 'guia'
    AFTER creado_por_rut;
