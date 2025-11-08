-- ============================================
-- FIX: Actualizar triggers para sistema de bloques de 30 min
-- Problema: El trigger marca toda la disponibilidad como inactiva
-- cuando solo debería crearse la reunión y dejar que el sistema
-- verifique conflictos automáticamente
-- ============================================

USE AcTitUBB;

-- Eliminar el trigger antiguo que marca disponibilidades como inactivas
DROP TRIGGER IF EXISTS tr_solicitud_aceptada_ocupar_horario;

-- Eliminar el procedimiento que marca disponibilidades como inactivas
DROP PROCEDURE IF EXISTS ocupar_horario_definitivo;

-- El trigger de rechazo sigue siendo útil para liberar reservas
-- pero vamos a simplificarlo también
DROP TRIGGER IF EXISTS tr_solicitud_rechazada_liberar_horario;

DELIMITER //
CREATE TRIGGER tr_solicitud_rechazada_liberar_horario
AFTER UPDATE ON solicitudes_reunion
FOR EACH ROW
BEGIN
    -- Solo liberar si la solicitud tenía una disponibilidad reservada
    IF NEW.estado = 'rechazada' AND OLD.estado = 'pendiente' AND OLD.disponibilidad_id IS NOT NULL THEN
        UPDATE disponibilidades
        SET reservado = FALSE,
            reservado_por = NULL,
            fecha_reserva = NULL,
            solicitud_id = NULL
        WHERE id = OLD.disponibilidad_id;
    END IF;
END //
DELIMITER ;

-- Simplificar el procedimiento de liberación
DROP PROCEDURE IF EXISTS liberar_horario_reservado;

DELIMITER //
CREATE PROCEDURE liberar_horario_reservado(IN p_solicitud_id INT)
BEGIN
    UPDATE disponibilidades
    SET reservado = FALSE,
        reservado_por = NULL,
        fecha_reserva = NULL,
        solicitud_id = NULL
    WHERE solicitud_id = p_solicitud_id;
END //
DELIMITER ;

SELECT '✅ Triggers actualizados para sistema de bloques de 30 min' as Estado;
SELECT 'Ahora las disponibilidades permanecen activas y solo se verifican conflictos con reuniones_calendario' as Info;
