# 🎓 AcTitUBB - Sistema para las actividades de titulación en la Universidad del Bío-Bío
## Universidad del Bío-Bío

<div align="center">

![Universidad del Bío-Bío](frontend/public/Escudo_Universidad_del_Bío-Bío.png)

**Plataforma de apoyo completa para la gestión de propuestas de tesis, proyectos de título y seguimiento académico**

[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)
[![Angular](https://img.shields.io/badge/Angular-18+-red?logo=angular)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange?logo=mysql)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📖 Descripción

**AcTitUBB** es una aplicación web avanzada diseñada para el apoyo de la gestión académica en la Universidad del Bío-Bío. El sistema abarca desde la creación de propuestas de tesis hasta el seguimiento de hitos, calendario académico, y gestión de archivos, proporcionando una experiencia integral para estudiantes, profesores y administradores.

### ✨ Características Principales

#### 🎯 **Gestión de Propuestas**
- 📝 Creación, edición y seguimiento completo de propuestas
- 🔄 Estados de propuesta: Borrador, En Revisión, Aprobada, Rechazada
- 📁 Gestión avanzada de archivos con validaciones estrictas
- 💬 Sistema de comentarios bidireccional profesor-estudiante

#### 📊 **Sistema de Hitos de Proyectos**
- 🎯 Definición y seguimiento de hitos por proyecto
- 📤 Entrega de archivos con validaciones automáticas
- ⏰ Control de fechas límite y estados dinámicos
- 📈 Visualización de progreso en tiempo real
- 🔍 Revisión y calificación por parte de profesores

#### 📅 **Sistema de Fechas Importantes**
- 🗓️ Gestión centralizada del calendario académico
- 📌 Fechas específicas por proyecto y globales
- ✅ Marcado de fechas como completadas
- 🔔 Notificaciones automáticas de vencimientos
- 📱 Vista responsive para móviles y escritorio

#### 👥 **Gestión de Usuarios Avanzada**
- 🔐 Autenticación JWT segura con blacklist
- 👨‍🎓 **Estudiantes**: Dashboard personalizado, entrega de hitos, seguimiento
- 👨‍🏫 **Profesores**: Revisión de entregas, gestión de cronogramas
- 🏛️ **Administradores**: Control total del sistema y asignaciones

#### 📈 **Dashboard Inteligente**
- 📊 Estadísticas en tiempo real por rol
- 📋 Resumen de actividades pendientes
- 🎯 Métricas de progreso visual
- 📱 Interfaz completamente responsive

---

## 🛠️ Stack Tecnológico Avanzado

### Frontend (Angular 18+)
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Angular** | 18.2+ | Framework principal SPA |
| **TypeScript** | 5.0+ | Tipado estático y desarrollo robusto |
| **Angular Material** | 18+ | Componentes UI consistentes |
| **SCSS** | Latest | Estilos avanzados con variables |
| **Vite** | Latest | Build tool ultra-rápido |
| **Nginx** | 1.21+ | Servidor web optimizado |

### Backend (Node.js)
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20+ | Runtime JavaScript del servidor |
| **Express.js** | 4.18+ | Framework web minimalista |
| **MySQL2** | 3.6+ | Driver MySQL optimizado |
| **JWT** | 9.0+ | Autenticación segura |
| **Multer** | 1.4+ | Manejo de archivos |
| **Nodemailer** | 6.9+ | Sistema de emails |

### Base de Datos y DevOps
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **MySQL** | 8.0+ | Base de datos relacional |
| **Docker** | 24+ | Contenedorización |
| **Docker Compose** | 2.0+ | Orquestación de servicios |

---

## 🏗️ Arquitectura del Sistema

### 📁 Estructura Completa del Proyecto

```
AcTitUBB/
├── 📂 backend/                          # API REST con Node.js
│   ├── 📂 src/
│   │   ├── 📂 controllers/              # Controladores MVC
│   │   │   ├── admin.controller.js      # Gestión administrativa
│   │   │   ├── calendario.controller.js  # Fechas importantes
│   │   │   ├── login.controller.js      # Autenticación
│   │   │   ├── project.controller.js    # Proyectos y hitos
│   │   │   ├── propuesta.controller.js  # Propuestas de tesis
│   │   │   └── role.controller.js       # Gestión de roles
│   │   ├── 📂 services/                 # Lógica de negocio
│   │   │   ├── email.service.js         # Notificaciones por email
│   │   │   ├── project.service.js       # Lógica de proyectos
│   │   │   ├── propuesta.service.js     # Lógica de propuestas
│   │   │   └── RutVal.service.js        # Validación RUT chileno
│   │   ├── 📂 models/                   # Modelos de datos
│   │   │   ├── avance.model.js          # Modelo de avances
│   │   │   ├── calendario.model.js      # Modelo de fechas
│   │   │   ├── fecha-importante.model.js # Fechas importantes
│   │   │   ├── project.model.js         # Modelo de proyectos
│   │   │   ├── propuesta.model.js       # Modelo de propuestas
│   │   │   ├── role.model.js            # Modelo de roles
│   │   │   └── user.model.js            # Modelo de usuarios
│   │   ├── 📂 routes/                   # Definición de endpoints
│   │   │   ├── admin.route.js           # Rutas administrativas
│   │   │   ├── calendario.route.js      # Rutas de calendario
│   │   │   ├── download.route.js        # Descarga de archivos
│   │   │   ├── login.route.js           # Rutas de autenticación
│   │   │   ├── project.route.js         # Rutas de proyectos
│   │   │   ├── propuesta.routes.js      # Rutas de propuestas
│   │   │   └── role.route.js            # Rutas de roles
│   │   ├── 📂 middlewares/              # Middlewares personalizados
│   │   │   ├── blacklist.js             # JWT blacklist
│   │   │   ├── uploader.js              # Subida de archivos
│   │   │   └── verifySession.js         # Verificación de sesión
│   │   ├── 📂 db/                       # Base de datos
│   │   │   ├── connectionDB.js          # Pool de conexiones
│   │   │   └── database.sql             # Schema completo
│   │   └── index.js                     # Servidor principal
│   ├── 📂 uploads/                      # Archivos del sistema
│   │   └── 📂 propuestas/               # Documentos de propuestas
│   ├── dockerfile                       # Imagen Docker backend
│   └── package.json                     # Dependencias Node.js
│
├── 📂 frontend/                         # Aplicación Angular
│   ├── 📂 src/app/
│   │   ├── 📂 pages/                    # Páginas principales
│   │   │   ├── 📂 estudiante/           # Módulo estudiante
│   │   │   │   └── 📂 home/             # Dashboard estudiante
│   │   │   ├── 📂 profesor/             # Módulo profesor
│   │   │   │   └── 📂 cronograma/       # Gestión de cronogramas
│   │   │   ├── 📂 admin/                # Panel administrativo
│   │   │   │   ├── 📂 asignaciones/     # Asignación profesor-estudiante
│   │   │   │   ├── 📂 gestion-calendario/ # Calendario global
│   │   │   │   └── 📂 gestion-profesores/ # Gestión de profesores
│   │   │   ├── 📂 propuestas/           # CRUD de propuestas
│   │   │   ├── 📂 login/                # Autenticación
│   │   │   └── 📂 register/             # Registro de usuarios
│   │   ├── 📂 services/                 # Servicios Angular
│   │   │   └── api.ts                   # Cliente HTTP centralizado
│   │   ├── 📂 guards/                   # Guards de seguridad
│   │   │   └── auth.guard.ts            # Protección de rutas
│   │   ├── 📂 interceptors/             # Interceptors HTTP
│   │   │   └── auth.interceptor.ts      # Inyección automática de JWT
│   │   └── 📂 components/               # Componentes reutilizables
│   │       └── 📂 calendar-modal/       # Modal de calendario
│   ├── 📂 public/                       # Recursos estáticos
│   │   ├── Escudo_Universidad_del_Bío-Bío.png
│   │   └── favicon.ico
│   ├── dockerfile                       # Imagen Docker frontend
│   ├── nginx.conf                       # Configuración Nginx
│   ├── angular.json                     # Configuración Angular
│   ├── vite.config.ts                   # Configuración Vite
│   └── package.json                     # Dependencias Angular
│
├── 📂 mysql/                            # Configuración MySQL
│   └── 📂 init.sql/                     # Scripts de inicialización
├── docker-compose.yml                   # Orquestación completa
└── README.md                            # Documentación (este archivo)
```

---

## 👥 Roles y Funcionalidades Detalladas

### 🎓 **Estudiante**
#### Dashboard Personalizado
- 📊 **Vista general**: Resumen de propuestas, hitos y fechas importantes
- 📈 **Progreso visual**: Indicadores de avance por proyecto
- 🔔 **Notificaciones**: Alertas de vencimientos y actualizaciones

#### Gestión de Propuestas
- ✍️ **Crear propuestas**: Formulario completo con validaciones
- 📁 **Adjuntar archivos**: PDF, Word con validaciones de tamaño
- 👀 **Seguimiento**: Estados en tiempo real y comentarios

#### Sistema de Hitos
- 📤 **Entrega de hitos**: Subida de archivos con validaciones estrictas
- ⏰ **Control de fechas**: Visualización de deadlines y tiempo restante
- 📋 **Estados dinámicos**: Pendiente, Entregado, En Revisión, Aprobado, Vencido
- 💬 **Comentarios**: Comunicación bidireccional con profesores

#### Calendario Personal
- 📅 **Fechas importantes**: Vista personalizada por proyecto
- ✅ **Completar fechas**: Marcado de hitos cumplidos
- 🔍 **Filtros avanzados**: Por proyecto, estado, fecha

### 👨‍🏫 **Profesor**
#### Panel de Gestión
- 📋 **Propuestas asignadas**: Lista completa con filtros
- 👥 **Estudiantes**: Vista de todos los estudiantes asignados
- 📊 **Estadísticas**: Métricas de desempeño y progreso

#### Revisión de Hitos
- 🔍 **Evaluar entregas**: Sistema de calificación integrado
- 💬 **Feedback detallado**: Comentarios estructurados
- ✅ **Aprobación/Rechazo**: Flujo de trabajo simplificado
- 📈 **Seguimiento de progreso**: Vista cronológica de avances

#### Gestión de Cronogramas
- 📅 **Crear fechas específicas**: Por estudiante o proyecto
- ⏰ **Definir hitos**: Configuración de deliverables
- 🔔 **Notificaciones automáticas**: Alertas de vencimientos
- 📊 **Dashboard de seguimiento**: Vista general de todos los proyectos

### 🏛️ **Administrador**
#### Gestión de Usuarios
- 👥 **CRUD completo**: Crear, editar, eliminar usuarios
- 🔐 **Gestión de roles**: Asignación y modificación de permisos
- 📊 **Estadísticas de uso**: Métricas del sistema

#### Asignaciones Académicas
- 🔗 **Profesor-Estudiante**: Sistema de asignación inteligente
- 📋 **Gestión de proyectos**: Vista global de todos los proyectos
- 📈 **Reportes**: Estadísticas de rendimiento académico

#### Calendario Global
- 🗓️ **Fechas institucionales**: Gestión del calendario académico
- 📅 **Eventos globales**: Fechas que afectan a todos los usuarios
- 🔔 **Notificaciones masivas**: Comunicados importantes

---

## 🚀 Instalación y Despliegue

### Prerrequisitos

- [Docker](https://www.docker.com/get-started) (versión 24.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.20+)
- Git
- 4GB RAM mínimo recomendado

### 🐳 Instalación con Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Dantrotel/AcTitUBB.git
   cd AcTitUBB
   ```

2. **Configurar variables de entorno (opcional)**
   ```bash
   # Crear archivo .env en /backend/ si necesitas configuraciones específicas
   cp backend/.env.example backend/.env
   ```

3. **Levantar todos los servicios**
   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación**
   - 🌐 **Frontend**: [http://localhost](http://localhost)
   - 🔌 **API Backend**: [http://localhost:3000](http://localhost:3000)
   - 🗄️ **Base de datos**: localhost:3306 (usuario: `actitubb_user`)

### 🔧 Desarrollo Local (Sin Docker)

<details>
<summary>Click para expandir instrucciones de desarrollo local</summary>

**Prerrequisitos de desarrollo:**
- Node.js 20+
- MySQL 8.0+
- Angular CLI 18+

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
ng serve
# O con Vite (más rápido)
npm run dev
```

**Base de Datos:**
```bash
# Instalar MySQL 8.0+
mysql -u root -p < backend/src/db/database.sql

# Configurar variables en backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=actitubb
DB_USER=root
DB_PASSWORD=tu_password
```

</details>

---

## ⚙️ Configuración Avanzada

### Variables de Entorno Completas

Crear archivo `backend/.env` para configuración personalizada:

```bash
# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost

# ============================================
# BASE DE DATOS
# ============================================
DB_HOST=mysql
DB_PORT=3306
DB_NAME=actitubb
DB_USER=actitubb_user
DB_PASSWORD=tu_contraseña_muy_segura

# ============================================
# AUTENTICACIÓN Y SEGURIDAD
# ============================================
JWT_SECRET=tu_clave_jwt_super_segura_de_al_menos_64_caracteres
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# ============================================
# CONFIGURACIÓN DE EMAIL
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@ubiobio.cl
EMAIL_PASS=tu_contraseña_aplicacion
EMAIL_FROM=noreply@ubiobio.cl

# ============================================
# CONFIGURACIÓN DE ARCHIVOS
# ============================================
MAX_FILE_SIZE=10485760  # 10MB en bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
UPLOAD_PATH=./uploads/

# ============================================
# CONFIGURACIÓN DE LOGS
# ============================================
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### Configuración para Producción

#### 1. Frontend (Angular)
Actualizar `frontend/src/app/services/api.ts`:
```typescript
// Para producción
private apiUrl = 'https://tu-dominio.com/api/v1';

// Para desarrollo
private apiUrl = 'http://localhost:3000/api/v1';
```

#### 2. Backend (CORS)
Actualizar `backend/src/index.js`:
```javascript
app.use(cors({
  origin: ['https://tu-dominio.com', 'http://localhost'],
  credentials: true
}));
```

#### 3. Docker Compose para Producción
```yaml
version: '3.8'
services:
  backend:
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "3000:3000"
    
  frontend:
    environment:
      - NODE_ENV=production
    ports:
      - "80:80"
      - "443:443"  # Para HTTPS
```

---

## 🔗 Documentación de API Completa

### 🔐 Autenticación

| Endpoint | Método | Descripción | Body | Respuesta |
|----------|--------|-------------|------|-----------|
| `/api/v1/login` | POST | Iniciar sesión | `{email, password}` | JWT Token |
| `/api/v1/register` | POST | Registro de usuario | `{usuario, email, password, rut}` | Usuario creado |
| `/api/v1/logout` | POST | Cerrar sesión | - | Token invalidado |

**Ejemplo de Login:**
```json
POST /api/v1/login
{
  "email": "estudiante@alumnos.ubiobio.cl",
  "password": "contraseña123"
}

// Respuesta exitosa
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "usuario": "estudiante",
      "email": "estudiante@alumnos.ubiobio.cl",
      "rol": "estudiante"
    }
  }
}
```

### 📝 Gestión de Propuestas

| Endpoint | Método | Descripción | Rol Requerido | Parámetros |
|----------|--------|-------------|---------------|------------|
| `/api/v1/propuestas` | GET | Listar propuestas | Todos | `?estado=`, `?page=`, `?limit=` |
| `/api/v1/propuestas` | POST | Crear propuesta | Estudiante | FormData con archivo |
| `/api/v1/propuestas/:id` | GET | Obtener propuesta | Todos | - |
| `/api/v1/propuestas/:id` | PUT | Editar propuesta | Estudiante/Admin | FormData |
| `/api/v1/propuestas/:id/comentarios` | POST | Agregar comentario | Profesor/Admin | `{comentario}` |
| `/api/v1/propuestas/:id/estado` | PUT | Cambiar estado | Profesor/Admin | `{estado}` |

### 🎯 Sistema de Hitos

| Endpoint | Método | Descripción | Rol Requerido | Body/Params |
|----------|--------|-------------|---------------|-------------|
| `/api/v1/projects/:projectId/hitos` | GET | Listar hitos | Todos | - |
| `/api/v1/projects/:projectId/hitos` | POST | Crear hito | Profesor/Admin | `{nombre, descripcion, fecha_limite}` |
| `/api/v1/hitos/:hitoId/entregar` | POST | Entregar hito | Estudiante | FormData con archivo |
| `/api/v1/hitos/:hitoId/revisar` | POST | Revisar hito | Profesor | `{aprobado, calificacion, comentarios}` |
| `/api/v1/hitos/:hitoId/detalle` | GET | Detalle del hito | Todos | - |

### 📅 Sistema de Fechas Importantes

| Endpoint | Método | Descripción | Rol Requerido | Body/Params |
|----------|--------|-------------|---------------|-------------|
| `/api/v1/fechas-importantes/proyecto/:projectId` | GET | Fechas del proyecto | Todos | - |
| `/api/v1/fechas-importantes` | POST | Crear fecha | Profesor/Admin | `{titulo, descripcion, fecha, proyecto_id}` |
| `/api/v1/fechas-importantes/:fechaId` | PUT | Editar fecha | Profesor/Admin | `{titulo, descripcion, fecha}` |
| `/api/v1/fechas-importantes/:fechaId` | DELETE | Eliminar fecha | Admin | - |
| `/api/v1/fechas-importantes/:fechaId/completar` | POST | Marcar completada | Estudiante | - |

### 🏛️ Administración

| Endpoint | Método | Descripción | Rol Requerido | Body/Params |
|----------|--------|-------------|---------------|-------------|
| `/api/v1/admin/usuarios` | GET | Listar usuarios | Admin | `?rol=`, `?page=` |
| `/api/v1/admin/usuarios/:userId/asignar` | POST | Asignar profesor | Admin | `{profesor_id, proyecto_id}` |
| `/api/v1/admin/estadisticas` | GET | Estadísticas globales | Admin | - |
| `/api/v1/admin/calendario/global` | POST | Crear fecha global | Admin | `{titulo, descripcion, fecha}` |

---

## 🧪 Testing y Calidad de Código

### Ejecución de Tests

```bash
# Tests del Backend
cd backend
npm test                    # Unit tests
npm run test:coverage      # Coverage report
npm run test:integration   # Integration tests

