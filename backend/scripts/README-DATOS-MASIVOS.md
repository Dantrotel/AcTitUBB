# Datos Masivos de Prueba - AcTitUBB

## 📊 Resumen de Datos Generados

Este conjunto de scripts genera datos masivos para probar todas las funcionalidades del sistema:

### Usuarios (81 total)
- **1 Super Admin**: 17654321-0
- **3 Administradores**: 18765432-1, 18876543-2, 18987654-3
- **17 Profesores**: 16111111-1 hasta 16181818-7
- **60 Estudiantes**:
  - 30 de Ingeniería Civil en Informática (ICINF)
  - 30 de Ingeniería Ejecución en Computación e Informática (IECI)

### Propuestas (48 total)
- **Estado 1 (Pendiente)**: 10 propuestas
- **Estado 2 (En revisión)**: 8 propuestas
- **Estado 3 (Correcciones)**: 6 propuestas
- **Estado 4 (Aprobada)**: 20 propuestas
- **Estado 5 (Rechazada)**: 4 propuestas

### Proyectos (20 total)
- **10 proyectos ICINF** (pares: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20)
- **10 proyectos IECI** (impares: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19)
- Distribuidos en todos los estados posibles (1-8)

### Asignaciones de Profesores
- **Todos los proyectos tienen**:
  - ✅ Profesor Guía (rol_profesor_id = 2)
  - ✅ Profesor Informante (rol_profesor_id = 4)

- **SOLO proyectos ICINF tienen**:
  - ✅ **Profesor de Sala (rol_profesor_id = 3)**

- **Proyectos IECI NO tienen**:
  - ❌ Profesor de Sala (filtrado por carrera)

### Otros Datos
- **48 asignaciones de propuestas** a profesores revisores
- **20 estudiantes_proyectos**
- **4 fechas globales** importantes
- **30 fechas específicas** de proyectos
- **Disponibilidad horaria** para los 17 profesores
- **10 solicitudes de reunión** en diferentes estados
- **10 notificaciones** de proyectos

---

## 🚀 Instrucciones de Ejecución

### Paso 1: Preparar el entorno
```bash
# Asegúrate de que Docker esté corriendo y la base de datos esté activa
docker-compose up -d mysql
```

### Paso 2: Ejecutar los scripts en orden

#### 2.1. Primero ejecuta seed-data-massive.sql (usuarios y estructura)
```sql
-- Este script crea:
-- - Todos los usuarios (81)
-- - Estructura académica (facultades, departamentos, carreras)
-- - Asignaciones estudiante-carrera y profesor-departamento
-- - Entidades externas y colaboradores

-- Ejecuta en MySQL Workbench o tu cliente SQL preferido
SOURCE C:/Users/labes/OneDrive/Escritorio/AcTitUBB/backend/scripts/seed-data-massive.sql;
```

#### 2.2. Luego ejecuta seed-data-generated.sql (propuestas, proyectos y relaciones)
```sql
-- Este script crea:
-- - 48 propuestas en todos los estados
-- - 20 proyectos (10 ICINF con Profesor de Sala, 10 IECI sin)
-- - Todas las asignaciones y fechas
-- - Solicitudes de reunión y notificaciones

SOURCE C:/Users/labes/OneDrive/Escritorio/AcTitUBB/backend/scripts/seed-data-generated.sql;
```

### Paso 3: Verificar la carga de datos
```sql
-- Ejecuta este query para verificar que todo se cargó correctamente
SELECT 
    (SELECT COUNT(*) FROM usuarios) AS Usuarios,
    (SELECT COUNT(*) FROM propuestas) AS Propuestas,
    (SELECT COUNT(*) FROM proyectos) AS Proyectos,
    (SELECT COUNT(*) FROM asignaciones_proyectos) AS Asignaciones,
    (SELECT COUNT(*) FROM fechas) AS Fechas,
    (SELECT COUNT(*) FROM solicitudes_reunion) AS Reuniones,
    (SELECT COUNT(*) FROM notificaciones_proyecto) AS Notificaciones;
```

**Resultado esperado:**
| Usuarios | Propuestas | Proyectos | Asignaciones | Fechas | Reuniones | Notificaciones |
|----------|------------|-----------|--------------|--------|-----------|----------------|
| 81       | 48         | 20        | 50           | 34     | 10        | 10             |

---

## 🔍 Verificación del Filtrado de Profesor de Sala

### Query para verificar asignaciones por carrera
```sql
-- Proyectos ICINF con Profesor de Sala (deben aparecer)
SELECT 
    p.id AS proyecto_id,
    p.titulo,
    car.codigo AS carrera,
    rp.nombre AS rol_profesor
FROM proyectos p
JOIN estudiantes_carreras ec ON p.estudiante_rut = ec.estudiante_rut AND ec.es_carrera_principal = 1
JOIN carreras car ON ec.carrera_id = car.id
JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
WHERE car.codigo = 'ICINF' AND rp.id = 3
ORDER BY p.id;
```

**Resultado esperado:** 10 filas (proyectos 2, 4, 6, 8, 10, 12, 14, 16, 18, 20)

