-- Cear base de datos
CREATE DATABASE AcTitUBB;

-- Conectar a la base de datos
\c AcTitUBB;

-- Crear tabla para roles de usuario
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);

-- Insertar roles 
INSERT INTO roles (nombre) VALUES ('estudiante'), ('profesor'), ('jefe de carrera'), ('admin');

-- Crear tabla para personas
CREATE TABLE person (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(13) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT REFERENCES roles(id),
    UNIQUE (email)
);

-- Crear tabla para proyectos
CREATE TABLE project (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE,
    estudiante_id INT REFERENCES usuarios(id),
    estado VARCHAR(255) REFERENCES project_states(id)
);

-- Crear tabla para los estados de los proyectos
CREATE TABLE project_states (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);

-- Crear tabla para el rol de los profesores en un proyecto específico
CREATE TABLE roles_profesor (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);

-- Insertar roles de profesores específicos
INSERT INTO roles_profesor (nombre) VALUES ('guía'), ('sala'), ('informante');

-- Crear tabla para la comisión de profesores en cada proyecto
CREATE TABLE comisiones (
    id SERIAL PRIMARY KEY,
    proyecto_id INT REFERENCES proyectos(id),
    profesor_id INT REFERENCES usuarios(id),
    rol_profesor_id INT REFERENCES roles_profesor(id),
);

-- Crear tabla para reuniones entre estudiantes y profesores
CREATE TABLE reuniones (
    id SERIAL PRIMARY KEY,
    proyecto_id INT REFERENCES proyectos(id),
    fecha TIMESTAMP NOT NULL,
    descripcion TEXT,
    creada_por INT REFERENCES usuarios(id),
    UNIQUE (proyecto_id, fecha)
);

-- Crear tabla para los avances de los proyectos
CREATE TABLE avances (
    id SERIAL PRIMARY KEY,
    proyecto_id INT REFERENCES proyectos(id),
    fecha_entrega DATE NOT NULL,
    descripcion TEXT,
    estado VARCHAR(100) REFERENCES project_states(id)
);

-- Crear tabla para asignar profesores a proyectos
CREATE TABLE profesores_proyectos (
    id SERIAL PRIMARY KEY,
    proyecto_id INT REFERENCES proyectos(id),
    profesor_id INT REFERENCES usuarios(id),
    rol_profesor_id INT REFERENCES roles_profesor(id),
);