# Tests del Frontend  
cd frontend
ng test                    # Unit tests con Jest
ng test --coverage        # Coverage report
ng e2e                    # End-to-end tests con Cypress
npm run test:lint         # Linting con ESLint
```

### Calidad de Código

```bash
# Backend
npm run lint              # ESLint
npm run lint:fix          # Auto-fix linting issues
npm run format            # Prettier formatting

# Frontend
ng lint                   # Angular ESLint
ng lint --fix            # Auto-fix
npm run format           # Prettier formatting
```

### Métricas de Calidad

- ✅ **Coverage**: >80% en componentes críticos
- ✅ **Linting**: Configuración ESLint estricta
- ✅ **TypeScript**: Strict mode habilitado
- ✅ **Security**: Dependencias auditadas regularmente

---

## 🛠️ Troubleshooting Avanzado

### Problemas Comunes y Soluciones

<details>
<summary><strong>❌ Error: "JWT token expired" o "Invalid token"</strong></summary>

**Problema**: Token de autenticación expirado o inválido.

**Solución**:
```bash
# Limpiar localStorage del navegador
localStorage.clear();

# O reiniciar sesión
# El sistema automáticamente redirige al login
```

**Prevención**: El token se renueva automáticamente en el interceptor.
</details>

<details>
<summary><strong>❌ Error: "File upload failed" o "File too large"</strong></summary>

**Problema**: Error en subida de archivos.

**Causa común**: Archivo excede 10MB o formato no permitido.

**Solución**:
```bash
# Verificar configuración en backend/.env
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Reiniciar backend si se cambió configuración
docker-compose restart backend
```
</details>

<details>
<summary><strong>❌ Error: "Email notification failed"</strong></summary>

**Problema**: Las notificaciones por email no funcionan.

**Solución**:
```bash
# Verificar configuración de email en backend/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_aplicacion  # No la contraseña normal

