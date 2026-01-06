# 📊 Sistema de Base de Datos - AcTitUBB

Este documento explica cómo funciona el sistema de base de datos y su inicialización automática.

---

## 🚀 Inicialización Automática

El sistema **ejecuta automáticamente** el archivo `database.sql` cuando se inicia el backend. No necesitas hacer nada manualmente.

### ¿Cómo Funciona?

1. **Al iniciar el backend** (`npm run dev` o `npm start`):
   - Se ejecuta `src/db/connectionDB.js`
   - Se llama a la función `initializeDatabase()`

2. **Proceso de Inicialización**:
   ```
   1. Esperar a MySQL (waitForMySQL)
   2. Crear BD si no existe (initDatabase)
   3. Verificar tablas existentes (checkTablesExist)
   4. Ejecutar database.sql si es necesario (executeDatabaseScript)
   5. Verificar que todo esté correcto (verifyTables)
   ```

3. **Modo Inteligente**:
   - Si las tablas YA existen → No hace nada
   - Si faltan tablas → Ejecuta `database.sql`
   - Ignora errores de "ya existe" o "duplicado"

---

## 📁 Estructura de Archivos

```
backend/src/db/
├── database.sql          ← ARCHIVO PRINCIPAL (se ejecuta automáticamente)
├── database.sql.backup   ← Respaldo del archivo original
├── connectionDB.js       ← Lógica de conexión e inicialización
├── datos-prueba.sql      ← Datos de ejemplo (NO se ejecuta automáticamente)
└── README-DATABASE.md    ← Este archivo
```

### 📋 `database.sql` (Archivo Principal - UNIFICADO)

**✨ ACTUALIZADO (Diciembre 2025)**: Este archivo ahora contiene **TODA** la estructura de la base de datos unificada, incluyendo todas las migraciones anteriores.

Contiene:

1. **Creación de BD**: `CREATE DATABASE IF NOT EXISTS actitubb`
2. **Tablas Principales**: 
   - Usuarios, roles, propuestas, proyectos
   - Avances, fechas, reuniones
   - Cronogramas, hitos
   
3. **Tablas de Colaboradores Externos**:
   - `entidades_externas`
   - `colaboradores_externos` (con autenticación integrada)
   - `colaboradores_proyectos`
   - `evaluaciones_colaboradores_externos`
   - `evaluaciones_colaboradores` (nueva)
   - `tokens_colaboradores` (nueva)
   - `notificaciones_colaboradores` (nueva)

4. **Tablas de Sistema**:
   - `actividad_sistema`
   - `configuracion_sistema`
   - `versiones_documento`
   - `comentarios_version`
   - `plantillas_documentos`
   - `resultados_finales_proyecto`
   - `historial_estados_proyecto`

5. **Migraciones Integradas** (ya no necesitas archivos separados):
   - ✅ Sistema de autenticación para colaboradores externos
   - ✅ Campos de archivo_revision en historial_revisiones_propuestas
   - ✅ Tabla versiones_propuestas para historial completo
   - ✅ Todas las columnas adicionales necesarias

6. **Datos Iniciales**:
   - Roles (estudiante, profesor, admin, superadmin)
   - Estados de propuestas
   - Estados de proyectos
   - Configuraciones del sistema

**📌 Nota Importante**: Ya no necesitas ejecutar migraciones separadas. Todo está en un solo archivo que se ejecuta automáticamente al iniciar el backend.

---

## ⚙️ ¿Qué Hacer Si...?

### ❓ ¿Qué pasó con las migraciones en `/migrations`?

**✅ Ya están integradas en `database.sql`**

Anteriormente teníamos archivos separados en `backend/migrations/`:
- `add_archivo_revision_to_historial.sql` → ✅ Integrado
- `add_colaboradores_auth.sql` → ✅ Integrado
- `create_versiones_propuestas.sql` → ✅ Integrado

Todos estos cambios ahora están en `database.sql`, por lo que:
- No necesitas ejecutar migraciones manualmente
- No hay archivos SQL dispersos por el proyecto
- Todo se ejecuta automáticamente al iniciar el backend

### ❓ Necesito agregar una nueva tabla

1. **Edita** `database.sql`
2. **Agrega** la nueva tabla con `CREATE TABLE IF NOT EXISTS`
3. **Reinicia** el backend
4. El sistema detectará que falta la tabla y la creará

### ❓ Necesito modificar una tabla existente

**OPCIÓN 1: Para desarrollo (sin datos importantes)**
```sql
-- En database.sql, modifica la definición de la tabla
-- Luego elimina y recrea la BD:
DROP DATABASE actitubb;
-- Reinicia el backend (se recreará todo)
```

**OPCIÓN 2: Para producción (con datos importantes)**
```sql
-- Crea un script de migración manual:
USE actitubb;
ALTER TABLE nombre_tabla ADD COLUMN nueva_columna VARCHAR(100);
-- Ejecuta manualmente: mysql -u root -p actitubb < migracion.sql
```

### ❓ Necesito datos de prueba

Usa el script de seed:
```bash
# Cargar datos ficticios completos
mysql -u root -p actitubb < backend/scripts/seed-data.sql

# O cargar datos antiguos
mysql -u root -p actitubb < backend/src/db/datos-prueba.sql
```

### ❓ Necesito resetear la base de datos

```bash
# Opción 1: Desde MySQL
mysql -u root -p
> DROP DATABASE actitubb;
> EXIT;
npm run dev  # Se recreará automáticamente

# Opción 2: Re-ejecutar database.sql manualmente
mysql -u root -p actitubb < backend/src/db/database.sql
```

---

## 🔧 Variables de Entorno

Configuración necesaria en `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=actitubb
```

---

## 📝 Logs del Sistema

Al iniciar, verás en la consola:

```
🚀 Iniciando inicialización de base de datos...
✅ MySQL está disponible
✅ Base de datos 'actitubb' verificada o creada
📖 Leyendo archivo database.sql...
🔧 Ejecutando script SQL completo...
✅ Script database.sql ejecutado correctamente
✅ Tablas existentes (45): roles, usuarios, estados_propuestas...
📊 Datos iniciales: 4 roles, 5 estados, 3 roles de profesores
✅ Verificación de tablas completada
🎉 Base de datos inicializada correctamente
```

---

## ⚠️ Importante

### ✅ SÍ hacer:
- Editar `database.sql` para agregar nuevas tablas
- Usar `CREATE TABLE IF NOT EXISTS` para evitar errores
- Reiniciar el backend para aplicar cambios
- Mantener datos iniciales (roles, estados) en `database.sql`

### ❌ NO hacer:
- Crear archivos `migration_*.sql` separados
- Ejecutar scripts SQL manualmente en producción sin backup
- Eliminar datos iniciales de `database.sql`
- Modificar tablas directamente sin actualizar `database.sql`

---

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo:
1. Edita `database.sql`
2. Reinicia el backend (`npm run dev`)
3. Verifica que los cambios se aplicaron
4. Commit a Git

### Para Producción:
1. Haz backup de la BD actual
2. Prueba los cambios en desarrollo
3. Crea script de migración si es necesario
4. Aplica cambios en producción
5. Verifica que todo funcione

---

## 📚 Referencias

- **Conexión**: `backend/src/db/connectionDB.js`
- **Estructura**: `backend/src/db/database.sql`
- **Datos de prueba**: `backend/scripts/seed-data.sql`
- **Documentación**: Este archivo

---

**¡El sistema maneja todo automáticamente!** 🎉


