# Proyecto de Seguimiento de Propuestas de Tesis - Universidad del Bío-Bío

Este proyecto es una aplicación web diseñada para gestionar propuestas de tesis y hacer seguimiento del proceso, involucrando roles como estudiantes, profesores y jefes de carrera. Permite subir propuestas, asignar revisores, comentar, aprobar/rechazar propuestas, y mantener un historial del proceso.

## 🧑‍💻 Tecnologías Utilizadas

- **Backend**: Node.js, Express
- **Frontend**: Angular (standalone components)
- **Base de datos**: MySQL
- **Contenerización**: Docker y Docker Compose

---

## 🚻 Roles de Usuario

- **Estudiante**:
  - Crear propuestas de tesis
  - Subir archivos (PDF, Word)
  - Ver el estado de sus propuestas
  - Ver comentarios de profesores

- **Profesor**:
  - Ver todas las propuestas
  - Asignarse propuestas para revisar
  - Dejar comentarios
  - Cambiar estado de propuestas (solo si está asignado)

- **Jefe de carrera**:
  - Asignar profesores a propuestas y/o proyectos
  - Revisar el historial de revisiones

---

## 📁 Estructura del Proyecto

```bash
/
├── backend/                # API REST con Node.js
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── index.js
├── frontend/               # Aplicación Angular
│   ├── src/app/
│   │   ├── estudiante/
│   │   ├── profesor/
│   │   ├── shared/
│   │   └── auth/
├── mysql/init.sql          # Script inicial para crear base y usuario
├── .env                    # Variables de entorno (usadas por backend)
├── docker-compose.yml      # Orquestación de servicios
└── README.md
```

## ⚙️ Instalación con Docker
1. Clona el repositorio: 
 ```bash
git clone <url_del_repositorio>
cd <nombre_del_proyecto>
 ```
 2. Asegúrate de tener Docker y Docker Compose instalados.
 3. Inicia todos los servicios (MySQL, Backend, Frontend):
 ```bash
docker-compose up --build
 ```
 4. La aplicación estará disponible en:
-   **Frontend**: [http://localhost:4200](http://localhost:4200)
    
-   **Backend (API)**: [http://localhost:3000](http://localhost:3000)
    
-   **Base de datos**: puerto 3306 (expuesto por Docker)

## 🔐 Variables de Entorno (`.env`)
Asegúrate de tener un archivo `.env` en la raíz del backend con el siguiente contenido:
 ```bash
# Puerto en el que corre la aplicación

PORT=3000  # Cambia esto si tu aplicación corre en otro puerto

# Puedes cambiar el puerto según tus necesidades

# Asegúrate de que este puerto esté libre y no sea utilizado por otra aplicación

  
  
# Configuración de la base de datos MySQL

DB_HOST=localhost  # Cambia esto si tu base de datos está en otro host

DB_PORT=3306  # Puerto por defecto de MySQL

DB_USER=usuario  # Cambia esto por tu usuario de MySQL

DB_PASSWORD=contraseña  # Cambia esto por tu contraseña de MySQL

DB_NAME=nombre_base_de_datos  # Cambia esto por el nombre de tu base de datos

  

# Clave secreta para JWT

JWT_SECRET=tu_clave_secreta  # Cambia esto por una clave secreta segura

 ```

## 🔗 API Endpoints
### Autenticación
Iniciar sesión con la ruta: 
 ```bash
POST api/auth/v1/user/login
 ```

  ```json
{
  "email": "usuario@ubiobio.cl",
  "password": "example"
}
 ```
Registro:
 ```bash
POST api/auth/v1/user/register
 ```
  ```json
{
  "rut": "12345678-9",
  "nombre": "Juan Pérez",
  "email": "usuario@ubiobio.cl",
  "password": "example123"
}

 ```
 ### Propuestas
 Crear propuesta (estudiante autenticado)
 ```bash
POST /api/propuestas
 ```
 Ver todas las propuestas (profesor/jefe)
 ```bash
GET /api/propuestas
 ```
 Asignarse propuesta (profesor)
 ```bash
PATCH /api/propuestas/:id/asignar
 ```
 Comentar propuesta (profesor asignado)
 ```bash
POST /api/propuestas/:id/comentarios
 ```
 
 ## 📝 Notas Finales
 -   El sistema de login soporta correos con dominio `@ubiobio.cl` y `@alumnos.ubiobio.cl`.
    
-   Asegúrate de tener puertos 3000 (API), 4200 (frontend) y 3306 (MySQL) libres.
    
-   Puedes modificar las credenciales y la configuración desde `.env`.

##
Desarrollado por Daniel Aguayo – Universidad del Bío-Bío
