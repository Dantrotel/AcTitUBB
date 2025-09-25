# AcTitUBB - Sistema de Gestión de Proyectos de Título

## 📋 Descripción

Sistema completo para la gestión de proyectos de título universitarios con funcionalidades avanzadas de seguimiento, fechas importantes y asignaciones múltiples de profesores.

## 🚀 Características Principales

### ✅ **Funcionalidades Completadas**

- **Gestión de Proyectos**: Creación automática desde propuestas aprobadas
- **Sistema de Permisos**: Control granular basado en roles
- **Fechas Importantes**: Gestión de entregas, defensas y reuniones por proyecto
- **Asignaciones Múltiples**: Profesores guía, co-guía, informante, sala y corrector
- **Calendario Integrado**: Fechas globales y específicas por profesor/estudiante
- **API RESTful**: Endpoints completos con autenticación JWT

### 📊 **Roles del Sistema**

| Rol | ID | Permisos |
|-----|----|---------| 
| **Estudiante** | 1 | Ver sus propios proyectos, crear propuestas |
| **Profesor** | 2 | Ver proyectos asignados, revisar propuestas |
| **Administrador** | 3 | Acceso completo, gestión de asignaciones |

### 👨‍🏫 **Roles de Profesores**

| Código | Nombre | Descripción |
|--------|--------|-------------|
| `profesor_guia` | Profesor Guía | Director principal del proyecto |
| `profesor_co_guia` | Profesor Co-Guía | Guía secundario del proyecto |
| `profesor_informante` | Profesor Informante | Revisor externo |
| `profesor_sala` | Profesor de Sala | Evaluador en defensa |
| `profesor_corrector` | Profesor Corrector | Revisor de documentos |

## 🛠️ **Arquitectura del Sistema**

### **Backend Structure**
```
backend/src/
├── controllers/          # Lógica de controladores
├── models/              # Modelos de datos
│   ├── fechas-importantes.model.js
│   └── asignaciones-profesores.model.js
├── services/            # Lógica de negocio
├── routes/              # Definición de rutas
│   ├── fechas-importantes.route.js
│   └── asignaciones-profesores.route.js
├── middlewares/         # Middleware de autenticación
└── db/                  # Base de datos y conexión
```

### **Base de Datos - Nuevas Tablas**

#### **fechas_importantes**
```sql
- id (PK)
- proyecto_id (FK -> proyectos.id)
- tipo_fecha (ENUM: entrega_avance, entrega_final, defensa, reunion, revision, otro)
- titulo
- descripcion
- fecha_limite
- completada (BOOLEAN)
- fecha_realizada
- created_at, updated_at
```

#### **asignaciones_profesores**
```sql
- id (PK)
- proyecto_id (FK -> proyectos.id)
- profesor_rut (FK -> usuarios.rut)
- rol_profesor (ENUM: profesor_guia, profesor_co_guia, profesor_informante, profesor_sala, profesor_corrector)
- fecha_asignacion
- fecha_desasignacion
- activo (BOOLEAN)
- created_at, updated_at
```

## 🔗 **API Endpoints**

### **🔐 Autenticación**
```
POST /api/v1/users/login          # Iniciar sesión
POST /api/v1/users/register       # Registrar usuario
```

### **📋 Proyectos**
```
GET  /api/v1/projects/projects                      # Obtener proyectos (filtrados por permisos)
GET  /api/v1/projects/projects/:id                  # Obtener proyecto específico
GET  /api/v1/projects/projects/:id/completo         # Proyecto con fechas y profesores
POST /api/v1/projects/projects                      # Crear proyecto (estudiantes)
GET  /api/v1/projects/estudiante/mis-proyectos      # Mis proyectos (estudiante)
GET  /api/v1/projects/profesor/proyectos-asignados  # Proyectos asignados (profesor)
```

### **📅 Fechas Importantes**
```
GET  /api/v1/fechas-importantes/proyecto/:id        # Fechas del proyecto
POST /api/v1/fechas-importantes                     # Crear fecha importante
PUT  /api/v1/fechas-importantes/:id                 # Actualizar fecha
PUT  /api/v1/fechas-importantes/:id/completar       # Marcar como completada
DELETE /api/v1/fechas-importantes/:id               # Eliminar fecha (admin)
```

### **👨‍🏫 Asignaciones de Profesores**
```
GET  /api/v1/asignaciones-profesores/proyecto/:id                    # Profesores del proyecto
GET  /api/v1/asignaciones-profesores/profesor/:rut                   # Proyectos del profesor
POST /api/v1/asignaciones-profesores                                 # Asignar profesor
POST /api/v1/asignaciones-profesores/multiples                       # Asignaciones múltiples
PUT  /api/v1/asignaciones-profesores/proyecto/:id/rol/:rol           # Cambiar profesor
DELETE /api/v1/asignaciones-profesores/proyecto/:id/rol/:rol         # Remover profesor
GET  /api/v1/asignaciones-profesores/disponibles/:rol                # Profesores disponibles
GET  /api/v1/asignaciones-profesores/estadisticas                    # Estadísticas
```