# Para Gmail, habilitar "Contraseñas de aplicación"
# Google Account > Security > 2-Step Verification > App passwords
```
</details>

<details>
<summary><strong>🐳 Error: "Docker container keeps restarting"</strong></summary>

**Problema**: Contenedores en loop de reinicio.

**Diagnóstico**:
```bash
# Ver logs detallados
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Verificar estado de contenedores
docker-compose ps

# Verificar recursos del sistema
docker system df
docker system prune  # Limpiar si es necesario
```

**Solución común**:
```bash
# Reinicio completo
docker-compose down -v
docker-compose up --build

# Si persiste, verificar recursos disponibles
# MySQL necesita al menos 512MB RAM
```
</details>

<details>
<summary><strong>📱 Error: "Responsive design issues"</strong></summary>

**Problema**: Interfaz no se ve bien en móviles.

**Verificación**:
```bash
# El CSS ya incluye media queries para:
# - Móviles: < 768px
# - Tablets: 768px - 1024px  
# - Desktop: > 1024px

# Verificar en DevTools del navegador
# F12 > Toggle device toolbar
```

**Solución**: Los estilos responsive están implementados en cada componente.
</details>

### Comandos de Mantenimiento

```bash
# ============================================
# MANTENIMIENTO DE LA BASE DE DATOS
# ============================================

