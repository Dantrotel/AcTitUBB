# 📊 Datos Ficticios del Sistema de Gestión de Titulación UBB

Este archivo contiene **datos ficticios coherentes** para poblar la base de datos del sistema y poder realizar pruebas completas de todas las funcionalidades.

## ⚠️ IMPORTANTE

Este script **RESPETA los datos iniciales** creados por `database.sql`:
- ✅ **NO elimina** las tablas de configuración (roles, estados)
- ✅ **Solo limpia** tablas de datos de negocio (usuarios, proyectos, etc.)
- ✅ **Compatible** con los datos que el backend crea al iniciar

### Datos Iniciales (creados por database.sql):
- **Roles:** estudiante(1), profesor(2), admin(3), superadmin(4)
- **Estados de Propuestas:** pendiente, en_revision, correcciones, aprobada, rechazada
- **Estados de Proyectos:** 14 estados diferentes

---

## 🚀 Cómo Ejecutar el Script

### ⚡ Prerequisito: Base de Datos Inicializada
**Debes ejecutar primero `database.sql`** si es una base de datos nueva:
```bash
mysql -u root -p actitubb < backend/src/db/database.sql
```

Esto creará todas las tablas y los datos de configuración inicial.

### Opción 1: Desde MySQL Command Line (Recomendado)
```bash
# Primero, asegúrate de tener la BD inicializada
mysql -u root -p actitubb < backend/src/db/database.sql

# Luego, carga los datos ficticios
mysql -u root -p actitubb < backend/scripts/seed-data.sql
```

### Opción 2: Desde MySQL Workbench
1. Abrir MySQL Workbench
2. Conectarse a la base de datos `actitubb`
3. Abrir el archivo `seed-data.sql`
4. Ejecutar el script completo (⚡ Execute)

### Opción 3: Desde la terminal con Docker (si usas Docker)
```bash
docker exec -i mysql_container mysql -u root -ptu_password actitubb < backend/scripts/seed-data.sql
```

---

## 👥 Credenciales de Acceso

> **Nota:** Todas las contraseñas están hasheadas con bcrypt. Los valores originales son los siguientes:

### 🔴 Super Admin
- **RUT:** 11111111-1
- **Nombre:** Carlos Rodríguez Silva
- **Email:** admin@ubiobio.cl
- **Contraseña:** `Admin123!`
- **Rol:** Super Admin (ID 4)

---

### 🟠 Administradores
1. **María González López**
   - **RUT:** 22222222-2
   - **Email:** admin2@ubiobio.cl
   - **Contraseña:** `Admin123!`
   - **Rol:** Admin (ID 3)

2. **Pedro Martínez Fernández**
   - **RUT:** 33333333-3
   - **Email:** admin3@ubiobio.cl
   - **Contraseña:** `Admin123!`
   - **Rol:** Admin (ID 3)

---

### 🟢 Profesores
1. **Roberto Sánchez Castro**
   - **RUT:** 12345678-9
   - **Email:** rsanchez@ubiobio.cl
   - **Contraseña:** `Profe123!`
   - **Especialidad:** Inteligencia Artificial
   - **Proyectos:** Guía del Sistema de Inventario ML

2. **Ana Ramírez Torres**
   - **RUT:** 23456789-0
   - **Email:** aramirez@ubiobio.cl
   - **Contraseña:** `Profe123!`
   - **Especialidad:** Desarrollo Web
   - **Proyectos:** Guía de Plataforma E-Learning

3. **Luis Pérez Morales**
   - **RUT:** 34567890-1
   - **Email:** lperez@ubiobio.cl
   - **Contraseña:** `Profe123!`
   - **Especialidad:** Bases de Datos
   - **Proyectos:** Guía de App Telemedicina

4. **Carmen Vargas Díaz**
   - **RUT:** 45678901-2
   - **Email:** cvargas@ubiobio.cl
   - **Contraseña:** `Profe123!`
   - **Especialidad:** Ciberseguridad

5. **Jorge Muñoz Rojas**
   - **RUT:** 56789012-3
   - **Email:** jmunoz@ubiobio.cl
   - **Contraseña:** `Profe123!`
   - **Especialidad:** Redes de Computadores
   - **Proyectos:** Guía de Sistema IoT Ambiental

---

### 🔵 Estudiantes

#### Con Proyectos Activos:
1. **Sebastián Flores Gutiérrez**
   - **RUT:** 19876543-2
   - **Email:** sflores2019@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Proyecto:** Sistema de Gestión de Inventario con ML
   - **Profesor Guía:** Roberto Sánchez

