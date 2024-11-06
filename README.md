
Proyecto de Seguimiento de Estudiantes de Proyecto Final de Carrera

Este proyecto es una aplicación web diseñada para realizar seguimiento de estudiantes que están en el proyecto final de carrera en la Universidad. La app permite la gestión de roles específicos (estudiante, profesor, jefe de carrera y secretaria), asignación de profesores a estudiantes, agendamiento de reuniones y entrega de avances. Los estudiantes también tienen una comisión evaluadora que otorga una nota final tras la defensa del proyecto.

Tecnologías Utilizadas

Backend: Node.js, Express

Frontend: React

Base de datos: PostgreSQL


Características Principales

1. Roles de usuario:

Estudiante: Puede agendar reuniones y entregar avances del proyecto.

Profesor: Asigna roles (guía, sala o informante) y participa en la comisión de evaluación.

Jefe de carrera: Administra el sistema, asigna profesores y roles.

Secretaria: Apoya en la organización del seguimiento de los estudiantes.


Estructura del Proyecto

La estructura de carpetas en este proyecto es la siguiente:

/src
|-- /config       # Configuraciones generales y variables de entorno
|-- /controllers  # Controladores para la lógica del negocio
|-- /db/models    # Definición de modelos de la base de datos
|-- /libs         # Librerías y utilidades auxiliares
|-- /routes       # Rutas de la API
|-- /services     # Servicios para la interacción con la base de datos y otros sistemas
/frontend         # Carpeta para el frontend de React

Instalación

1. Clona el repositorio:

git clone <url_del_repositorio>
cd <nombre_del_proyecto>


2. Instala las dependencias del backend:

npm install


3. Configura la base de datos PostgreSQL y añade las variables de entorno necesarias en un archivo .env


5. Inicia el servidor:

npm run dev



Uso

API Endpoints

A continuación se listan algunos endpoints básicos:

Autenticación:

POST /auth/v1/user/login - Inicia sesión

POST /auth/v1/user/register - registrar usuario nuevo



Licencia

Este proyecto está bajo la Licencia MIT.


