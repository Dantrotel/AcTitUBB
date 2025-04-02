
# Proyecto de Seguimiento de Estudiantes de Proyecto Final de Carrera

Este proyecto es una aplicación web diseñada para realizar seguimiento de estudiantes que están en el proyecto final de carrera en la Universidad. La app permite la gestión de roles específicos (estudiante, profesor, jefe de carrera y secretaria), asignación de profesores a estudiantes, agendamiento de reuniones y entrega de avances. Los estudiantes también tienen una comisión evaluadora que otorga una nota final tras la defensa del proyecto.

## Tecnologías Utilizadas

**Backend**: Node.js, Express

**Frontend**: React

**Base de datos**: PostgreSQL


# Características Principales

## Roles de usuario:

**Estudiante**: Puede agendar reuniones y entregar avances del proyecto.

**Profesor**: Asigna roles (guía, sala o informante) y participa en la comisión de evaluación.

**Jefe de carrera**: Administra el sistema, asigna profesores y roles.


# Estructura del Proyecto

**La estructura de carpetas en este proyecto es la siguiente:**
```bash
/src
|-- /config       # Configuraciones generales y variables de entorno
|-- /controllers  # Controladores para la lógica del negocio
|-- /db/models    # Definición de modelos de la base de datos
|-- /libs         # Librerías y utilidades auxiliares
|-- /routes       # Rutas de la API
|-- /services     # Servicios para la interacción con la base de datos y otros sistemas
/frontend         # Carpeta para el frontend de React
```

# Instalación

1. Clona el repositorio:

```bash
git clone <url_del_repositorio>
cd <nombre_del_proyecto>
```

2. Instala las dependencias del backend:
   
```bash
npm install
```

3. Configura la base de datos PostgreSQL y añade las variables de entorno necesarias en un archivo .env

```bash
PORT= # puerto donde correrá el proyecto 
DATABASE_URL= postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}
JWT_SECRET= # palabra secreta 
```

4. Inicia el servidor:
```bash
npm run dev
```

# Uso

## API Endpoints

A continuación se listan algunos endpoints básicos:

Autenticación:

**Inicio de sesion**
```bash
POST /auth/v1/user/login - Inicia sesión
```
Ejemplo JSON

```json
{
    "email": "example@ubiobio.cl", # los dominios validos son @ubiobio.cl y @alumnos.ubiobio.cl
    "password": "example"
}
```

**Registro**
```bash
POST /auth/v1/user/register - registrar usuario nuevo
```

Ejemplo JSON

```json
{
    "rut": "12345678-9", # Ingresar RUT valido
    "nombre": "example",
    "email": "example@ubiobio.cl" o "example@alumnos.ubiobio.cl", # los dominios validos son @ubiobio.cl y @alumnos.ubiobio.cl
    "password": "example123"
}
```


