#  Unificación de Base de Datos - AcTitUBB

**Fecha**: 29 de Diciembre de 2025  
**Objetivo**: Unificar todos los archivos SQL dispersos en un solo archivo `database.sql`

---

##  Cambios Realizados

### 1. Archivo Principal Unificado

** `backend/src/db/database.sql`** (1,994 líneas)

Este archivo ahora contiene:

-  **Estructura completa de la base de datos** (todas las tablas)
-  **Todas las migraciones integradas** (sin archivos separados)
-  **Datos iniciales** (roles, estados, configuraciones)
-  **Sistema de colaboradores externos** con autenticación
-  **Tablas de versionado** de documentos
-  **Sistema de notificaciones** completo

### 2. Migraciones Integradas

Las siguientes migraciones SQL fueron **integradas** en `database.sql`:

####  `add_archivo_revision_to_historial.sql`
- Columnas `archivo_revision` y `nombre_archivo_original` en `historial_revisiones_propuestas`
- **Ubicación**: Líneas 145-146 del `database.sql`

####  `add_colaboradores_auth.sql`
- Sistema completo de autenticación para colaboradores externos
- Nuevas tablas:
  - `evaluaciones_colaboradores`
  - `tokens_colaboradores`
  - `notificaciones_colaboradores`
- Nuevas columnas en `colaboradores_externos`:
  - `password_hash`
  - `token_acceso`
  - `fecha_token_expira`
  - `ultimo_acceso`
  - `activo_sistema`
- Nuevas columnas en `colaboradores_proyectos`:
  - `evaluacion_solicitada`
  - `fecha_solicitud_evaluacion`
  - `evaluacion_completada`
  - `fecha_evaluacion_completada`

####  `create_versiones_propuestas.sql`
- Tabla `versiones_propuestas` para historial completo
- Ya estaba en el archivo base

### 3. Archivos Eliminados

Los siguientes archivos SQL fueron **eliminados** porque ya están integrados:

```
 backend/migrations/add_archivo_revision_to_historial.sql
 backend/migrations/add_colaboradores_auth.sql
 backend/migrations/create_versiones_propuestas.sql
 backend/src/db/check-corrupted-data.sql
 backend/src/db/fix-corrupted-data.sql
```

### 4. Scripts JavaScript Deprecados

Los siguientes scripts JS **ya no son necesarios** (pero se mantienen por ahora):

```
  backend/migrations/add_debe_cambiar_password.js
  backend/migrations/fix_historial_columns.js
  backend/migrations/run_add_archivo_revision.js
  backend/migrations/run-colaboradores-auth.js
```

**Razón**: El campo `debe_cambiar_password` ya está en la tabla `usuarios` y todas las columnas están definidas en `database.sql`.

### 5. Documentación Actualizada

####  `backend/src/db/README-DATABASE.md`
- Actualizado para reflejar la unificación
- Explica que las migraciones están integradas
- Guía de uso del nuevo sistema

####  `backend/migrations/README.md` (NUEVO)
- Explica por qué la carpeta está deprecada
- Lista las migraciones integradas
- Guía de limpieza recomendada

---

##  Beneficios de la Unificación

###  Simplicidad
- **1 solo archivo** en lugar de múltiples archivos SQL dispersos
- No necesitas ejecutar migraciones manualmente
- No hay orden de ejecución que preocuparse

###  Mantenibilidad
- Toda la estructura en un solo lugar
- Fácil de revisar y entender
- Menos posibilidad de errores

###  Automatización
- Se ejecuta automáticamente al iniciar el backend
- Detecta tablas faltantes y las crea
- Idempotente (puede ejecutarse múltiples veces sin problemas)

###  Consistencia
- Todas las instalaciones tendrán la misma estructura
- No hay riesgo de olvidar ejecutar una migración
- Datos iniciales siempre presentes

---

##  Cómo Usar el Nuevo Sistema

### Inicialización (Automática)

```bash
# Simplemente inicia el backend
npm run dev

# El sistema automáticamente:
# 1. Verifica la conexión a MySQL
# 2. Crea la base de datos si no existe
# 3. Ejecuta database.sql
# 4. Crea todas las tablas con todas las columnas
# 5. Inserta datos iniciales
```

### Agregar Nuevas Tablas o Columnas

```sql
-- 1. Edita backend/src/db/database.sql

-- 2. Agrega tu nueva tabla (ejemplo)
CREATE TABLE IF NOT EXISTS mi_nueva_tabla (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Reinicia el backend (npm run dev)
-- 4. ¡Listo! La tabla se creará automáticamente
```

### Resetear la Base de Datos

```bash
# Opción 1: Desde MySQL
mysql -u root -p
> DROP DATABASE actitubb;
> EXIT;

# Opción 2: Reiniciar el backend
npm run dev
# Se recreará automáticamente con toda la estructura
```

---

##  Estructura Final