# Backup de la base de datos
docker exec mysql_container mysqldump -u actitubb_user -p actitubb > backup.sql

# Restaurar backup
docker exec -i mysql_container mysql -u actitubb_user -p actitubb < backup.sql

# ============================================
# LIMPIEZA DEL SISTEMA
# ============================================

# Limpiar Docker
docker system prune -a              # Eliminar contenedores/imágenes no usadas
docker volume prune                 # Eliminar volúmenes no usados

# Limpiar logs
docker-compose logs --tail=0 -f     # Ver solo logs nuevos

# ============================================
# MONITOREO
# ============================================

# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f --tail=100

# Verificar salud de servicios
docker-compose ps
```

### Logs y Debugging

```bash
# Backend logs
docker-compose logs backend | grep ERROR
docker-compose logs backend | grep -i "auth\|jwt\|token"

# Frontend logs  
docker-compose logs frontend | grep -i "error\|warning"

# MySQL logs
docker-compose logs mysql | grep -i "error\|warning"

# Logs específicos por timestamp
docker-compose logs --since="2024-01-01T00:00:00" backend
```

---

## 📊 Métricas y Monitoring

### Estadísticas del Sistema

El sistema incluye endpoints para métricas:

```bash
# Estadísticas generales
GET /api/v1/admin/estadisticas

