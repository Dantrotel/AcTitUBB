# 📅 Sistema de Calendario con Matching Inteligente

## 🎯 Descripción General

El **Sistema de Calendario con Matching** es una solución completa para la gestión automática de reuniones entre profesores y estudiantes en proyectos de título. El sistema encuentra automáticamente horarios disponibles y propone reuniones basándose en las disponibilidades configuradas por ambas partes.

## ⭐ Características Principales

### 🤖 Matching Automático
- **Detección de solapamientos**: Encuentra automáticamente horarios donde tanto profesor como estudiante están disponibles
- **Propuestas inteligentes**: Sugiere horarios óptimos considerando preferencias y restricciones
- **Validación de relaciones**: Solo permite reuniones entre profesores y estudiantes relacionados por proyectos

### 📊 Gestión Completa de Disponibilidades
- **Configuración flexible**: Los usuarios pueden definir su disponibilidad por días de la semana
- **Validaciones automáticas**: Verifica horarios laborales y evita conflictos
- **Gestión dinámica**: Crear, modificar y eliminar disponibilidades en tiempo real

### 🔄 Workflow de Confirmación Dual
- **Doble aprobación**: Tanto profesor como estudiante deben confirmar la reunión
- **Estados detallados**: Seguimiento completo del estado de cada solicitud
- **Reprogramación**: Opción de cambiar horarios con nueva confirmación

### 📈 Dashboard Inteligente
- **Vista unificada**: Resumen completo de solicitudes, reuniones y disponibilidades
- **Alertas proactivas**: Notificaciones sobre solicitudes pendientes y conflictos
- **Estadísticas**: Métricas de uso y eficiencia del sistema

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Archivos

```
backend/src/
├── models/
│   ├── calendario-matching.model.js    # Lógica de matching y disponibilidades
│   └── reuniones.model.js              # Gestión de reuniones y confirmaciones
├── services/
│   └── calendario-matching.service.js  # Servicios de negocio y validaciones
├── routes/
│   └── calendario-matching.route.js    # Endpoints de la API
└── db/
    └── database.sql                    # Nuevas tablas del sistema
```

### 🗄️ Base de Datos

#### Nuevas Tablas Agregadas:

1. **disponibilidades**
   - Horarios disponibles por usuario y día de la semana
   - Validación de horarios laborales

2. **solicitudes_reunion**
   - Solicitudes de reunión con estados de confirmación
   - Trazabilidad completa del proceso

3. **reuniones_calendario**
   - Reuniones confirmadas con información completa
   - Integración con el sistema de proyectos

4. **bloqueos_horarios**
   - Bloqueos temporales para evitar conflictos
   - Gestión de horarios no disponibles

5. **configuracion_matching**
   - Configuración global del sistema de matching
   - Parámetros personalizables

## 🚀 Guía de Uso

### 1. Configuración Inicial

#### Profesor configura su disponibilidad:
```bash
POST /api/v1/calendario-matching/disponibilidades
{
    "dia_semana": "lunes",
    "hora_inicio": "09:00",
    "hora_fin": "12:00"
}
```

#### Estudiante configura su disponibilidad:
```bash
POST /api/v1/calendario-matching/disponibilidades
{
    "dia_semana": "lunes",
    "hora_inicio": "10:00",
    "hora_fin": "11:00"
}
```

### 2. Solicitud de Reunión

#### Estudiante busca horarios automáticamente:
```bash
POST /api/v1/calendario-matching/buscar-reunion
{
    "proyecto_id": 1,
    "tipo_reunion": "seguimiento",
    "descripcion": "Revisión de avances",
    "duracion_minutos": 60
}
```

**El sistema automáticamente:**
- ✅ Verifica que el estudiante y profesor están relacionados por el proyecto
- ✅ Encuentra solapamientos en las disponibilidades
- ✅ Propone el mejor horario disponible
- ✅ Crea una solicitud de reunión automática

### 3. Confirmación de Reunión

#### Profesor revisa solicitudes:
```bash
GET /api/v1/calendario-matching/solicitudes?estado=pendiente
```

#### Profesor acepta la reunión:
```bash
POST /api/v1/calendario-matching/solicitudes/1/responder
{
    "respuesta": "aceptar",
    "comentarios": "Perfecto, nos vemos en mi oficina"
}
```

### 4. Gestión de Reuniones

#### Ver reuniones programadas:
```bash
GET /api/v1/calendario-matching/reuniones?estado=programada
```

#### Reprogramar reunión:
```bash
POST /api/v1/calendario-matching/reuniones/1/reprogramar
{
    "nueva_fecha": "2025-01-25",
    "nueva_hora": "10:00"
}
```

