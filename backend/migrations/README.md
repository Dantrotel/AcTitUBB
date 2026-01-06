# 📦 Carpeta de Migraciones - DEPRECADA

## ⚠️ IMPORTANTE: Esta carpeta ya no se usa

**Fecha de cambio**: Diciembre 2025

Todas las migraciones SQL han sido **integradas en el archivo principal**:
- 📁 `backend/src/db/database.sql`

## ¿Qué pasó con las migraciones?

### ✅ Migraciones Integradas

Los siguientes archivos SQL fueron integrados en `database.sql`:

1. **`add_archivo_revision_to_historial.sql`** ✅
   - Agregaba columnas `archivo_revision` y `nombre_archivo_original` a `historial_revisiones_propuestas`
   - Ahora está en las líneas 145-146 de `database.sql`

2. **`add_colaboradores_auth.sql`** ✅
   - Sistema completo de autenticación para colaboradores externos
   - Tablas: `evaluaciones_colaboradores`, `tokens_colaboradores`, `notificaciones_colaboradores`
   - Ahora está integrado completamente en `database.sql`

3. **`create_versiones_propuestas.sql`** ✅
   - Tabla para historial de versiones de propuestas
   - Ya no es necesaria, la funcionalidad está en `archivos_propuesta`

### 🗑️ Scripts JavaScript Deprecados

Los siguientes scripts JS ya no son necesarios:

- `add_debe_cambiar_password.js` - El campo ya está en la tabla `usuarios`
- `fix_historial_columns.js` - Las columnas ya están definidas
- `run_add_archivo_revision.js` - Ya integrado
- `run-colaboradores-auth.js` - Ya integrado

## ¿Cómo funciona ahora?

### Inicialización Automática

1. Al iniciar el backend (`npm run dev`):
   - Se ejecuta automáticamente `database.sql`
   - Se crean todas las tablas con todas las columnas necesarias
   - Se insertan los datos iniciales

2. **No necesitas**:
   - ❌ Ejecutar migraciones manualmente
   - ❌ Correr scripts de migración
   - ❌ Preocuparte por el orden de ejecución

### Para Agregar Nuevas Funcionalidades

Si necesitas modificar la estructura de la base de datos:

1. **Edita** `backend/src/db/database.sql`
2. **Agrega** tu cambio usando `CREATE TABLE IF NOT EXISTS` o `ALTER TABLE`
3. **Reinicia** el backend
4. El sistema aplicará los cambios automáticamente

## Limpieza Recomendada

Puedes eliminar estos archivos de forma segura:

```bash
# Scripts JavaScript de migración (ya no se usan)
rm backend/migrations/*.js

# O simplemente mantén esta carpeta vacía con este README
```

## Referencias

- 📄 **Estructura completa**: `backend/src/db/database.sql`
- 📖 **Documentación**: `backend/src/db/README-DATABASE.md`
- 🔧 **Inicialización**: `backend/src/db/connectionDB.js`

---

**✨ Todo está unificado en un solo archivo para mayor simplicidad y mantenibilidad.**

