# 🔧 Solución: Error "Faltan Datos" al Crear Propuestas

## 🎯 **Problema Identificado**

El error "faltan datos obligatorios" ocurre porque **falta el campo `fecha_envio`** que es requerido en la base de datos.

## 📋 **Campos Requeridos para Crear Propuesta**

Según la tabla `propuestas` en la base de datos, estos campos son **obligatorios**:

```sql
titulo VARCHAR(255) NOT NULL,
descripcion TEXT NOT NULL,
estudiante_rut VARCHAR(10) NOT NULL,  -- Se obtiene del token JWT
fecha_envio DATE NOT NULL,           -- ¡ESTE CAMPO FALTABA!
```

## ✅ **Solución 1: Formato Correcto del FormData**

Si estás enviando desde el **frontend** o **Postman**, el FormData debe incluir:

```javascript
// FormData correcto
const formData = new FormData();
formData.append('titulo', 'Título de la propuesta');
formData.append('descripcion', 'Descripción detallada...');
formData.append('fecha_envio', '2024-01-15');  // ¡CAMPO FALTANTE!
formData.append('archivo', file); // Opcional
```

## ✅ **Solución 2: Ejemplo Postman Corregido**

```
POST {{base_url}}/propuestas
Content-Type: multipart/form-data
Authorization: Bearer {{auth_token}}

FormData:
- titulo: "Sistema de Gestión de Biblioteca Digital"
- descripcion: "Desarrollo de una plataforma web..."
- fecha_envio: "2024-01-15"        ← ¡AGREGAR ESTE CAMPO!
- archivo: [archivo.pdf]           ← Opcional
```

## ✅ **Solución 3: Endpoint de Debug**

He agregado un endpoint temporal para diagnosticar problemas:

```bash
POST {{base_url}}/propuestas/debug
```

Usa este endpoint con los mismos datos para ver exactamente qué está llegando al servidor.

## 🔍 **Cómo Probar la Solución**

### **Paso 1: Login**
```bash
POST /api/v1/users/login
{
  "rut": "21.234.567-8",
  "password": "estudiante123"
}
```

### **Paso 2: Crear Propuesta (Formato Correcto)**
```bash
POST /api/v1/propuestas
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
titulo: Sistema de Gestión Académica
descripcion: Desarrollo de un sistema web para la gestión académica...
fecha_envio: 2024-01-15    ← ¡CAMPO CRÍTICO!
archivo: [archivo.pdf]     ← Opcional
```

## 📝 **Formato de Fecha**

La fecha debe enviarse en formato **YYYY-MM-DD**:

```javascript
// ✅ Correcto
fecha_envio: "2024-01-15"
fecha_envio: "2024-12-31"

// ❌ Incorrecto  
fecha_envio: "15/01/2024"
fecha_envio: "January 15, 2024"
fecha_envio: ""
```

## 🚀 **Actualización del Frontend (si aplica)**

Si estás usando Angular/React/Vue, asegúrate de incluir el campo:

```typescript
// Angular/TypeScript ejemplo
crearPropuesta() {
  const formData = new FormData();
  formData.append('titulo', this.propuestaForm.value.titulo);
  formData.append('descripcion', this.propuestaForm.value.descripcion);
  formData.append('fecha_envio', this.propuestaForm.value.fecha_envio);  // ← AGREGAR
  
  if (this.selectedFile) {
    formData.append('archivo', this.selectedFile);
  }

  this.propuestaService.crearPropuesta(formData).subscribe(
    response => console.log('Éxito:', response),
    error => console.error('Error:', error)
  );
}
```

## 🛠️ **Código de Debug Agregado**

He mejorado el controlador para mostrar exactamente qué datos faltan:

```javascript
// Respuesta mejorada cuando faltan datos
{
  "message": "Faltan datos obligatorios",
  "errores": ["fecha_envio es requerida"],
  "datosRecibidos": {
    "titulo": true,
    "descripcion": true,
    "fecha_envio": false,  // ← Aquí verás qué falta
    "estudiante_rut": true
  }
}
```

## 📋 **Checklist de Verificación**

- [ ] Token JWT válido en Authorization header
- [ ] Campo `titulo` con texto (no vacío)
- [ ] Campo `descripcion` con texto (no vacío) 
- [ ] Campo `fecha_envio` en formato YYYY-MM-DD
- [ ] Content-Type: multipart/form-data
- [ ] Usuario con rol estudiante (role_id = 1)

## 🔧 **Comandos de Testing**

```bash
# 1. Probar endpoint de debug
curl -X POST "http://localhost:3000/api/v1/propuestas/debug" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "titulo=Test" \
  -F "descripcion=Test desc" \
  -F "fecha_envio=2024-01-15"

# 2. Crear propuesta real
curl -X POST "http://localhost:3000/api/v1/propuestas" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "titulo=Mi Propuesta" \
  -F "descripcion=Descripción detallada" \
  -F "fecha_envio=2024-01-15" \
  -F "archivo=@/ruta/archivo.pdf"
```

## 💡 **Resumen**

**El problema principal era que faltaba el campo `fecha_envio`** que es requerido por la base de datos. Con las correcciones realizadas:

1. ✅ Controlador mejorado con mejor debugging
2. ✅ Postman collection corregida
3. ✅ Endpoint de debug agregado
4. ✅ Validaciones más específicas

**Prueba ahora con el campo `fecha_envio` incluido y debería funcionar correctamente.**