```sql
-- Proyectos IECI SIN Profesor de Sala (no deben aparecer)
SELECT 
    p.id AS proyecto_id,
    p.titulo,
    car.codigo AS carrera,
    COUNT(ap.id) AS asignaciones_totales,
    SUM(CASE WHEN rp.id = 3 THEN 1 ELSE 0 END) AS profesores_sala
FROM proyectos p
JOIN estudiantes_carreras ec ON p.estudiante_rut = ec.estudiante_rut AND ec.es_carrera_principal = 1
JOIN carreras car ON ec.carrera_id = car.id
LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
WHERE car.codigo = 'IECI'
GROUP BY p.id, p.titulo, car.codigo
ORDER BY p.id;
```

**Resultado esperado:** profesores_sala debe ser 0 para todos los proyectos IECI

---

## 🧪 Casos de Prueba

### 1. Dashboard - Carga de Profesores
- Verificar que aparezcan los nombres de los profesores
- Verificar que se muestren los conteos de roles correctamente
- Verificar porcentajes con máximo 2 decimales

### 2. Gestión de Usuarios
- **Como Admin**: Solo debe ver estudiantes y profesores (no otros admins)
- **Como Super Admin**: Debe ver todos excepto sí mismo

### 3. Asignaciones de Proyectos
- **Para proyectos ICINF**: El rol "Profesor de Sala" debe aparecer en el selector
- **Para proyectos IECI**: El rol "Profesor de Sala" NO debe aparecer
- Debe mostrarse el mensaje informativo cuando se filtra

### 4. Propuestas
- Verificar que hay propuestas en todos los estados (1-5)
- Verificar que las fechas están distribuidas en los últimos 6 meses

### 5. Proyectos
- Verificar proyectos en todos los estados (1-8)
- Verificar que proyectos ICINF tienen 3 profesores asignados (Guía, Sala, Informante)
- Verificar que proyectos IECI tienen 2 profesores asignados (Guía, Informante)

---

## 🔐 Credenciales de Prueba

### Super Admin
- RUT: 17654321-0
- Password: admin123

### Administradores
- RUT: 18765432-1 | Password: admin123
- RUT: 18876543-2 | Password: admin123
- RUT: 18987654-3 | Password: admin123

### Profesores (todos usan password: profesor123)
- 16111111-1, 16222222-2, 16333333-3, etc.

### Estudiantes (todos usan password: estudiante123)
- **IECI**: 20111111-1, 20222222-2, ... hasta 22101010-K
- **ICINF**: 19111111-1, 19222222-2, ... hasta 16212121-3

---

## 🛠️ Regenerar Datos

Si necesitas regenerar los datos transaccionales (propuestas, proyectos, etc.):

```bash
cd backend/scripts
python generate_seed_data.py
```

Esto regenerará el archivo `seed-data-generated.sql` con nuevas propuestas y proyectos aleatorios, manteniendo siempre la regla de Profesor de Sala solo para ICINF.

---

## 📝 Notas Importantes

1. **Orden de ejecución**: Siempre ejecuta `seed-data-massive.sql` ANTES que `seed-data-generated.sql`
2. **Integridad referencial**: Los scripts respetan todas las restricciones de clave foránea
3. **Fechas dinámicas**: Todas las fechas son relativas a NOW() para mantener relevancia
4. **RUTs válidos**: Todos los RUTs son válidos con su dígito verificador correcto
5. **Profesor de Sala**: Esta lógica es CRÍTICA y está implementada en:
   - Backend: [backend/src/models/project.model.js](../../backend/src/models/project.model.js)
   - Frontend: [frontend/src/app/pages/admin/asignaciones/asignaciones.ts](../../frontend/src/app/pages/admin/asignaciones/asignaciones.ts)
   - Base de datos: Este seed data mantiene la integridad

---

## ⚠️ Troubleshooting

### Error: Duplicate entry for key 'PRIMARY'
- Solución: Limpia la base de datos antes de ejecutar
```sql
DROP DATABASE IF EXISTS actitubb_db;
CREATE DATABASE actitubb_db;
USE actitubb_db;
SOURCE path/to/database.sql;
```

### Error: Cannot add or update a child row: a foreign key constraint fails
- Solución: Verifica que ejecutaste seed-data-massive.sql PRIMERO

### No aparecen datos en el frontend
- Verifica que el backend esté corriendo
- Verifica que las credenciales sean correctas
- Revisa los logs del backend para errores de autenticación

---

## ✅ Checklist de Validación

- [ ] 81 usuarios creados
- [ ] 48 propuestas en todos los estados
- [ ] 20 proyectos (10 ICINF + 10 IECI)
- [ ] Proyectos ICINF tienen Profesor de Sala
- [ ] Proyectos IECI NO tienen Profesor de Sala
- [ ] Dashboard muestra porcentajes con 2 decimales
- [ ] Admin no ve otros admins en gestión de usuarios
- [ ] Filtro de Profesor de Sala funciona en asignaciones

---

**Generado por**: generate_seed_data.py
**Última actualización**: 2025-01-21