## 📋 Endpoints Disponibles

### 🔐 Autenticación
Todos los endpoints requieren autenticación JWT:
```
Authorization: Bearer <token>
```

### 📅 Disponibilidades
- `GET /disponibilidades` - Ver mis disponibilidades
- `POST /disponibilidades` - Crear disponibilidad
- `DELETE /disponibilidades/:id` - Eliminar disponibilidad

### 🔍 Matching y Búsqueda
- `POST /buscar-reunion` - Buscar horarios automáticamente
- `GET /verificar-relacion/:proyecto_id` - Verificar relación profesor-estudiante

### 📝 Solicitudes
- `GET /solicitudes` - Ver solicitudes de reunión
- `POST /solicitudes/:id/responder` - Responder solicitud

### 🤝 Reuniones
- `GET /reuniones` - Ver reuniones
- `POST /reuniones/:id/reprogramar` - Reprogramar reunión
- `POST /reuniones/:id/cancelar` - Cancelar reunión

### 📊 Dashboard
- `GET /dashboard` - Dashboard completo del usuario
- `GET /estadisticas` - Estadísticas generales (solo admin)

## 🎛️ Configuración del Sistema

### Variables de Entorno
```env
# Configuración de matching
MATCHING_HORARIO_INICIO=08:00
MATCHING_HORARIO_FIN=20:00
MATCHING_DURACION_MINIMA=30
MATCHING_DIAS_ANTICIPACION=14
```

### Parámetros de Matching
- **Horario laboral**: 8:00 AM - 8:00 PM
- **Duración mínima**: 30 minutos
- **Días de anticipación**: 14 días máximo
- **Tipos de reunión**: seguimiento, defensa, evaluacion, otros

## ⚡ Algoritmo de Matching

### 1. Validación de Permisos
```javascript
// Verifica relación profesor-estudiante por proyecto
const relacion = await verificarRelacionProfesorEstudiante(profesor_rut, estudiante_rut);
```

### 2. Búsqueda de Solapamientos
```javascript
// Encuentra horarios donde ambos están disponibles
const solapamientos = await encontrarSolapamientosDisponibilidad(profesor_rut, estudiante_rut);
```

### 3. Propuesta Inteligente
```javascript
// Selecciona el mejor horario considerando:
// - Proximidad en el tiempo
// - Duración adecuada
// - Preferencias de horario
const mejorHorario = algoritmoSeleccionMejorHorario(solapamientos, preferencias);
```

### 4. Creación Automática
```javascript
// Crea solicitud automáticamente si encuentra match
if (mejorHorario) {
    await crearSolicitudReunion(mejorHorario, detalles);
}
```

## 🔧 Estados del Sistema

### Estados de Solicitud
- `pendiente` - Esperando respuesta inicial
- `aceptada_profesor` - Profesor aceptó, esperando estudiante
- `aceptada_estudiante` - Estudiante aceptó, esperando profesor
- `confirmada` - Ambos aceptaron
- `rechazada` - Cualquiera rechazó
- `expirada` - Tiempo límite vencido

### Estados de Reunión
- `programada` - Reunión confirmada y programada
- `en_progreso` - Reunión en curso
- `completada` - Reunión finalizada
- `cancelada` - Reunión cancelada
- `reprogramada` - Reunión reprogramada

## 🎨 Ejemplos de Respuesta

### Dashboard Completo
```json
{
    "success": true,
    "data": {
        "usuario": {
            "rut": "12345678-9",
            "es_profesor": true
        },
        "solicitudes": {
            "pendientes": [
                {
                    "id": 1,
                    "proyecto_titulo": "Sistema de Gestión",
                    "fecha_propuesta": "2025-01-20",
                    "hora_propuesta": "10:00",
                    "estado": "pendiente"
                }
            ],
            "sin_responder": 1
        },
        "reuniones": {
            "proximas": [
                {
                    "id": 1,
                    "fecha": "2025-01-22",
                    "hora": "14:00",
                    "estudiante_nombre": "Juan Pérez",
                    "tipo": "seguimiento"
                }
            ]
        },
        "disponibilidades": [
            {
                "id": 1,
                "dia_semana": "lunes",
                "hora_inicio": "09:00",
                "hora_fin": "12:00"
            }
        ],
        "alertas": [
            {
                "tipo": "solicitudes_pendientes",
                "cantidad": 1,
                "mensaje": "Tienes 1 solicitud de reunión pendiente"
            }
        ],
        "resumen": {
            "solicitudes_pendientes": 1,
            "reuniones_proxima_semana": 2,
            "disponibilidades_configuradas": 3
        }
    }
}
```

