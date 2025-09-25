# 🔧 Solución: Error "Faltan comentarios o estado" al Aprobar Propuesta

## 🎯 **Problema Identificado**

El error `{"message": "Faltan comentarios o estado."}` ocurre porque el **nombre del campo está incorrecto** o **falta alguno de los campos requeridos**.

## 📋 **Campos Requeridos para Aprobar/Revisar Propuesta**

El endpoint `PUT /api/v1/propuestas/:id/revisar` requiere **exactamente estos campos**:

```json
{
  "comentarios_profesor": "string no vacío",  // ¡NOMBRE EXACTO!
  "estado": "uno de: pendiente, en_revision, correcciones, aprobada, rechazada"
}
```

## ❌ **Error Común Encontrado**

En el JSON de Postman anterior se enviaba:

```json
// ❌ INCORRECTO - campo mal nombrado
{
  "estado": "aprobada",
  "comentarios": "...",           // ← CAMPO INCORRECTO
  "profesor_revisor_rut": "..."   // ← CAMPO INNECESARIO
}
```

## ✅ **Formato Correcto**

```json
// ✅ CORRECTO
{
  "estado": "aprobada",
  "comentarios_profesor": "Propuesta aprobada. Excelente planteamiento del problema y metodología propuesta."
}
```

## 🔍 **Estados Válidos**

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Propuesta en espera de revisión |
| `en_revision` | Propuesta siendo revisada |
| `correcciones` | Requiere correcciones |
| `aprobada` | Propuesta aprobada (crea proyecto automáticamente) |
| `rechazada` | Propuesta rechazada |

## 🧪 **Cómo Probar la Solución**

### **Paso 1: Login como Profesor**
```bash
POST /api/v1/users/login
{
  "rut": "12.345.678-9",
  "password": "profesor123"
}
```

### **Paso 2: Debug (Opcional)**
```bash
PUT /api/v1/propuestas/1/debug-revisar
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "aprobada",
  "comentarios_profesor": "Test de debug"
}
```

### **Paso 3: Aprobar Propuesta (Formato Correcto)**
```bash
PUT /api/v1/propuestas/1/revisar
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "aprobada",
  "comentarios_profesor": "Propuesta aprobada. Excelente planteamiento del problema y metodología propuesta."
}
```

## 📝 **Ejemplos de Uso**

### **Aprobar Propuesta**
```json
{
  "estado": "aprobada",
  "comentarios_profesor": "La propuesta cumple con todos los requisitos establecidos. Metodología clara y objetivos bien definidos."
}
```

### **Rechazar Propuesta**
```json
{
  "estado": "rechazada",
  "comentarios_profesor": "La propuesta necesita mayor especificación de objetivos y metodología. Por favor, revise y vuelva a enviar."
}
```

### **Solicitar Correcciones**
```json
{
  "estado": "correcciones",
  "comentarios_profesor": "La propuesta tiene potencial pero necesita mejoras en la justificación del problema y el marco teórico."
}
```

## 🚀 **Respuesta Esperada**

### **Cuando se Aprueba (estado: "aprobada")**
```json
{
  "message": "Propuesta aprobada y proyecto creado automáticamente con fechas importantes",
  "proyecto_id": 5,
  "proyecto_creado": true
}
```

### **Otros Estados**
```json
{
  "message": "Propuesta revisada correctamente"
}
```

## 🛠️ **Mejoras Implementadas**

1. **✅ Debug mejorado**: El controlador ahora muestra exactamente qué datos faltan
2. **✅ Endpoint de debug**: `PUT /propuestas/:id/debug-revisar` para diagnosticar
3. **✅ Validación específica**: Mensajes de error más claros
4. **✅ Postman corregido**: Ejemplos con los campos correctos

## 🔧 **Testing con cURL**

```bash
# Aprobar propuesta
curl -X PUT "http://localhost:3000/api/v1/propuestas/1/revisar" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "aprobada",
    "comentarios_profesor": "Propuesta aprobada. Muy buena estructuración."
  }'

# Debug (para diagnosticar problemas)
curl -X PUT "http://localhost:3000/api/v1/propuestas/1/debug-revisar" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "aprobada",
    "comentarios_profesor": "Test debug"
  }'
```

## 📋 **Checklist de Verificación**

- [ ] Token JWT válido de un profesor (role_id = 2)
- [ ] Content-Type: application/json
- [ ] Campo `comentarios_profesor` (no `comentarios`)
- [ ] Campo `estado` con valor válido
- [ ] Propuesta existe y está en estado que permite revisión
- [ ] Usuario tiene permisos para revisar propuestas

## 💡 **Automatización al Aprobar**

Cuando una propuesta se aprueba (`estado: "aprobada"`), el sistema automáticamente:

1. ✅ Cambia el estado de la propuesta
2. ✅ Crea un nuevo proyecto
3. ✅ Genera fechas importantes por defecto
4. ✅ Vincula la propuesta con el proyecto

## 🔍 **Si Aún Tienes Problemas**

1. **Usa el endpoint de debug** para ver exactamente qué está llegando
2. **Verifica el token** con un usuario profesor
3. **Revisa que la propuesta exista** y esté en estado revisable
4. **Confirma los nombres de campos** exactos: `comentarios_profesor` y `estado`

---

**Resumen**: El problema era que se enviaba `comentarios` en lugar de `comentarios_profesor`. Con la corrección, el endpoint debería funcionar correctamente.