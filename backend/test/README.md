# Tests de Backend - AcTitUBB

Suite completa de tests para la API del sistema de gestión de proyectos de título.

## 📋 Contenido

- **auth.test.js** - Tests de autenticación, login y gestión de tokens
- **propuestas.test.js** - Tests CRUD de propuestas y validaciones
- **admin.test.js** - Tests de funcionalidades administrativas
- **integration.test.js** - Tests de integración de flujos completos
- **setup.test.js** - Configuración y helpers para tests

## 🚀 Ejecución

### Ejecutar todos los tests:
```bash
npm test
```

### Ejecutar tests específicos:
```bash
# Tests de autenticación
node --test test/auth.test.js

# Tests de propuestas
node --test test/propuestas.test.js

# Tests de admin
node --test test/admin.test.js

# Tests de integración
node --test test/integration.test.js
```

### Ejecutar con el runner personalizado:
```bash
node test/run-tests.js
```

## ⚙️ Configuración

### 1. Crear base de datos de prueba:
```sql
CREATE DATABASE actitubb_test;
```

### 2. Ejecutar el script de esquema:
```bash
mysql -u root -p actitubb_test < backend/src/db/database.sql
```

### 3. Cargar datos iniciales:
```bash
mysql -u root -p actitubb_test < backend/src/db/datos-prueba.sql
```

### 4. Configurar variables de entorno:
Edita `.env.test` con tus credenciales de base de datos de prueba.

## 📊 Cobertura de Tests

### Autenticación (auth.test.js)
- ✅ Login con credenciales válidas
- ✅ Rechazo de credenciales inválidas
- ✅ Generación y validación de tokens
- ✅ Protección de rutas autenticadas
- ✅ Control de acceso por roles (admin, profesor, estudiante)

### Propuestas (propuestas.test.js)
- ✅ Crear propuesta con datos válidos
- ✅ Validación de campos requeridos
- ✅ Listar propuestas del usuario
- ✅ Obtener detalles de propuesta específica
- ✅ Actualizar propuesta existente
- ✅ Validaciones de negocio (título, palabras clave, etc.)

### Administración (admin.test.js)
- ✅ Listar roles del sistema
- ✅ Crear nuevos usuarios
- ✅ Validación de RUT único
- ✅ Actualizar información de usuarios
- ✅ Listar departamentos
- ✅ Asignar profesores a propuestas
- ✅ Validación de permisos administrativos

### Integración (integration.test.js)
- ✅ Flujo completo: propuesta → asignación → revisión
- ✅ Flujo de reuniones: disponibilidad → solicitud
- ✅ Validación de seguridad entre usuarios
- ✅ Integridad de datos entre módulos

## 🧪 Tecnologías

- **Node.js Test Runner** - Framework nativo de Node.js 18+
- **assert/strict** - Aserciones estrictas
- **fetch API** - Cliente HTTP nativo
- **ES Modules** - Sintaxis moderna de JavaScript

## 📝 Usuarios de Prueba

Los tests utilizan estos usuarios predefinidos:

```javascript
// Admin
email: admin@ubiobio.cl
password: 1234
rol: Admin (3)

// Profesor
email: juan.perez@ubiobio.cl
password: 1234
rol: Profesor (2)

// Estudiante
email: luis.morales@alumnos.ubiobio.cl
password: 1234
rol: Estudiante (1)
```

## ⚠️ Requisitos Previos

1. **Node.js 18+** - Para usar el test runner nativo
2. **MySQL 8.0+** - Base de datos
3. **Servidor corriendo** - La API debe estar ejecutándose en `http://localhost:3000`
4. **Datos iniciales** - Los usuarios de prueba deben existir en la BD

## 🔧 Troubleshooting

### Error: "ECONNREFUSED"
- Verifica que el servidor backend esté corriendo
- Comprueba que el puerto sea el correcto (3000)

### Error: "401 Unauthorized"
- Verifica que los usuarios de prueba existan en la BD
- Comprueba que las contraseñas sean correctas (todas deben ser "1234")

### Error: "Database connection failed"
- Verifica credenciales en `.env.test`
- Asegúrate que la BD `actitubb_test` existe
- Comprueba que MySQL esté corriendo

### Tests fallan por datos existentes
- Limpia la base de datos de prueba:
  ```bash
  mysql -u root -p actitubb_test < backend/src/db/database.sql
  ```
- Recarga los datos iniciales:
  ```bash
  mysql -u root -p actitubb_test < backend/src/db/datos-prueba.sql
  ```

## 📈 Mejoras Futuras

- [ ] Tests de performance con carga
- [ ] Tests de seguridad (SQL injection, XSS)
- [ ] Tests de concurrencia
- [ ] Cobertura de código con c8
- [ ] Tests E2E con Playwright
- [ ] Mocks de servicios externos (email, etc.)
- [ ] Tests de WebSockets (chat, notificaciones)

## 🤝 Contribuir

1. Añade tests para nuevas funcionalidades
2. Mantén la cobertura > 80%
3. Documenta casos edge complejos
4. Usa nombres descriptivos para los tests
5. Agrupa tests relacionados con `describe()`

## 📄 Licencia

Mismo que el proyecto principal - AcTitUBB