```
backend/
├── src/
│   └── db/
│       ├── database.sql          ←  ARCHIVO PRINCIPAL UNIFICADO
│       ├── database.sql.backup   ← Respaldo del original
│       ├── datos-prueba.sql      ← Datos de ejemplo (opcional)
│       ├── connectionDB.js       ← Lógica de inicialización
│       └── README-DATABASE.md    ← Documentación actualizada
├── migrations/
│   ├── README.md                 ←  NUEVO: Explica deprecación
│   ├── add_debe_cambiar_password.js  ← Deprecado (opcional eliminar)
│   ├── fix_historial_columns.js      ← Deprecado (opcional eliminar)
│   ├── run_add_archivo_revision.js   ← Deprecado (opcional eliminar)
│   └── run-colaboradores-auth.js     ← Deprecado (opcional eliminar)
└── scripts/
    └── seed-data.sql             ← Datos de prueba completos
```

---

##  Tablas Incluidas en database.sql

### Tablas Principales (45 tablas)

1. **Usuarios y Roles**
   - `roles`
   - `usuarios`

2. **Propuestas**
   - `estados_propuestas`
   - `periodos_propuestas`
   - `propuestas`
   - `estudiantes_propuestas`
   - `asignaciones_propuestas`
   - `historial_revisiones_propuestas`
   - `archivos_propuesta`

3. **Proyectos**
   - `estados_proyectos`
   - `proyectos`
   - `estudiantes_proyectos`
   - `roles_profesores`
   - `asignaciones_proyectos`
   - `historial_asignaciones`

4. **Avances y Seguimiento**
   - `avances`
   - `hitos_proyecto`
   - `cronogramas_proyecto`
   - `hitos_cronograma`
   - `notificaciones_proyecto`
   - `configuracion_alertas`

5. **Fechas y Calendario**
   - `fechas`
   - `dias_feriados`

6. **Reuniones**
   - `reuniones`
   - `participantes_reuniones`
   - `disponibilidad_horarios`
   - `solicitudes_reunion`
   - `reuniones_calendario`
   - `historial_reuniones`
   - `bloqueos_horarios`
   - `actas_reunion`

7. **Evaluación y Comisiones**
   - `comision_evaluadora`
   - `solicitudes_extension`
   - `historial_extensiones`

8. **Estructura Académica**
   - `facultades`
   - `departamentos`
   - `carreras`
   - `jefes_carreras`
   - `profesores_departamentos`
   - `estudiantes_carreras`
   - `departamentos_carreras`

9. **Colaboradores Externos**  CON AUTENTICACIÓN
   - `entidades_externas`
   - `colaboradores_externos` (con campos de autenticación)
   - `colaboradores_proyectos` (con tracking de evaluaciones)
   - `evaluaciones_colaboradores_externos`
   - `evaluaciones_colaboradores`  NUEVO
   - `tokens_colaboradores`  NUEVO
   - `notificaciones_colaboradores`  NUEVO

10. **Sistema de Mensajería**
    - `conversaciones`
    - `mensajes`
    - `mensajes_no_leidos`

11. **Sistema y Configuración**
    - `configuracion_matching`
    - `configuracion_sistema`
    - `actividad_sistema`

12. **Versiones y Documentos**
    - `versiones_documento`
    - `comentarios_version`
    - `plantillas_documentos`
    - `resultados_finales_proyecto`
    - `historial_estados_proyecto`

13. **Alertas y Control**
    - `alertas_abandono`

---

##  Notas Importantes

###  Hacer
- Usar `database.sql` como fuente única de verdad
- Agregar nuevas tablas/columnas directamente en `database.sql`
- Usar `CREATE TABLE IF NOT EXISTS` para evitar errores
- Reiniciar el backend para aplicar cambios

###  No Hacer
- No crear archivos de migración separados
- No ejecutar scripts SQL manualmente sin backup
- No modificar tablas sin actualizar `database.sql`
- No eliminar datos iniciales de `database.sql`

---

##  Resultado Final

**Antes:**
- 3 archivos SQL de migración dispersos
- 4 scripts JavaScript de migración
- 2 archivos de verificación/corrección de datos
- Necesidad de ejecutar migraciones manualmente
- Riesgo de olvidar ejecutar alguna migración

**Después:**
-  **1 solo archivo SQL** con toda la estructura
-  Inicialización **100% automática**
-  Sin necesidad de ejecutar migraciones manualmente
-  Documentación clara y actualizada
-  Sistema más simple y mantenible

---

##  Referencias

- **Archivo principal**: `backend/src/db/database.sql`
- **Documentación**: `backend/src/db/README-DATABASE.md`
- **Migraciones deprecadas**: `backend/migrations/README.md`
- **Inicialización**: `backend/src/db/connectionDB.js`

---

** ¡Unificación completada exitosamente!**

Ahora tienes un sistema de base de datos más simple, mantenible y fácil de usar.

