CREATE USER IF NOT EXISTS 'AcTitUBB'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON actitubb.* TO 'AcTitUBB'@'%';
FLUSH PRIVILEGES;


CREATE DATABASE IF NOT EXISTS actitubb;
USE actitubb;

CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Usuarios (
    Rut INT NOT NULL PRIMARY KEY UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES Roles(id)
);

CREATE TABLE IF NOT EXISTS Estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL,
    fecha_entrega DATE NOT NULL,
    fecha_inicio DATE,
    estudiante INT NOT NULL,
    FOREIGN KEY (estudiante) REFERENCES Usuarios(Rut),
    FOREIGN KEY (estado) REFERENCES Estados(nombre)
);

CREATE TABLE IF NOT EXISTS Profesores (
    Rut INT NOT NULL PRIMARY KEY UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    proyecto_id INT NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
    FOREIGN KEY (Rut) REFERENCES Usuarios(Rut)
);

CREATE TABLE IF NOT EXISTS Reuniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar VARCHAR(100) NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id)
);

CREATE TABLE IF NOT EXISTS Avances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id)
);

CREATE TABLE IF NOT EXISTS AsignacionProfesores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_id INT NOT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
    FOREIGN KEY (profesor_id) REFERENCES Profesores(Rut)
);

CREATE TABLE  IF NOT EXISTS propuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estudiante_rut VARCHAR(12) NOT NULL,
  profesor_rut VARCHAR(12),
  estado ENUM('pendiente', 'correcciones', 'aprobada', 'rechazada') DEFAULT 'pendiente',
  comentarios_profesor TEXT,
  fecha_envio DATE NOT NULL,
  fecha_revision DATETIME,
  asignado_por VARCHAR(12),
  archivo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

