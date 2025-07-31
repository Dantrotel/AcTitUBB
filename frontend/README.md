# 🎓 AcTitUBB Frontend

Interfaz de usuario moderna y responsive para el Sistema de Gestión de Títulos de Grado de la Universidad del Bío-Bío.

## 🛠️ Tecnologías

- **Angular** 18+ con Standalone Components
- **TypeScript** 5+
- **SCSS** para estilos
- **Angular Material** (opcional)
- **Vite** como build tool

## 🏗️ Arquitectura del Frontend

```
src/app/
├── 📂 pages/                    # Páginas organizadas por rol
│   ├── 📂 estudiante/           # Módulo del estudiante
│   │   └── home/                # Dashboard del estudiante
│   ├── 📂 profesor/             # Módulo del profesor
│   │   └── home-profesor/       # Dashboard del profesor
│   ├── 📂 admin/                # Módulo del administrador
│   │   ├── gestion-usuarios/    # Gestión de usuarios
│   │   ├── gestion-profesores/  # Gestión de profesores
│   │   ├── gestion-propuestas/  # Gestión de propuestas
│   │   ├── gestion-calendario/  # Gestión del calendario
│   │   └── asignaciones/        # Asignaciones
│   ├── 📂 propuestas/           # Gestión de propuestas
│   │   ├── crear-propuesta/     # Crear nueva propuesta
│   │   ├── editar-propuesta/    # Editar propuesta existente
│   │   ├── lista-propuestas/    # Lista de propuestas
│   │   ├── ver-detalle/         # Detalle de propuesta
│   │   └── revisar-propuesta/   # Revisar propuesta (profesor)
│   ├── 📂 login/                # Autenticación
│   └── 📂 register/             # Registro de usuarios
├── 📂 services/                 # Servicios de Angular
│   └── api.ts                   # Servicio principal de API
├── 📂 guards/                   # Guards de autenticación
│   └── auth.guard.ts            # Guard de autenticación
└── 📂 components/               # Componentes reutilizables
    └── calendar-modal/          # Modal del calendario
```

## 🚀 Desarrollo Local

### Instalación
```bash
npm install
```

### Servidor de desarrollo
```bash
ng serve
```
La aplicación estará disponible en `http://localhost:4200/`

### Build para producción
```bash
ng build --configuration=production
```

### Build con Docker
```bash
docker build -t actitubb-frontend .
docker run -p 80:80 actitubb-frontend
```

## ⚙️ Configuración

### Variables de entorno
Modifica estos archivos para diferentes entornos:

**Desarrollo local:**
- `src/app/services/api.ts` (línea 9): 
  ```typescript
  private baseUrl = 'http://localhost:3000/api/v1';
  ```

**Producción:**
- `src/app/services/api.ts` (línea 9):
  ```typescript
  private baseUrl = 'http://TU_IP_SERVIDOR:3000/api/v1';
  ```

### Angular Configuration
- **Angular budgets**: Configurados en `angular.json` para aplicaciones grandes
- **Build optimization**: Configurado para producción
- **Asset management**: Recursos estáticos en `public/`

## 🧪 Testing

### Tests unitarios
```bash
ng test
```

### Tests e2e
```bash
ng e2e
```

### Linting
```bash
ng lint
```

## 📦 Build y Deployment

### Build con optimizaciones
```bash
# Build de producción
ng build --configuration=production

# Analizar el bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/frontend/stats.json
```

### Docker Deploy
```bash
# Build de la imagen
docker build -t actitubb-frontend .

# Deploy con Nginx
docker run -d -p 80:80 actitubb-frontend
```

## 🎨 Estructura de Estilos

- **Estilos globales**: `src/styles.scss`
- **Estilos por componente**: Cada componente tiene su `.scss`
- **Variables**: Definidas en cada componente según necesidad
- **Responsive**: Mobile-first approach

## 🔧 Configuración de Nginx

El frontend se sirve a través de Nginx con:
- Compresión gzip
- Cache headers optimizados
- Proxy para API del backend
- Fallback para rutas de Angular (SPA)

Configuración en: `nginx.conf`

## 📱 Características

### Por Rol de Usuario:

**🎓 Estudiante:**
- Dashboard personalizado
- Crear y editar propuestas
- Subir archivos
- Ver comentarios de profesores
- Calendario de fechas importantes

**👨‍🏫 Profesor:**
- Dashboard de propuestas asignadas
- Revisar y comentar propuestas
- Gestionar múltiples estudiantes
- Crear fechas específicas

**🏛️ Administrador:**
- Gestión completa de usuarios
- Asignación de profesores
- Administración del calendario
- Vista general del sistema

## 🐛 Troubleshooting

### Error de CORS
Si ves errores de CORS, verifica:
1. La URL del backend en `api.ts`
2. La configuración CORS del backend
3. Que ambos servicios estén corriendo

### Error de build
Si el build falla por tamaño:
```bash
# Los budgets ya están configurados en angular.json
# Si necesitas ajustarlos más:
ng build --configuration=production --optimization=false
```

### Problemas de permisos
```bash
# En desarrollo
sudo chown -R $USER:$GROUP node_modules/
npm install
```

---

**📧 Contacto**: [daniel.aguayo@alumnos.ubiobio.cl](mailto:daniel.aguayo@alumnos.ubiobio.cl)  
**🏫 Universidad del Bío-Bío** - 2025
