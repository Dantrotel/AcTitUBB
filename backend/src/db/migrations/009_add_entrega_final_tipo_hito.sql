-- Migración 009: Agregar tipo 'entrega_final' al ENUM de hitos_cronograma
ALTER TABLE hitos_cronograma
    MODIFY COLUMN tipo_hito ENUM(
        'entrega_documento',
        'revision_avance',
        'reunion_seguimiento',
        'defensa',
        'entrega_final'
    ) NOT NULL;