### Resultado de Matching
```json
{
    "success": true,
    "data": {
        "matching_exitoso": true,
        "horarios_encontrados": [
            {
                "fecha": "2025-01-20",
                "hora_inicio": "10:00",
                "hora_fin": "11:00",
                "profesor_disponible": true,
                "estudiante_disponible": true,
                "calidad_match": 0.95
            }
        ],
        "mejor_opcion": {
            "fecha": "2025-01-20",
            "hora_inicio": "10:00",
            "hora_fin": "11:00"
        },
        "solicitud_creada": true,
        "solicitud_id": 15,
        "mensaje": "Se encontró un horario perfecto y se creó la solicitud automáticamente"
    }
}
```

## 🧪 Testing

### Colección de Postman
Utiliza la colección `Calendario-Matching-Examples.postman_collection.json` que incluye:
- ✅ Flujos completos de ejemplo
- ✅ Tests automatizados
- ✅ Variables de entorno preconfiguradas
- ✅ Casos de error comunes

### Ejemplos de Flujo
1. **Flujo básico**: Profesor configura → Estudiante busca → Confirmación
2. **Flujo de reprogramación**: Reunión programada → Cambio de horario → Nueva confirmación
3. **Flujo de conflictos**: Horarios ocupados → Búsqueda alternativa → Resolución

## 🔒 Seguridad y Validaciones

### Validaciones Implementadas
- ✅ **Autenticación JWT** obligatoria
- ✅ **Verificación de relaciones** profesor-estudiante
- ✅ **Validación de horarios laborales** (8:00-20:00)
- ✅ **Prevención de conflictos** de horario
- ✅ **Validación de permisos** por rol
- ✅ **Sanitización de datos** de entrada

### Controles de Seguridad
- Tokens JWT con expiración
- Validación de RUT en relaciones
- Prevención de inyección SQL
- Limitación de rangos de fecha
- Control de acceso basado en roles

## 📈 Métricas y Monitoreo

### Estadísticas Disponibles
- Número de reuniones programadas por período
- Tasa de confirmación de solicitudes
- Horarios más populares
- Eficiencia del algoritmo de matching
- Tiempo promedio de confirmación

### Logs del Sistema
```javascript
console.log(`📅 Reunión confirmada ID: ${reunion_id} - Notificación enviada`);
console.log(`🔍 Matching exitoso: ${horarios_encontrados.length} opciones`);
console.log(`⚠️ Conflicto detectado en horario: ${fecha} ${hora}`);
```

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Integración con Google Calendar/Outlook**
- [ ] **Notificaciones por email automáticas**
- [ ] **Recordatorios de reunión**
- [ ] **Sistema de comentarios post-reunión**
- [ ] **Integración con videollamadas (Zoom/Teams)**
- [ ] **Reportes avanzados de productividad**
- [ ] **App móvil para notificaciones push**

### Optimizaciones Técnicas
- [ ] **Cache de disponibilidades frecuentes**
- [ ] **Algoritmo de ML para predicción de mejores horarios**
- [ ] **Sincronización en tiempo real con WebSockets**
- [ ] **API GraphQL para consultas complejas**

## 💡 Casos de Uso Comunes

### Scenario 1: Primera Reunión
1. Estudiante necesita reunirse con su profesor guía
2. Configura su disponibilidad: "Martes 14:00-16:00"
3. Busca reunion para proyecto ID 1
4. Sistema encuentra que profesor está disponible martes 15:00-17:00
5. Propone automáticamente: martes 15:00-16:00
6. Profesor recibe solicitud y acepta
7. ✅ Reunión confirmada

### Scenario 2: Defensa de Título
1. Estudiante necesita programar defensa final
2. Debe coordinar con múltiples profesores (guía, informante, sala)
3. Sistema busca horarios donde TODOS están disponibles
4. Propone fecha/hora óptima
5. Todos confirman secuencialmente
6. ✅ Defensa programada con todo el tribunal

### Scenario 3: Reprogramación
1. Profesor tiene emergencia y no puede asistir
2. Solicita reprogramación desde la reunión
3. Sistema busca nuevo horario automáticamente
4. Propone alternativas inmediatas
5. Estudiante confirma nueva fecha
6. ✅ Reunión reprogramada exitosamente

---

## 📞 Soporte

Para dudas sobre implementación o uso del sistema, consultar:
- Documentación de la API en `/api/v1/calendario-matching`
- Colección de Postman con ejemplos
- Logs del sistema para debugging
- Estados y respuestas de error detalladas

**Sistema desarrollado con ❤️ para optimizar la gestión de reuniones académicas**