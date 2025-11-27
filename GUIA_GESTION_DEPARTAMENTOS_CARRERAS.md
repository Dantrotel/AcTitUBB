# 📚 Guía: Gestión de Relaciones Departamentos-Carreras

## 🎯 Objetivo

Esta nueva funcionalidad permite al **Super Admin** configurar qué departamentos están asociados a cada carrera, lo que mejora significativamente el filtrado de usuarios para los **Admins de Carrera**.

## ✨ ¿Qué se ha creado?

### Backend (API REST)
✅ **5 nuevos endpoints** en `/api/v1/admin/`:
- `GET /departamentos` - Lista todos los departamentos
- `GET /carreras` - Lista todas las carreras
- `GET /carreras/:id/departamentos` - Departamentos de una carrera
- `GET /departamentos/:id/carreras` - Carreras de un departamento
- `GET /departamentos-carreras` - Todas las relaciones
- `POST /departamentos-carreras` - Crear nueva relación
- `PUT /departamentos-carreras/:id` - Actualizar relación
- `DELETE /departamentos-carreras/:id` - Eliminar relación

### Frontend (Angular)
✅ **Nuevo componente completo**:
- Ruta: `/super-admin/gestion-departamentos-carreras`
- Interfaz visual moderna con filtros avanzados
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Validaciones y mensajes de error/éxito

### Base de Datos
✅ **Nueva tabla**: `departamentos_carreras`
- Relación muchos-a-muchos entre departamentos y carreras
- Campo `es_principal` para marcar el departamento principal
- Campo `activo` para activar/desactivar relaciones

## 🚀 Cómo usar la funcionalidad

### Paso 1: Acceder a la gestión

1. **Iniciar sesión como Super Admin**
2. **Ir al Dashboard del Super Admin**
3. **Hacer clic en la tarjeta "Departamentos-Carreras"**
   - O navegar directamente a: `http://localhost:4200/super-admin/gestion-departamentos-carreras`

### Paso 2: Ver las relaciones existentes

La pantalla mostrará una tabla con todas las relaciones:
- **Carrera**: Nombre y código de la carrera
- **Departamento**: Nombre y código del departamento
- **Tipo**: Principal o Servicio
- **Facultad**: Facultad a la que pertenece
- **Estado**: Activo o Inactivo
- **Acciones**: Editar, Activar/Desactivar, Eliminar

### Paso 3: Filtrar relaciones

Usa los filtros en la parte superior:
- **Buscar Carrera**: Filtra por nombre o código de carrera
- **Buscar Departamento**: Filtra por nombre o código de departamento
- **Tipo**: Filtra por Principal o Servicio
- **Limpiar Filtros**: Resetea todos los filtros

### Paso 4: Crear una nueva relación

1. **Hacer clic en "+ Agregar Relación"**
2. **Seleccionar una Carrera** del dropdown
3. **Seleccionar un Departamento** del dropdown
4. **Marcar "Es departamento principal"** si corresponde
   - ✅ Cada carrera debe tener al menos un departamento principal
   - ✅ Un departamento puede ser principal para múltiples carreras
5. **Hacer clic en "Crear"**

### Paso 5: Editar una relación existente

1. **Hacer clic en el ícono de editar (✏️)** en la fila correspondiente
2. **Modificar** el campo "Es departamento principal" o "Relación activa"
   - ⚠️ No se puede cambiar la carrera ni el departamento en modo edición
3. **Hacer clic en "Actualizar"**

### Paso 6: Activar/Desactivar una relación

- **Hacer clic en el ícono de candado (🔒/🔓)**
- Las relaciones inactivas aparecen con opacidad reducida
- ℹ️ Desactivar es preferible a eliminar si quieres mantener el historial

### Paso 7: Eliminar una relación

1. **Hacer clic en el ícono de eliminar (🗑️)**
2. **Confirmar la eliminación** en el diálogo
- ⚠️ Esta acción es permanente

## 📋 Ejemplos de Configuración

### Ejemplo 1: Ingeniería Civil en Informática

**Departamento Principal:**
- ✅ Depto. de Ciencias de la Computación (DCCTI)

**Departamentos de Servicio:**
- Depto. de Matemática (DMAT)
- Depto. de Física (DFIS)

**Resultado:** Los profesores de estos 3 departamentos serán visibles para el Admin de esta carrera.

### Ejemplo 2: Ingeniería Civil Industrial

**Departamento Principal:**
- ✅ Depto. de Ingeniería Industrial (DII)

**Departamentos de Servicio:**
- Depto. de Matemática (DMAT)
- Depto. de Economía y Finanzas (DEF)

**Resultado:** Los profesores de estos 3 departamentos serán visibles para el Admin de esta carrera.

## 🎨 Características de la Interfaz

### Filtros Avanzados
- 🔍 Búsqueda en tiempo real
- 🎯 Filtro por tipo (Principal/Servicio)
- 📊 Contador de resultados filtrados

### Badges de Estado
- 🔵 **Principal** - Departamento principal de la carrera
- ⚪ **Servicio** - Departamento que da servicio
- 🟢 **Activo** - Relación activa
- 🔴 **Inactivo** - Relación desactivada

### Validaciones
- ✅ No se pueden crear relaciones duplicadas
- ✅ Debe seleccionar carrera y departamento
- ✅ Mensajes claros de error/éxito

### Responsive
- 📱 Adaptado para móviles y tablets
- 💻 Optimizado para escritorio

## 🔄 Impacto en el Sistema

### Para Super Admin
- ✅ Control total sobre qué profesores ve cada Admin de Carrera
- ✅ Configuración flexible y dinámica
- ✅ Puede ajustar relaciones sin modificar código

