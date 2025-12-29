# 📋 Gestión de Base de Datos - AcTitUBB

## 🗂️ Estructura de Archivos

### Archivo Principal
- **`database.sql`** - Schema completo y consolidado de la base de datos
  - Contiene TODAS las tablas necesarias
  - Incluye datos iniciales (roles, estados, etc.)
  - Se ejecuta automáticamente al iniciar el backend si las tablas no existen
  - **Este es el único archivo que necesitas para crear la BD desde cero**

### Archivos de Utilidad
- **`datos-prueba.sql`** - Datos ficticios para desarrollo y testing
  - Usuarios de prueba
  - Propuestas de ejemplo
  - Proyectos de muestra
  - NO se ejecuta automáticamente

- **`check-corrupted-data.sql`** - Script para verificar datos corruptos
  - Útil para diagnóstico
  - Ejecutar manualmente cuando sea necesario

- **`fix-corrupted-data.sql`** - Script para limpiar datos corruptos
  - Hace backup antes de limpiar
  - Ejecutar manualmente solo si hay problemas

## 🚀 Inicialización Automática

El backend ejecuta automáticamente `database.sql` cuando:
1. Detecta que las tablas no existen
2. Se inicia por primera vez
3. Se reinicia después de eliminar la BD

Ver `backend/src/db/connectionDB.js` para más detalles.

## 📦 Tablas Principales

### Sistema de Usuarios
- `roles` - Roles del sistema (estudiante, profesor, admin, superadmin)
- `usuarios` - Usuarios del sistema
- `carreras` - Carreras universitarias
- `facultades` - Facultades
- `departamentos` - Departamentos académicos

### Sistema de Propuestas
- `propuestas` - Propuestas de título
- `estados_propuestas` - Estados de las propuestas
- `estudiantes_propuestas` - Relación estudiantes-propuestas
- `asignaciones_propuestas` - Asignación de profesores a propuestas
- `historial_revisiones_propuestas` - Historial de revisiones
- `archivos_propuesta` - Sistema de versionado de archivos
- `periodos_propuestas` - Control de fechas de envío

### Sistema de Proyectos
- `proyectos` - Proyectos de título aprobados
- `estados_proyectos` - Estados de los proyectos
- `estudiantes_proyectos` - Relación estudiantes-proyectos
- `profesores_proyectos` - Asignación de profesores a proyectos
- `roles_profesores` - Roles de profesores (guía, co-guía, informante)

### Sistema de Cronogramas
- `cronogramas_proyecto` - Cronogramas de proyectos
- `hitos_cronograma` - Hitos y entregas
- `entregas_hitos` - Entregas de estudiantes

### Sistema de Avances
- `avances` - Avances de proyectos
- `archivos_avance` - Archivos adjuntos a avances

### Sistema de Fechas
- `fechas` - Fechas importantes globales
- `fechas_importantes_proyectos` - Fechas específicas por proyecto
- `alertas_fechas` - Alertas automáticas

### Sistema de Reuniones
- `solicitudes_reunion` - Solicitudes de reunión
- `reuniones` - Reuniones programadas
- `disponibilidad_profesores` - Disponibilidad de profesores

### Sistema de Colaboradores Externos
- `entidades_externas` - Empresas y organizaciones
- `colaboradores_externos` - Colaboradores individuales
- `colaboradores_proyectos` - Asignación a proyectos
- `evaluaciones_colaboradores_externos` - Evaluaciones

### Sistema de Notificaciones
- `notificaciones` - Notificaciones del sistema
- `actividad_sistema` - Log de actividad

### Sistema de Configuración
- `configuracion_sistema` - Configuración global
- `versiones_plantillas` - Control de versiones de plantillas

## 🔄 Migraciones Consolidadas

Todas las migraciones anteriores han sido consolidadas en `database.sql`:
- ✅ Tabla `archivos_propuesta`
- ✅ Columnas `archivo_revision` y `nombre_archivo_original` en `historial_revisiones_propuestas`
- ✅ Tabla `periodos_propuestas`
- ✅ Columnas `fecha_inicio`, `hora_inicio`, `hora_limite` en `fechas`
- ✅ Columna `debe_cambiar_password` en `usuarios`

## 📝 Notas Importantes

1. **NO crear archivos de migración separados** - Todos los cambios van directamente a `database.sql`
2. **Usar `CREATE TABLE IF NOT EXISTS`** - Para evitar errores al re-ejecutar
3. **Usar `INSERT IGNORE`** - Para datos iniciales que no deben duplicarse
4. **Documentar cambios** - Agregar comentarios SQL explicativos
5. **Mantener orden lógico** - Tablas relacionadas juntas

## 🛠️ Workflow de Desarrollo

### Para agregar una nueva tabla:
1. Editar `backend/src/db/database.sql`
2. Agregar la tabla en la sección correspondiente
3. Agregar datos iniciales si es necesario
4. Reiniciar el backend para probar

### Para modificar una tabla existente:
1. Usar `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
2. Agregar al final de `database.sql` o en la sección de la tabla
3. Documentar el cambio con comentarios

### Para datos de prueba:
1. Usar `backend/scripts/seed-data.sql` (se ejecuta manualmente)
2. O agregar a `datos-prueba.sql` para casos específicos

## 🔍 Verificación

Para verificar que todo está correcto:
```bash
# Desde el directorio backend
mysql -u root -p actitubb < src/db/database.sql
```

O simplemente reinicia el backend y verifica los logs.