{
  "usuarios_totales": 150,
  "propuestas_activas": 45,
  "hitos_pendientes": 23,
  "fechas_proximas": 8
}

# Métricas por rol
GET /api/v1/admin/estadisticas/rol/:roleId
```

### Performance Monitoring

```bash
# Backend performance
npm run test:performance

# Frontend bundle analysis
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Database performance
SHOW PROCESSLIST;  # En MySQL
EXPLAIN SELECT * FROM propuestas;  # Query analysis
```

---

## 🔒 Seguridad

### Características de Seguridad Implementadas

#### Autenticación y Autorización
- ✅ **JWT con blacklist**: Tokens seguros con invalidación
- ✅ **Bcrypt**: Hash de contraseñas con salt rounds configurable
- ✅ **CORS configurado**: Origen específico para producción

#### Validación de Datos
- ✅ **Sanitización**: Input sanitization en backend
- ✅ **Validación de RUT**: Algoritmo específico para RUT chileno
- ✅ **Validación de archivos**: Tipo y tamaño
- ✅ **SQL Injection**: Prepared statements en todas las queries


### Configuración de Seguridad

```bash
# Configuración de seguridad en backend/.env
JWT_SECRET=clave_super_segura_de_al_menos_64_caracteres
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_WINDOW=15  # minutos
RATE_LIMIT_REQUESTS=100
```

---

## 🚀 Deployment en Producción

### Preparación para Producción

1. **Configurar variables de entorno de producción**
2. **Configurar SSL/TLS con Let's Encrypt**
3. **Configurar backup automático de base de datos**
4. **Configurar monitoring y logging**

### Docker Compose para Producción

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    networks:
      - app-network
    volumes:
      - ./backend/uploads:/app/uploads
      - ./logs:/app/logs

  frontend:
    build: ./frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: actitubb
      MYSQL_USER: actitubb_user
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    restart: unless-stopped
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backup:/backup
    networks:
      - app-network

  backup:
    image: alpine:latest
    restart: unless-stopped
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backup:/backup
    command: |
      sh -c 'while true; do
        mysqldump -h mysql -u actitubb_user -p$$MYSQL_PASSWORD actitubb > /backup/backup_$$(date +%Y%m%d_%H%M%S).sql
        find /backup -name "backup_*.sql" -mtime +7 -delete
        sleep 86400
      done'

volumes:
  mysql_data:

networks:
  app-network:
    driver: bridge
```

