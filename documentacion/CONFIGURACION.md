##  Configuración Avanzada

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
