# 🧪 GUÍA RÁPIDA DE PRUEBAS - Sistema de Calendario con Matching

## 📋 Pasos para Probar el Sistema

### 🚀 **PASO 1: Ejecutar el Sistema**

```powershell
# 1. Navegar al backend
cd "c:\Users\labes\OneDrive\Escritorio\AcTitUBB\backend"

# 2. Instalar dependencias
npm install

# 3. Ejecutar los datos de prueba en tu base de datos
# Importa el archivo: datos-prueba-calendario.sql

# 4. Iniciar el servidor
npm start
```

### 🔐 **PASO 2: Autenticación (Obtener Tokens)**

#### **Profesor Carlos:**
```powershell
curl -X POST http://localhost:3000/api/v1/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"carlos.profesor@ubiobio.cl\",\"password\":\"1234\"}"
```

**Guarda el token del profesor**

#### **Estudiante Ana:**
```powershell
curl -X POST http://localhost:3000/api/v1/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ana.estudiante@alumnos.ubiobio.cl\",\"password\":\"1234\"}"
```

**Guarda el token del estudiante**

---

### 📅 **PASO 3: Probar Disponibilidades**

#### **Ver disponibilidades del profesor:**
```powershell
curl -X GET http://localhost:3000/api/v1/calendario-matching/disponibilidades ^
  -H "Authorization: Bearer TU_TOKEN_PROFESOR"
```

#### **Crear nueva disponibilidad:**
```powershell
curl -X POST http://localhost:3000/api/v1/calendario-matching/disponibilidades ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TU_TOKEN_PROFESOR" ^
  -d "{\"dia_semana\":\"lunes\",\"hora_inicio\":\"08:00\",\"hora_fin\":\"10:00\"}"
```

---

### 🔍 **PASO 4: Probar Matching Automático**

#### **Buscar reunión automáticamente (como estudiante):**
```powershell
curl -X POST http://localhost:3000/api/v1/calendario-matching/buscar-reunion ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TU_TOKEN_ESTUDIANTE" ^
  -d "{\"proyecto_id\":1,\"tipo_reunion\":\"seguimiento\",\"descripcion\":\"Necesito revisar mis avances\"}"
```

**✨ Esto debería:**
- ✅ Verificar que el estudiante y profesor están relacionados
- ✅ Encontrar horarios donde ambos están disponibles  
- ✅ Crear automáticamente una solicitud de reunión

---

### 📝 **PASO 5: Gestionar Solicitudes**

#### **Ver solicitudes pendientes (como profesor):**
```powershell
curl -X GET "http://localhost:3000/api/v1/calendario-matching/solicitudes?estado=pendiente" ^
  -H "Authorization: Bearer TU_TOKEN_PROFESOR"
```

#### **Aceptar solicitud (como profesor):**
```powershell
curl -X POST http://localhost:3000/api/v1/calendario-matching/solicitudes/1/responder ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TU_TOKEN_PROFESOR" ^
  -d "{\"respuesta\":\"aceptar\",\"comentarios\":\"Perfecto, nos vemos en mi oficina\"}"
```

---

### 🤝 **PASO 6: Ver Reuniones Confirmadas**

#### **Ver reuniones (como estudiante):**
```powershell
curl -X GET "http://localhost:3000/api/v1/calendario-matching/reuniones?estado=programada" ^
  -H "Authorization: Bearer TU_TOKEN_ESTUDIANTE"
```

---

### 📊 **PASO 7: Dashboard Completo**

#### **Ver dashboard del usuario:**
```powershell
curl -X GET http://localhost:3000/api/v1/calendario-matching/dashboard ^
  -H "Authorization: Bearer TU_TOKEN_PROFESOR"
```

**Debería mostrar:**
- 📋 Solicitudes pendientes
- 📅 Reuniones próximas  
- ⏰ Disponibilidades configuradas
- ⚠️ Alertas importantes

---