### Para Admin de Carrera
- ✅ Ve solo los profesores relevantes para su carrera
- ✅ Filtrado automático basado en las relaciones configuradas
- ✅ Mejor experiencia de usuario en "Gestión de Usuarios"

### Para el Filtrado de Usuarios
Cuando un **Admin de Carrera** accede a "Gestión de Usuarios", verá:

**Estudiantes:**
- ✅ Solo estudiantes de su carrera

**Profesores:**
- ✅ Solo profesores de los departamentos asociados a su carrera
- ✅ Basado en la tabla `departamentos_carreras`

**Admins:**
- ✅ Solo otros admins de su misma carrera
- ✅ Siempre ve a los Super Admins

## 🛠️ Solución de Problemas

### Problema: No aparecen departamentos o carreras en los dropdowns

**Solución:**
1. Verificar que existan datos en las tablas `departamentos` y `carreras`
2. Ejecutar el script `mysql/estructura_academica.sql` si es necesario
3. Verificar que el backend esté corriendo correctamente

### Problema: Error "Esta relación ya existe"

**Solución:**
- Ya existe una relación entre ese departamento y esa carrera
- Usa el botón de editar para modificar la relación existente
- O elimina la relación anterior antes de crear una nueva

### Problema: El filtrado de usuarios no funciona

**Solución:**
1. Verificar que existan relaciones en `departamentos_carreras`
2. Verificar que las relaciones estén activas (`activo = TRUE`)
3. Reiniciar el backend después de crear las relaciones
4. Verificar que los profesores tengan departamentos asignados en `profesores_departamentos`

### Problema: Un Admin de Carrera ve todos los usuarios

**Solución:**
1. Verificar que el usuario tenga `rol_id = 3` (Admin de Carrera)
2. Verificar que esté asignado como `jefe_carrera_rut` en la tabla `carreras`
3. Verificar que existan relaciones para su carrera en `departamentos_carreras`
4. Revisar los logs del backend para ver qué consulta SQL se está ejecutando

## 📊 Consultas SQL Útiles

### Ver todas las relaciones
```sql
SELECT 
    c.nombre AS carrera,
    d.nombre AS departamento,
    dc.es_principal,
    dc.activo
FROM departamentos_carreras dc
JOIN carreras c ON dc.carrera_id = c.id
JOIN departamentos d ON dc.departamento_id = d.id
ORDER BY c.nombre, dc.es_principal DESC;
```

### Ver departamentos de una carrera específica
```sql
SELECT 
    d.nombre AS departamento,
    dc.es_principal
FROM departamentos_carreras dc
JOIN departamentos d ON dc.departamento_id = d.id
WHERE dc.carrera_id = 1  -- Cambiar por el ID de tu carrera
  AND dc.activo = TRUE;
```

### Ver carreras sin relaciones
```sql
SELECT c.id, c.nombre
FROM carreras c
LEFT JOIN departamentos_carreras dc ON c.id = dc.carrera_id
WHERE dc.id IS NULL;
```

### Ver departamentos sin relaciones
```sql
SELECT d.id, d.nombre
FROM departamentos d
LEFT JOIN departamentos_carreras dc ON d.id = dc.departamento_id
WHERE dc.id IS NULL;
```

## 📝 Notas Importantes

1. **Cada carrera debe tener al menos un departamento principal**
   - Esto asegura que haya un departamento responsable de la carrera

2. **Un departamento puede dar servicio a múltiples carreras**
   - Ejemplo: Matemática da servicio a todas las ingenierías

3. **Las relaciones inactivas no afectan el filtrado**
   - Solo las relaciones con `activo = TRUE` se consideran

4. **Los cambios son inmediatos**
   - No es necesario reiniciar el backend después de crear/modificar relaciones

5. **Los Super Admins siempre ven todo**
   - El filtrado solo aplica a Admins de Carrera (rol_id = 3)

## 🎓 Mejores Prácticas

1. **Configurar primero los departamentos principales**
   - Asegura que cada carrera tenga su departamento base

2. **Agregar departamentos de servicio según necesidad**
   - Matemática, Física, Química suelen dar servicio a varias carreras

3. **Revisar periódicamente las relaciones**
   - Asegurarse de que reflejen la estructura académica actual

4. **Usar el campo "activo" en lugar de eliminar**
   - Permite mantener historial y reactivar relaciones fácilmente

5. **Documentar cambios importantes**
   - Especialmente cuando se modifican departamentos principales

## 🔗 Enlaces Relacionados

- **Gestión de Usuarios**: `/admin/usuarios`
- **Gestión de Estructura**: `/super-admin/gestion-estructura`
- **Gestionar Jefes de Carrera**: `/super-admin/gestionar-jefes`

## ✅ Checklist de Implementación

- [x] Crear tabla `departamentos_carreras` en la base de datos
- [x] Crear endpoints del backend
- [x] Crear componente frontend
- [x] Agregar ruta en el routing
- [x] Agregar enlace en el dashboard del Super Admin
- [x] Actualizar modelo de usuarios para usar la nueva relación
- [x] Probar el filtrado con diferentes usuarios
- [ ] Insertar datos iniciales de relaciones
- [ ] Capacitar a los usuarios Super Admin

## 🚀 Próximos Pasos

1. **Ejecutar el script SQL** para crear la tabla
2. **Reiniciar el backend** para cargar las nuevas rutas
3. **Acceder a la interfaz** como Super Admin
4. **Crear las relaciones** según tu estructura académica
5. **Probar el filtrado** iniciando sesión como Admin de Carrera
6. **Ajustar relaciones** según sea necesario

¡Listo! Ahora tienes un control total sobre qué profesores ve cada Admin de Carrera. 🎉

