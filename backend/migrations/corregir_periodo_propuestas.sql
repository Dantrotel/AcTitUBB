-- ====================================================================
-- CORRECCIÓN: Marcar fechas de entrega_propuesta como globales
-- ====================================================================
-- Este script corrige las fechas de tipo 'entrega_propuesta' para que
-- aparezcan en el Período de Propuestas del Calendario Unificado
-- ====================================================================

USE actitubb;

-- 1. VER ESTADO ACTUAL
SELECT 
    '📊 ESTADO ACTUAL DE FECHAS DE ENTREGA_PROPUESTA' as '';

SELECT 
    id,
    titulo,
    tipo_fecha,
    DATE_FORMAT(fecha_limite, '%d/%m/%Y') as fecha_limite,
    CASE WHEN es_global THEN '✅ SÍ' ELSE '❌ NO' END as es_global,
    proyecto_id,
    CASE WHEN habilitada THEN '✅ SÍ' ELSE '❌ NO' END as habilitada,
    creado_por
FROM fechas_importantes
WHERE tipo_fecha = 'entrega_propuesta'
ORDER BY fecha_limite DESC;

-- 2. CORREGIR FECHAS (marcarlas como globales si no tienen proyecto)
SELECT 
    '🔧 CORRIGIENDO FECHAS...' as '';

UPDATE fechas_importantes 
SET es_global = TRUE
WHERE tipo_fecha = 'entrega_propuesta'
AND (es_global = FALSE OR es_global IS NULL)
AND proyecto_id IS NULL;

SELECT 
    CONCAT('✅ ', ROW_COUNT(), ' fecha(s) corregida(s)') as resultado;

-- 3. VERIFICAR RESULTADO
SELECT 
    '📊 ESTADO FINAL - Fechas que aparecerán en Período de Propuestas' as '';

SELECT 
    id,
    titulo,
    descripcion,
    DATE_FORMAT(fecha_limite, '%d/%m/%Y') as fecha_limite,
    CASE WHEN habilitada THEN '✅ Habilitada' ELSE '❌ Deshabilitada' END as estado,
    DATEDIFF(fecha_limite, CURDATE()) as dias_restantes,
    CASE 
        WHEN fecha_limite < CURDATE() THEN '🔴 Vencido'
        WHEN fecha_limite = CURDATE() THEN '🟡 Último día'
        WHEN DATEDIFF(fecha_limite, CURDATE()) <= 3 THEN '🟠 Próximo a vencer'
        ELSE '🟢 Activo'
    END as estado_tiempo
FROM fechas_importantes
WHERE tipo_fecha = 'entrega_propuesta'
AND es_global = TRUE
AND proyecto_id IS NULL
ORDER BY fecha_limite DESC;

-- 4. MENSAJE FINAL
SELECT 
    '✅ ¡LISTO! Ahora ve a: Admin → Calendario Unificado → Pestaña "Período de Propuestas"' as mensaje;