## 🎯 **Escenarios de Prueba Principales**

### **Escenario 1: Matching Exitoso**
1. ✅ Profesor configura disponibilidad "Lunes 09:00-12:00"
2. ✅ Estudiante configura disponibilidad "Lunes 10:00-11:00"  
3. ✅ Estudiante busca reunión para proyecto 1
4. ✅ Sistema encuentra solapamiento: Lunes 10:00-11:00
5. ✅ Se crea solicitud automática
6. ✅ Profesor acepta → Reunión confirmada

### **Escenario 2: Sin Disponibilidad**
1. ❌ Profesor solo disponible "Lunes 09:00-10:00"
2. ❌ Estudiante solo disponible "Lunes 11:00-12:00"
3. ❌ Estudiante busca reunión
4. ❌ Sistema responde: "No se encontraron horarios compatibles"

### **Escenario 3: Reprogramar Reunión**
1. ✅ Reunión confirmada para "Lunes 10:00"
2. ✅ Profesor solicita reprogramar
3. ✅ Sistema busca nueva fecha automáticamente
4. ✅ Estudiante confirma nuevo horario

---

## 🔍 **Verificaciones Importantes**

### **Logs que deberías ver:**
```
📅 Reunión confirmada ID: 1 - Notificación enviada
🔍 Matching exitoso: 3 opciones encontradas
⚠️ Sin horarios compatibles encontrados
```

### **Respuestas Esperadas:**

#### **Matching Exitoso:**
```json
{
  "success": true,
  "data": {
    "matching_exitoso": true,
    "horarios_encontrados": [
      {
        "fecha": "2025-02-03",
        "hora_inicio": "10:00",
        "hora_fin": "11:00"
      }
    ],
    "solicitud_creada": true,
    "mensaje": "Se encontró un horario perfecto"
  }
}
```

#### **Dashboard Completo:**
```json
{
  "success": true,
  "data": {
    "solicitudes": {"pendientes": 1},
    "reuniones": {"proximas": 2},
    "disponibilidades": 5,
    "alertas": ["Tienes 1 solicitud pendiente"]
  }
}
```

---

## 🚨 **Problemas Comunes y Soluciones**

### **Error: "No existe relación entre profesor y estudiante"**
- ✅ Verificar que exista registro en `asignaciones_profesores`
- ✅ Comprobar que `proyecto_id` sea correcto

### **Error: "No se encontraron horarios compatibles"**
- ✅ Verificar disponibilidades en tabla `disponibilidades`
- ✅ Comprobar que las horas se solapen
- ✅ Verificar bloqueos en tabla `bloqueos_horarios`

### **Error 401: "Token no válido"**
- ✅ Verificar que el token no haya expirado
- ✅ Incluir "Bearer " antes del token
- ✅ Verificar que el usuario exista y esté confirmado

### **Error: "Horario fuera de rango laboral"**
- ✅ Usar horarios entre 08:00 y 20:00
- ✅ Verificar configuración en `configuracion_matching`

---

## 📱 **Alternativa: Usar Postman**

1. **Importar la colección:** `Calendario-Matching-Examples.postman_collection.json`
2. **Configurar variables:**
   - `base_url`: `http://localhost:3000/api/v1`
3. **Ejecutar flujos completos:**
   - Flujo 1: Configurar disponibilidades
   - Flujo 2: Buscar reunión automática
   - Flujo 3: Confirmar reunión

---

## ✅ **Lista de Verificación Final**

- [ ] Servidor corriendo en puerto 3000
- [ ] Base de datos con nuevas tablas
- [ ] Datos de prueba importados
- [ ] Tokens de autenticación obtenidos
- [ ] Disponibilidades creadas
- [ ] Matching automático funcionando
- [ ] Solicitudes siendo creadas y gestionadas
- [ ] Dashboard mostrando información correcta

**¡Con esto deberías tener el sistema de calendario con matching completamente funcional! 🎉**