### Monitoreo con Prometheus y Grafana

```yaml
# Agregar al docker-compose.yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
```

---

## 📚 Recursos Adicionales y Referencias

### Documentación Técnica
- [📖 Angular Documentation](https://angular.io/docs)
- [⚡ Vite Build Tool](https://vitejs.dev/guide/)
- [🐳 Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [🗄️ MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [🔒 Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

### Recursos de Desarrollo
- [🎨 Angular Material Components](https://material.angular.io/components)
- [📝 TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [🧪 Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [🔍 Cypress E2E Testing](https://docs.cypress.io/)

### Herramientas Útiles
- [🛠️ VS Code Extensions](https://marketplace.visualstudio.com/vscode) recomendadas:
  - Angular Language Service
  - Docker
  - ESLint
  - Prettier
  - MySQL

---

## 🤝 Contribución y Desarrollo

### Guía de Contribución

1. **Fork del proyecto**
   ```bash
   git clone https://github.com/tu-usuario/AcTitUBB.git
   cd AcTitUBB
   git remote add upstream https://github.com/Dantrotel/AcTitUBB.git
   ```

2. **Crear rama de feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

3. **Desarrollo con convenciones**
   - Usar TypeScript strict mode
   - Seguir patrones Angular establecidos
   - Escribir tests para nueva funcionalidad
   - Documentar APIs nuevas

4. **Testing antes de commit**
   ```bash
   # Backend
   cd backend && npm test && npm run lint
   
   # Frontend  
   cd frontend && ng test && ng lint
   ```

5. **Commit con mensaje descriptivo**
   ```bash
   git commit -m "feat: agregar sistema de notificaciones push
   
   - Implementar Service Worker para notificaciones
   - Agregar configuración de Firebase
   - Crear componente de configuración de notificaciones
   - Agregar tests unitarios
   
   Closes #123"
   ```

6. **Pull Request**
   - Descripción detallada de cambios
   - Screenshots si hay cambios UI
   - Lista de testing realizado
   - Mencionar issues relacionadas

### Convenciones de Código

#### Frontend (Angular)
```typescript
// Estructura de componentes
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, /* otros imports */],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss']
})
export class FeatureNameComponent implements OnInit, OnDestroy {
  // Propiedades públicas primero
  public data: any[] = [];
  
  // Propiedades privadas después
  private subscription$ = new Subject<void>();
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.subscription$.next();
    this.subscription$.complete();
  }
  
  // Métodos públicos
  public onAction(): void {
    // implementación
  }
  
  // Métodos privados
  private loadData(): void {
    // implementación
  }
}
```

#### Backend (Node.js)
```javascript
// Estructura de controladores
const FeatureController = {
  // GET /api/v1/features
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const features = await FeatureService.getAll(page, limit);
      
      return res.status(200).json({
        success: true,
        message: 'Features retrieved successfully',
        data: features,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: features.total
        }
      });
    } catch (error) {
      console.error('Error in FeatureController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
```


## 📄 Licencia y Términos de Uso

### Licencia Académica

Este proyecto está desarrollado para uso académico en la **Universidad del Bío-Bío** bajo los siguientes términos:

- ✅ **Uso académico**: Libre para investigación y educación
- ✅ **Modificación**: Permitida para propósitos educativos
- ✅ **Distribución**: Con atribución apropiada
- ❌ **Uso comercial**: Requiere autorización expresa

---

## 👨‍💻 Equipo de Desarrollo

### 🏆 **Desarrollador Principal**

<div align="center">

**Daniel Aguayo**  
*Full Stack Developer & Student*

[![GitHub](https://img.shields.io/badge/GitHub-Dantrotel-black?logo=github)](https://github.com/Dantrotel)
[![Email](https://img.shields.io/badge/Email-daniel.aguayo2001%40alumnos.ubiobio.cl-red?logo=gmail)](mailto:daniel.aguayo2001@alumnos.ubiobio.cl)

🏫 **Universidad del Bío-Bío**  
📅 **2025**  
🎓 **Ingeniería de ejecución en computación e Informática**

</div>


### 🙏 **Agradecimientos**

- **Universidad del Bío-Bío** - Por el soporte académico
- **Facultad de Ciencias empresariales** - Por los recursos y guidance
- **Profesores guía** - Por la mentoría técnica
- **Comunidad Open Source** - Por las herramientas utilizadas

---

## 📞 Soporte y Contacto

### 🆘 **Soporte Técnico**

¿Encontraste un bug o tienes una pregunta técnica?

1. **📋 Revisa Issues existentes**: [GitHub Issues](https://github.com/Dantrotel/AcTitUBB/issues)
2. **📧 Contacto directo**: [daniel.aguayo2001@alumnos.ubiobio.cl](mailto:daniel.aguayo2001@alumnos.ubiobio.cl)

---

<div align="center">

## 🌟 **¡Gracias por usar AcTitUBB!** 🌟

**Si este proyecto te ayuda en tu trabajo académico, ¡considera darle una estrella! ⭐**

---

*Desarrollado con ❤️ para la comunidad académica de la Universidad del Bío-Bío*

**© 2025 Daniel Aguayo - Universidad del Bío-Bío**

---


</div>