2. **Valentina Ortiz Núñez**
   - **RUT:** 19876543-3
   - **Email:** vortiz2019@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Proyecto:** Plataforma de E-Learning Adaptativo
   - **Profesor Guía:** Ana Ramírez

3. **Diego Castro Bravo**
   - **RUT:** 20123456-7
   - **Email:** dcastro2020@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Proyecto:** App Móvil de Telemedicina
   - **Profesor Guía:** Luis Pérez

4. **Camila Reyes Soto**
   - **RUT:** 20234567-8
   - **Email:** creyes2020@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Proyecto:** Sistema de Monitoreo Ambiental IoT
   - **Profesor Guía:** Jorge Muñoz

#### Con Propuestas en Revisión:
5. **Matías Silva Pinto**
   - **RUT:** 20345678-9
   - **Email:** msilva2020@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Propuesta:** Blockchain para Trazabilidad Agrícola (En revisión)

6. **Francisca Morales Herrera**
   - **RUT:** 20456789-0
   - **Email:** fmorales2020@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Propuesta:** Asistente Virtual con NLP (En revisión)

#### Con Propuestas Pendientes:
7. **Nicolás Vega Contreras**
   - **RUT:** 21123456-7
   - **Email:** nvega2021@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Propuesta:** Sistema de Gestión de Torneos (Pendiente)

8. **Sofía Campos Valdés**
   - **RUT:** 21234567-8
   - **Email:** scampos2021@egresados.ubiobio.cl
   - **Contraseña:** `Estudiante123!`
   - **Propuesta:** Marketplace de Servicios (Pendiente)

#### Sin Propuestas:
9. **Benjamín Riquelme Espinoza** - 21345678-9
10. **Martina Fuentes Cortés** - 21456789-0

---

## 🏢 Entidades Externas

1. **TechSolutions SpA**
   - Desarrollo de Software
   - 2 colaboradores asignados

2. **DataAnalytics Chile**
   - Análisis de Datos y Machine Learning
   - 2 colaboradores asignados

3. **Fundación Innovación Social**
   - ONG de Tecnología Social
   - 1 colaborador asignado

4. **CloudServices SA**
   - Cloud Computing y DevOps
   - 2 colaboradores asignados

5. **Universidad del Bío-Bío**
   - Institución Académica
   - Sin colaboradores asignados

6. **CyberSecure Chile**
   - Ciberseguridad
   - 1 colaborador asignado

7. **GobiernoBíoBío**
   - Gobierno Regional
   - 1 colaboradora asignada

8. **StartupHub Concepción**
   - Incubadora de Startups
   - 1 colaborador asignado

---

## 👔 Colaboradores Externos

Total: **9 colaboradores** distribuidos en las entidades

- **Supervisores:** Fernando Campos (TechSolutions), Marcelo Torres (Fundación)
- **Mentores:** Ricardo Soto (DataAnalytics), Claudia Contreras (GobiernoBíoBío), Pablo Reyes (StartupHub)
- **Asesores:** Patricia Muñoz, Elena Rojas, Andrea Silva, Cristian Vega
- **Revisor:** Rodrigo Espinoza (CyberSecure)

---

## 📋 Proyectos y Propuestas

### Proyectos Activos (4):
1. ✅ **Sistema de Gestión de Inventario con ML** - Sebastián Flores
2. ✅ **Plataforma de E-Learning Adaptativo** - Valentina Ortiz
3. ✅ **App Móvil de Telemedicina** - Diego Castro
4. ✅ **Sistema de Monitoreo Ambiental IoT** - Camila Reyes

### Propuestas en Revisión (2):
5. 🔄 **Blockchain para Trazabilidad Agrícola** - Matías Silva
6. 🔄 **Asistente Virtual con NLP** - Francisca Morales

### Propuestas Pendientes (2):
7. ⏳ **Sistema de Gestión de Torneos** - Nicolás Vega
8. ⏳ **Marketplace de Servicios** - Sofía Campos

---

## 📅 Fechas Importantes

Cada proyecto tiene múltiples fechas importantes:
- **Entregas** (Capítulos, prototipos, informes)
- **Reuniones** de seguimiento
- **Hitos** importantes (defensas, pilotos)
- **Revisiones** técnicas

Total: **19 fechas importantes** distribuidas en los 4 proyectos activos.

---