## 🧪 **Testing con Postman**

### **Archivo de Colección**
Se incluye `AcTitUBB-Complete-API-Tests.postman_collection.json` con:

- ✅ Tests automatizados
- ✅ Variables de entorno
- ✅ Scripts pre/post request
- ✅ Autenticación automática

### **Flujo de Testing Recomendado**

1. **Autenticación**
   ```bash
   1. Login Admin → Obtener token
   2. Login Profesor → Token profesor
   3. Login Estudiante → Token estudiante
   ```

2. **Gestión de Proyectos**
   ```bash
   1. Crear propuesta (estudiante)
   2. Aprobar propuesta (profesor) → Crea proyecto automáticamente
   3. Ver proyecto completo → Incluye fechas y profesores
   ```

3. **Fechas Importantes**
   ```bash
   1. Ver fechas del proyecto → Fechas por defecto creadas
   2. Crear fecha personalizada
   3. Marcar fecha como completada
   4. Actualizar fecha existente
   ```

4. **Asignaciones de Profesores**
   ```bash
   1. Ver profesores disponibles por rol
   2. Asignar múltiples profesores al proyecto
   3. Cambiar profesor de un rol específico
   4. Ver estadísticas de asignaciones
   ```

## 🔧 **Configuración y Despliegue**

### **Requisitos**
- Node.js 18+
- MySQL 8.0+
- NPM/Yarn

### **Instalación**
```bash
# Backend
cd backend
npm install
npm start

# Frontend (Angular)
cd frontend
npm install
npm run dev
```

### **Variables de Entorno**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=actitubb
JWT_SECRET=your_secret_key
PORT=3000
```

### **Base de Datos**
```bash
# Ejecutar script SQL
mysql -u root -p < backend/src/db/database.sql
```

## 📈 **Funcionalidades Avanzadas**

### **Sistema de Permisos**
- **Estudiantes**: Solo ven sus proyectos
- **Profesores**: Ven proyectos donde están asignados
- **Admins**: Acceso completo a todos los proyectos

### **Creación Automática de Proyectos**
Cuando una propuesta es aprobada:
1. Se crea automáticamente el proyecto
2. Se generan fechas importantes por defecto
3. Se transfieren asignaciones de profesores

### **Notificaciones de Fechas**
- **Vencidas**: Fechas pasadas sin completar
- **Hoy**: Fechas que vencen hoy
- **Próximas**: Fechas en los próximos 30 días

### **Estadísticas Avanzadas**
- Carga de trabajo por profesor
- Distribución de roles
- Proyectos activos/finalizados por profesor

## 🔍 **Ejemplos de Uso**

### **Crear Proyecto Completo**
```javascript
// POST /api/v1/asignaciones-profesores/multiples
{
  "proyecto_id": 1,
  "asignaciones": [
    {"profesor_rut": "12.345.678-9", "rol_profesor": "profesor_guia"},
    {"profesor_rut": "13.456.789-0", "rol_profesor": "profesor_co_guia"},
    {"profesor_rut": "14.567.890-1", "rol_profesor": "profesor_informante"}
  ]
}
```

### **Crear Fecha Importante**
```javascript
// POST /api/v1/fechas-importantes
{
  "proyecto_id": 1,
  "tipo_fecha": "entrega_avance",
  "titulo": "Entrega Primer Avance",
  "descripcion": "Primera entrega de avance del proyecto",
  "fecha_limite": "2024-02-15"
}
```

### **Obtener Proyecto Completo**
```javascript
// GET /api/v1/projects/projects/1/completo
// Respuesta incluye:
{
  "proyecto": {...},
  "fechasImportantes": {
    "fechas": [...],
    "estadisticas": {...}
  },
  "profesores": [...]
}
```

## 🛡️ **Seguridad**

- **JWT Authentication**: Tokens seguros con expiración
- **Role-based Access**: Permisos granulares por endpoint
- **SQL Injection Prevention**: Prepared statements
- **CORS Configuration**: Origins permitidos configurables

## 📚 **Documentación Adicional**

- **API Documentation**: Swagger/OpenAPI (próximamente)
- **Database Schema**: Diagramas ER en `/docs`
- **Frontend Guide**: Documentación Angular en `/frontend/README.md`

## 🤝 **Contribución**

1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 **Soporte**

Para reportar bugs o solicitar funcionalidades, crear un issue en el repositorio.

---

**Estado del Proyecto**: ✅ **Funcional y Completo**  
**Última Actualización**: Enero 2024  
**Versión**: 2.0.0