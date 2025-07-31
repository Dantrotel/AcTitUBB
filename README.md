# 🎓 AcTitUBB - Sistema de Gestión de Títulos de Grado
## Universidad del Bío-Bío

<div align="center">

![Universidad del Bío-Bío](frontend/public/Escudo_Universidad_del_Bío-Bío.png)

**Sistema integral para la gestión y seguimiento de propuestas de tesis y proyectos de título**

[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)
[![Angular](https://img.shields.io/badge/Angular-18+-red?logo=angular)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange?logo=mysql)](https://www.mysql.com/)

</div>

---

## 📖 Descripción

**AcTitUBB** es una aplicación web completa diseñada para digitalizar y optimizar la gestión de propuestas de tesis en la Universidad del Bío-Bío. El sistema facilita el proceso desde la creación inicial de propuestas hasta la defensa final, involucrando estudiantes, profesores y administradores en un flujo de trabajo eficiente y transparente.

### ✨ Características Principales

- 📝 **Gestión de Propuestas**: Creación, edición y seguimiento de propuestas de tesis
- 👥 **Sistema de Roles**: Estudiantes, Profesores y Administradores con permisos específicos
- 📁 **Gestión de Archivos**: Subida y descarga de documentos (PDF, Word)
- 📅 **Calendario Académico**: Gestión de fechas importantes y hitos
- 💬 **Sistema de Comentarios**: Retroalimentación entre profesores y estudiantes
- 🔔 **Notificaciones**: Alertas por email y en la plataforma
- 📊 **Dashboard**: Paneles personalizados según el rol de usuario

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Frontend** | Angular 18+ | Interfaz de usuario moderna y responsive |
| **Backend** | Node.js 20+ | API REST y lógica de negocio |
| **Base de Datos** | MySQL 8.0+ | Almacenamiento de datos |
| **Contenedores** | Docker & Docker Compose | Orquestación y despliegue |
| **Servidor Web** | Nginx | Proxy reverso y servidor de archivos estáticos |

---

## 👥 Roles del Sistema

### 🎓 Estudiante
- ✅ Crear y editar propuestas de tesis
- 📄 Subir documentos (PDF, Word, imágenes)
- 👀 Visualizar estado y comentarios de sus propuestas
- 📅 Consultar fechas importantes del calendario académico
- 📈 Seguimiento del progreso de su proyecto

### 👨‍🏫 Profesor
- 📋 Revisar propuestas asignadas
- 💭 Agregar comentarios y retroalimentación
- ✅ Aprobar o rechazar propuestas
- 📊 Gestionar múltiples proyectos de estudiantes
- 📅 Crear fechas específicas para sus estudiantes

### 🏛️ Administrador
- 👥 Gestión completa de usuarios del sistema
- 🔗 Asignación de profesores a propuestas/proyectos
- 📅 Administración del calendario académico global
- 📊 Vista general del sistema y estadísticas
- ⚙️ Configuración general de la plataforma

---

## 📁 Estructura del Proyecto

```
AcTitUBB/
├── 📂 backend/                     # API REST con Node.js
│   ├── 📂 src/
│   │   ├── 📂 controllers/         # Controladores de rutas
│   │   ├── 📂 services/           # Lógica de negocio
│   │   ├── 📂 models/             # Modelos de datos
│   │   ├── 📂 routes/             # Definición de rutas
│   │   ├── 📂 middlewares/        # Middlewares (auth, upload, etc.)
│   │   ├── 📂 db/                 # Configuración de base de datos
│   │   │   ├── connectionDB.js    # Pool de conexiones MySQL
│   │   │   └── database.sql       # Script de inicialización
│   │   └── index.js               # Punto de entrada del servidor
│   ├── 📂 uploads/                # Archivos subidos por usuarios
│   ├── dockerfile                 # Imagen Docker del backend
│   └── package.json
├── 📂 frontend/                    # Aplicación Angular
│   ├── 📂 src/app/
│   │   ├── 📂 pages/              # Páginas por rol
│   │   │   ├── 📂 estudiante/     # Módulos del estudiante
│   │   │   ├── 📂 profesor/       # Módulos del profesor
│   │   │   ├── 📂 admin/          # Módulos del administrador
│   │   │   └── 📂 propuestas/     # Gestión de propuestas
│   │   ├── 📂 services/           # Servicios Angular
│   │   ├── 📂 guards/             # Guards de autenticación
│   │   └── 📂 components/         # Componentes reutilizables
│   ├── 📂 public/                 # Recursos estáticos
│   ├── dockerfile                 # Imagen Docker del frontend
│   ├── nginx.conf                 # Configuración de Nginx
│   └── angular.json               # Configuración de Angular
├── 📂 mysql/
│   └── init.sql/                  # Scripts de inicialización DB
├── docker-compose.yml             # Orquestación de servicios
└── README.md
```

---

## 🚀 Instalación y Despliegue

### Prerrequisitos

- [Docker](https://www.docker.com/get-started) (versión 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0+)
- Git

### 🐳 Instalación con Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/AcTitUBB.git
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
   - 🗄️ **Base de datos**: localhost:3306

### 🔧 Desarrollo Local (Sin Docker)

<details>
<summary>Click para expandir instrucciones de desarrollo</summary>

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
```

**Base de Datos:**
- Instalar MySQL 8.0+
- Ejecutar script `backend/src/db/database.sql`
- Configurar variables de entorno en `backend/.env`

</details>

---

## ⚙️ Configuración

### Variables de Entorno

Si necesitas personalizar la configuración, crea un archivo `.env` en `/backend/`:

```bash
# Configuración del Servidor
PORT=3000
NODE_ENV=production

# Base de Datos (Para desarrollo local)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=actitubb
DB_USER=actitubb_user
DB_PASSWORD=tu_contraseña_segura

# Autenticación
JWT_SECRET=tu_clave_jwt_muy_segura

# Email (Para notificaciones)
EMAIL_USER=tu_email@ubiobio.cl
EMAIL_PASS=tu_contraseña_email
```

### Configuración para Producción

Para desplegar en un servidor remoto, modifica estos archivos con las nuevas credenciales:

1. **Variables de entorno**: `backend/.env`
2. **URL del backend**: `frontend/src/app/services/api.ts`
3. **CORS**: `backend/src/index.js`
4. **Confirmación de email**: `backend/src/services/email.service.js`
5. **Docker Compose**: `docker-compose.yml`

---

## 🔗 API Documentation

### Autenticación

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|---------------|
| `/api/v1/login` | POST | Iniciar sesión | ❌ |
| `/api/v1/register` | POST | Registro de usuario | ❌ |

**Ejemplo Login:**
```json
{
  "email": "estudiante@alumnos.ubiobio.cl",
  "password": "contraseña123"
}
```

### Propuestas

| Endpoint | Método | Descripción | Rol Requerido |
|----------|--------|-------------|---------------|
| `/api/v1/propuestas` | GET | Listar propuestas | Todos |
| `/api/v1/propuestas` | POST | Crear propuesta | Estudiante |
| `/api/v1/propuestas/:id` | PUT | Editar propuesta | Estudiante/Admin |
| `/api/v1/propuestas/:id/asignar` | POST | Asignar profesor | Admin |

### Calendario

| Endpoint | Método | Descripción | Rol Requerido |
|----------|--------|-------------|---------------|
| `/api/v1/calendario/estudiante/mis-fechas` | GET | Fechas del estudiante | Estudiante |
| `/api/v1/calendario/admin/global` | POST | Crear fecha global | Admin |

---

## 🛠️ Troubleshooting

### Problemas Comunes

<details>
<summary><strong>❌ Error: "MySQL connection refused"</strong></summary>

**Problema**: El backend no puede conectarse a MySQL.

**Solución**:
```bash
# Verificar que MySQL esté corriendo
docker-compose ps

# Reiniciar los servicios
docker-compose down
docker-compose up --build
```
</details>

<details>
<summary><strong>❌ Error: "nginx: invalid value must-revalidate"</strong></summary>

**Problema**: Error en la configuración de Nginx.

**Solución**: Este error ya está corregido en la versión actual. Si persiste:
```bash
docker-compose down
docker-compose up --build
```
</details>

<details>
<summary><strong>❌ Error: "Angular budget exceeded"</strong></summary>

**Problema**: Los archivos del frontend son muy grandes.

**Solución**: Los budgets ya están ajustados en `angular.json`. Para modificarlos:
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "1MB",
    "maximumError": "2MB"
  }
]
```
</details>

<details>
<summary><strong>🔄 Resetear la base de datos</strong></summary>

```bash
# Eliminar volúmenes y reiniciar
docker-compose down -v
docker-compose up --build
```
</details>

### Logs del Sistema

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && ng test

# E2E tests
cd frontend && ng e2e
```

---

## 📚 Recursos Adicionales

- [📖 Documentación de Angular](https://angular.io/docs)
- [🐳 Docker Compose Reference](https://docs.docker.com/compose/)
- [🗄️ MySQL Documentation](https://dev.mysql.com/doc/)
- [🌐 Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 👨‍💻 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está desarrollado para uso académico en la Universidad del Bío-Bío.

---

## 👤 Autor

**Daniel Aguayo**  
📧 Email: [daniel.aguayo2001@alumnos.ubiobio.cl](mailto:daniel.aguayo@alumnos.ubiobio.cl)  
🏫 Universidad del Bío-Bío  
📅 2025

---

<div align="center">

**⭐ Si este proyecto te ayuda, ¡considera darle una estrella! ⭐**

</div>