## 🤝 Reuniones

### Sistema de Reservas:
- **Disponibilidad horaria** configurada para los 5 profesores
- Horarios distribuidos en días y modalidades (presencial/virtual)

### Solicitudes de Reunión:
- **3 reuniones realizadas** (historial)
- **2 reuniones confirmadas** (próximas)
- **2 reuniones pendientes** (esperando confirmación)

---

## 💬 Chat y Notificaciones

### Mensajes:
- Conversaciones reales entre estudiantes y profesores
- Contexto sobre proyectos específicos
- **Total: 12 mensajes**

### Notificaciones:
- Fechas importantes próximas
- Reuniones confirmadas
- Mensajes nuevos
- Asignaciones de colaboradores
- **Total: 10 notificaciones**

---

## 🎯 Casos de Uso Cubiertos

Con estos datos ficticios puedes probar:

### Como Estudiante:
- ✅ Ver proyecto asignado con toda su información
- ✅ Ver fechas importantes y plazos
- ✅ Solicitar reuniones con profesores
- ✅ Chatear con profesores
- ✅ Recibir notificaciones
- ✅ Ver profesores asignados (guía, informante, colaborador externo)
- ✅ Enviar propuestas
- ✅ Ver estado de propuestas

### Como Profesor:
- ✅ Ver proyectos asignados
- ✅ Gestionar fechas importantes
- ✅ Revisar propuestas
- ✅ Configurar disponibilidad horaria
- ✅ Gestionar solicitudes de reunión
- ✅ Chatear con estudiantes
- ✅ Ver reportes y métricas
- ✅ Asignar colaboradores externos

### Como Admin:
- ✅ Gestionar usuarios (profesores, estudiantes)
- ✅ Gestionar entidades externas
- ✅ Gestionar colaboradores externos
- ✅ Ver todas las propuestas y proyectos
- ✅ Asignar profesores a propuestas/proyectos
- ✅ Configuración del sistema

---

## ⚠️ Notas Importantes

1. **Compatibilidad con Datos Iniciales:**
   - ✅ El script respeta los datos de `database.sql` (roles, estados)
   - ✅ Solo limpia tablas de datos de negocio (usuarios, proyectos, etc.)
   - ✅ Puedes ejecutarlo múltiples veces sin problemas
   - ✅ **NO necesitas** volver a ejecutar `database.sql` cada vez

2. **Contraseñas:** Todas las contraseñas están hasheadas con bcrypt. Los valores en texto plano son solo para pruebas.

3. **Coherencia de Datos:** Todos los datos están relacionados coherentemente:
   - Los proyectos provienen de propuestas aprobadas (estado_id = 4)
   - Los profesores asignados a proyectos revisaron las propuestas originales
   - Las fechas importantes son progresivas y lógicas
   - Las reuniones están dentro de las disponibilidades de los profesores
   - Los estados usan los IDs correctos de `estados_propuestas` y `estados_proyectos`

4. **Datos Temporales:** Las fechas usan funciones relativas (`NOW()`, `DATE_ADD()`, `DATE_SUB()`) para que siempre sean coherentes sin importar cuándo ejecutes el script.

5. **Estados Usados en los Datos:**
   - **Propuestas aprobadas:** estado_id = 4 (aprobada)
   - **Propuestas en revisión:** estado_id = 2 (en_revision)
   - **Propuestas pendientes:** estado_id = 1 (pendiente)
   - **Proyectos activos:** estado_id = 1 (esperando_asignacion_profesores) o 2 (en_desarrollo)

---

## 🔧 Troubleshooting

### Error: "Cannot delete or update a parent row"
- Asegúrate de que `SET FOREIGN_KEY_CHECKS = 0;` se ejecute al inicio

### Error: "Duplicate entry"
- El script limpia todas las tablas primero. Si aún da error, ejecuta manualmente:
```sql
TRUNCATE TABLE nombre_tabla;
```

### Las contraseñas no funcionan
- Verifica que los hashes bcrypt en el script coincidan con el algoritmo usado en el backend
- Las contraseñas en texto plano son: `Admin123!`, `Profe123!`, `Estudiante123!`

---

## 📞 Soporte

Si encuentras algún problema con los datos ficticios, verifica:
1. Que la estructura de la base de datos esté actualizada (`database.sql`)
2. Que todas las tablas existan
3. Que no haya restricciones adicionales que impidan la inserción

---

**¡Listo para probar el sistema completo! 🎉**

