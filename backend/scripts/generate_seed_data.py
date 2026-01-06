"""
Generador de Datos Masivos para AcTitUBB
Genera 60+ estudiantes, 17 profesores, propuestas y proyectos en todos los estados
"""

import random
from datetime import datetime, timedelta

def generate_massive_seed_data():
    sql = []
    
    # Ya tenemos usuarios creados en seed-data-massive.sql
    # Ahora generamos propuestas en TODOS los estados
    
    # Lista de estudiantes IECI (ruts)
    estudiantes_ieci = [
        '20111111-1', '20222222-2', '20333333-3', '20444444-4', '20555555-5',
        '20666666-6', '20777777-7', '20888888-8', '20999999-9', '20101010-K',
        '21111111-1', '21222222-2', '21333333-3', '21444444-4', '21555555-5',
        '21666666-6', '21777777-7', '21888888-8', '21999999-9', '21101010-K',
        '22111111-1', '22222222-2', '22333333-3', '22444444-4', '22555555-5',
        '22666666-6', '22777777-7', '22888888-8', '22999999-9', '22101010-K'
    ]
    
    # Lista de estudiantes ICINF (ruts)
    estudiantes_icinf = [
        '19111111-1', '19222222-2', '19333333-3', '19444444-4', '19555555-5',
        '19666666-6', '19777777-7', '19888888-8', '19999999-9', '19101010-K',
        '18111111-1', '18222222-2', '18333333-3', '18444444-4', '18555555-5',
        '18666666-6', '18777777-7', '17111111-1', '17222222-2', '17333333-3',
        '17444444-4', '17555555-5', '17666666-6', '17777777-7', '17888888-8',
        '17999999-9', '17101010-K', '16191919-1', '16202020-2', '16212121-3'
    ]
    
    # Lista de profesores (ruts)
    profesores = [
        '16111111-1', '16222222-2', '16333333-3', '16444444-4', '16555555-5',
        '16666666-6', '16777777-7', '16888888-8', '16999999-9', '16101010-K',
        '16121212-1', '16131313-2', '16141414-3', '16151515-4', '16161616-5',
        '16171717-6', '16181818-7'
    ]
    
    # Títulos de propuestas variados
    titulos = [
        ('Sistema de Gestión de Inventario con ML', 'desarrollo_software', 'Inteligencia Artificial', 'media'),
        ('Plataforma E-Learning Adaptativo', 'desarrollo_software', 'Educación y Tecnología', 'alta'),
        ('Sistema IoT Monitoreo Ambiental', 'desarrollo_software', 'Internet de las Cosas', 'media'),
        ('Blockchain para Trazabilidad', 'investigacion', 'Blockchain', 'alta'),
        ('Chatbot IA Atención Cliente', 'desarrollo_software', 'Inteligencia Artificial', 'media'),
        ('App Móvil Finanzas Personales', 'desarrollo_software', 'Desarrollo Móvil', 'baja'),
        ('Sistema Recomendaciones E-Commerce', 'desarrollo_software', 'Machine Learning', 'media'),
        ('Análisis Big Data Healthcare', 'investigacion', 'Ciencia de Datos', 'alta'),
        ('Plataforma Telemedicina', 'desarrollo_software', 'Salud Digital', 'alta'),
        ('Sistema Gestión Académica', 'desarrollo_software', 'Sistemas de Información', 'baja'),
        ('App Control Asistencia QR', 'desarrollo_software', 'Desarrollo Móvil', 'baja'),
        ('Sistema Predicción Demanda', 'investigacion', 'Machine Learning', 'media'),
        ('Plataforma Marketplace Local', 'desarrollo_software', 'E-Commerce', 'media'),
        ('Sistema Gestión Biblioteca Digital', 'desarrollo_software', 'Sistemas de Información', 'media'),
        ('App Turismo Realidad Aumentada', 'desarrollo_software', 'Realidad Aumentada', 'alta'),
        ('Sistema Monitoreo Red Sensores', 'desarrollo_software', 'IoT', 'media'),
        ('Plataforma Crowdfunding', 'desarrollo_software', 'Fintech', 'alta'),
        ('Sistema Análisis Sentimientos', 'investigacion', 'NLP', 'media'),
        ('App Fitness Gamificada', 'desarrollo_software', 'Gamificación', 'baja'),
        ('Sistema Gestión Proyectos Agile', 'desarrollo_software', 'Gestión de Proyectos', 'media'),
    ]
    
    sql.append("\n-- ============================================")
    sql.append("-- PROPUESTAS - TODOS LOS ESTADOS")
    sql.append("-- ============================================\n")
    
    propuesta_id = 1
    all_estudiantes = estudiantes_ieci + estudiantes_icinf
    
    # Generar propuestas en diferentes estados
    # Estado 1: Pendiente (10 propuestas)
    # Estado 2: En revisión (8 propuestas)
    # Estado 3: Correcciones solicitadas (6 propuestas)
    # Estado 4: Aprobada (20 propuestas)
    # Estado 5: Rechazada (4 propuestas)
    
    estados_count = {1: 10, 2: 8, 3: 6, 4: 20, 5: 4}
    
    for estado_id, count in estados_count.items():
        for i in range(count):
            estudiante_rut = random.choice(all_estudiantes)
            titulo_data = random.choice(titulos)
            titulo, modalidad, area, complejidad = titulo_data
            
            # Calcular fechas variadas (últimos 6 meses)
            dias_atras = random.randint(7, 180)
            fecha_envio = f"DATE_SUB(NOW(), INTERVAL {dias_atras} DAY)"
            
            fecha_revision = ''
            if estado_id in [3, 4, 5]:  # Estados que requieren fecha_revision
                dias_revision = random.randint(5, 30)
                fecha_revision = f", DATE_SUB(NOW(), INTERVAL {dias_revision} DAY)"
            
            sql.append(f"INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo, modalidad, numero_estudiantes, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, complejidad_estimada{', fecha_revision' if fecha_revision else ''}) VALUES")
            sql.append(f"('{titulo} #{propuesta_id}', 'Descripción completa de la propuesta #{propuesta_id}', '{estudiante_rut}', {estado_id}, {fecha_envio}, 'propuesta_{propuesta_id}.pdf', '{modalidad}', 1, {random.choice([1, 2])}, '{area}', 'Objetivo general del proyecto', 'Objetivos específicos detallados', 'Metodología propuesta', '{complejidad}'{fecha_revision});\n")
            
            propuesta_id += 1
    
    print(f"Total propuestas generadas: {propuesta_id - 1}")
    
    # Generar asignaciones de propuestas a profesores
    sql.append("\n-- ============================================")
    sql.append("-- ASIGNACIONES DE PROPUESTAS A PROFESORES")
    sql.append("-- ============================================\n")
    
    for pid in range(1, propuesta_id):
        profesor = random.choice(profesores)
        sql.append(f"INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, asignado_por) VALUES ({pid}, '{profesor}', '18765432-1');\n")
    
    # Generar proyectos de las propuestas aprobadas
    sql.append("\n-- ============================================")
    sql.append("-- PROYECTOS - TODOS LOS ESTADOS")
    sql.append("-- ============================================\n")
    
    # Estados de proyectos: 1-10 diferentes estados
    # Tomamos propuestas aprobadas para crear proyectos
    proyecto_id = 1
    proyectos_estudiantes = []  # Para guardar qué estudiante tiene cada proyecto
    
    for i in range(1, 21):  # 20 proyectos
        propuesta_id_ref = 24 + i  # Propuestas aprobadas (estado_id=4)
        estado_proyecto = random.choice([1, 2, 2, 2, 3, 4, 5, 6, 7, 8])  # Estados variados, más peso en "en_desarrollo"
        
        # Alternar entre ICINF e IECI
        if proyecto_id % 2 == 0:
            estudiante = random.choice(estudiantes_icinf)
            carrera_tipo = 'ICINF'
        else:
            estudiante = random.choice(estudiantes_ieci)
            carrera_tipo = 'IECI'
        
        proyectos_estudiantes.append((proyecto_id, estudiante, carrera_tipo))
        
        dias_inicio = random.randint(30, 170)
        dias_entrega = random.randint(30, 300)
        
        sql.append(f"-- Proyecto {proyecto_id} - {carrera_tipo}\n")
        sql.append(f"INSERT INTO proyectos (titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, modalidad, complejidad, duracion_semestres, porcentaje_avance) VALUES\n")
        sql.append(f"('Proyecto #{proyecto_id}', 'Descripción del proyecto', {propuesta_id_ref}, '{estudiante}', {estado_proyecto}, DATE_SUB(NOW(), INTERVAL {dias_inicio} DAY), DATE_ADD(NOW(), INTERVAL {dias_entrega} DAY), 'desarrollo_software', 'media', {random.choice([1, 2])}, {random.randint(0, 100)});\n")
        
        proyecto_id += 1
    
    # Generar estudiantes_proyectos
    sql.append("\n-- ============================================")
    sql.append("-- ESTUDIANTES EN PROYECTOS")
    sql.append("-- ============================================\n")
    
    for pid, estudiante, carrera in proyectos_estudiantes:
        sql.append(f"-- Proyecto {pid} - {carrera} - Estudiante: {estudiante}\n")
        sql.append(f"INSERT INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) VALUES ({pid}, '{estudiante}', 1, 1);\n")
    
    # Generar asignaciones de profesores a proyectos
    sql.append("\n-- ============================================")
    sql.append("-- ASIGNACIONES PROFESORES A PROYECTOS")
    sql.append("-- ============================================\n")
    
    for pid, estudiante, carrera in proyectos_estudiantes:
        profesor_guia = random.choice(profesores)
        profesor_informante = random.choice([p for p in profesores if p != profesor_guia])
        profesor_sala = random.choice([p for p in profesores if p not in [profesor_guia, profesor_informante]])
        
        dias_asig = random.randint(30, 165)
        
        es_icinf = (carrera == 'ICINF')
        
        sql.append(f"-- Proyecto {pid} - {carrera} {'(incluye Profesor de Sala)' if es_icinf else '(sin Profesor de Sala)'}\n")
        sql.append(f"INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, activo, asignado_por) VALUES\n")
        sql.append(f"({pid}, '{profesor_guia}', 2, DATE_SUB(NOW(), INTERVAL {dias_asig} DAY), TRUE, '18765432-1'),\n")
        
        if es_icinf:
            sql.append(f"({pid}, '{profesor_sala}', 3, DATE_SUB(NOW(), INTERVAL {dias_asig} DAY), TRUE, '18765432-1'),\n")
        
        sql.append(f"({pid}, '{profesor_informante}', 4, DATE_SUB(NOW(), INTERVAL {dias_asig} DAY), TRUE, '18765432-1');\n")
    
    # Generar fechas importantes
    sql.append("\n-- ============================================")
    sql.append("-- FECHAS IMPORTANTES")
    sql.append("-- ============================================\n")
    
    # Fechas globales
    sql.append("INSERT INTO fechas (titulo, descripcion, fecha, tipo_fecha, creado_por_rut, es_global, activa) VALUES\n")
    sql.append("('Inicio Período 2026-1', 'Inicio semestre', '2026-03-01', 'academica', '18765432-1', 1, 1),\n")
    sql.append("('Fin Período 2026-1', 'Fin semestre', '2026-07-31', 'academica', '18765432-1', 1, 1),\n")
    sql.append("('Plazo Propuestas', 'Fecha límite propuestas', '2026-04-15', 'deadline', '18765432-1', 1, 1),\n")
    sql.append("('Período Defensas', 'Defensas finales', '2026-07-15', 'defensa', '18765432-1', 1, 1);\n\n")
    
    # Fechas por proyecto
    for pid in range(1, min(proyecto_id, 11)):  # Primeros 10 proyectos
        profesor = random.choice(profesores)
        for i in range(3):
            dias = random.randint(10, 90)
            tipo = random.choice(['entrega', 'reunion', 'hito', 'revision', 'defensa'])
            sql.append(f"INSERT INTO fechas (titulo, descripcion, fecha, tipo_fecha, proyecto_id, creado_por_rut, es_global, activa) VALUES\n")
            sql.append(f"('Evento #{i+1} Proyecto {pid}', 'Descripción del evento', DATE_ADD(NOW(), INTERVAL {dias} DAY), '{tipo}', {pid}, '{profesor}', 0, 1);\n")
    
    # Generar disponibilidad horaria de profesores
    sql.append("\n-- ============================================")
    sql.append("-- DISPONIBILIDAD HORARIOS")
    sql.append("-- ============================================\n")
    
    dias_semana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
    for profesor in profesores:
        for _ in range(random.randint(2, 4)):
            dia = random.choice(dias_semana)
            hora_inicio = f"{random.randint(8, 16)}:00:00"
            hora_fin = f"{random.randint(10, 18)}:00:00"
            sql.append(f"INSERT INTO disponibilidad_horarios (usuario_rut, dia_semana, hora_inicio, hora_fin, activo) VALUES ('{profesor}', '{dia}', '{hora_inicio}', '{hora_fin}', 1);\n")
    
    # Generar solicitudes de reunión
    sql.append("\n-- ============================================")
    sql.append("-- SOLICITUDES DE REUNIÓN")
    sql.append("-- ============================================\n")
    
    estados_reunion = ['pendiente', 'aceptada_profesor', 'confirmada', 'rechazada', 'cancelada']
    for pid in range(1, min(proyecto_id, 11)):
        profesor = random.choice(profesores)
        estudiante = random.choice(all_estudiantes)
        estado = random.choice(estados_reunion)
        dias = random.randint(1, 30)
        tipo = random.choice(['seguimiento', 'revision_avance', 'orientacion'])
        creado = random.choice(['estudiante', 'profesor'])
        
        sql.append(f"INSERT INTO solicitudes_reunion (proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, hora_propuesta, tipo_reunion, descripcion, estado, creado_por) VALUES\n")
        sql.append(f"({pid}, '{profesor}', '{estudiante}', DATE_ADD(NOW(), INTERVAL {dias} DAY), '10:00:00', '{tipo}', 'Descripción reunión', '{estado}', '{creado}');\n")
    
    # Generar notificaciones
    sql.append("\n-- ============================================")
    sql.append("-- NOTIFICACIONES")
    sql.append("-- ============================================\n")
    
    tipos_notif = ['fecha_limite_proxima', 'revision_pendiente', 'cronograma_modificado', 'nueva_entrega', 'proyecto_creado']
    roles_notif = ['estudiante', 'profesor_guia', 'profesor_revisor']
    
    for pid in range(1, min(proyecto_id, 11)):
        estudiante = random.choice(all_estudiantes)
        tipo = random.choice(tipos_notif)
        rol = random.choice(roles_notif)
        leida = random.choice([0, 1])
        
        sql.append(f"INSERT INTO notificaciones_proyecto (proyecto_id, destinatario_rut, tipo_notificacion, rol_destinatario, titulo, mensaje, leida) VALUES\n")
        sql.append(f"({pid}, '{estudiante}', '{tipo}', '{rol}', 'Notificación importante', 'Mensaje de la notificación', {leida});\n")
    
    # Final del script
    sql.append("\n-- ============================================")
    sql.append("-- FIN DEL SCRIPT")
    sql.append("-- ============================================\n")
    sql.append("SET FOREIGN_KEY_CHECKS = 1;\n")
    sql.append("SELECT 'Datos masivos insertados correctamente' AS Resultado;\n")
    sql.append("SELECT \n")
    sql.append("    (SELECT COUNT(*) FROM usuarios) AS Usuarios,\n")
    sql.append("    (SELECT COUNT(*) FROM propuestas) AS Propuestas,\n")
    sql.append("    (SELECT COUNT(*) FROM proyectos) AS Proyectos,\n")
    sql.append("    (SELECT COUNT(*) FROM asignaciones_proyectos) AS Asignaciones,\n")
    sql.append("    (SELECT COUNT(*) FROM fechas) AS Fechas,\n")
    sql.append("    (SELECT COUNT(*) FROM solicitudes_reunion) AS Reuniones,\n")
    sql.append("    (SELECT COUNT(*) FROM notificaciones_proyecto) AS Notificaciones;\n")
    
    return '\n'.join(sql)

if __name__ == '__main__':
    print("Generando archivo SQL con datos masivos...")
    sql_content = generate_massive_seed_data()
    
    with open('seed-data-generated.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print("✅ Archivo seed-data-generated.sql creado exitosamente")
    print("Ejecuta este archivo después de seed-data-massive.sql")
