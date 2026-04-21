##  Troubleshooting Avanzado

### Problemas Comunes y Soluciones

<details>
<summary><strong> Error: "JWT token expired" o "Invalid token"</strong></summary>

**Problema**: Token de autenticación expirado o inválido.

**Solución**:
```bash
# Limpiar localStorage del navegador
localStorage.clear();

# O reiniciar sesión
# El sistema automáticamente redirige al login
```

**Prevención**: El token se renueva automáticamente en el interceptor.
</details>

<details>
<summary><strong> Error: "File upload failed" o "File too large"</strong></summary>

**Problema**: Error en subida de archivos.

**Causa común**: Archivo excede 10MB o formato no permitido.

**Solución**:
```bash
# Verificar configuración en backend/.env
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Reiniciar backend si se cambió configuración
docker-compose restart backend
```
</details>

<details>
<summary><strong> Error: "Email notification failed"</strong></summary>

**Problema**: Las notificaciones por email no funcionan.

**Solución**:
```bash
# Verificar configuración de email en backend/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_aplicacion  # No la contraseña normal

# Para Gmail, habilitar "Contraseñas de aplicación"
# Google Account > Security > 2-Step Verification > App passwords
```
</details>

<details>
<summary><strong> Error: "Docker container keeps restarting"</strong></summary>

**Problema**: Contenedores en loop de reinicio.

**Diagnóstico**:
```bash
# Ver logs detallados
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Verificar estado de contenedores
docker-compose ps

# Verificar recursos del sistema
docker system df
docker system prune  # Limpiar si es necesario
```

**Solución común**:
```bash
# Reinicio completo
docker-compose down -v
docker-compose up --build

# Si persiste, verificar recursos disponibles
# MySQL necesita al menos 512MB RAM
```
</details>

<details>
<summary><strong> Error: "Responsive design issues"</strong></summary>

**Problema**: Interfaz no se ve bien en móviles.

**Verificación**:
```bash
# El CSS ya incluye media queries para:
# - Móviles: < 768px
# - Tablets: 768px - 1024px  
# - Desktop: > 1024px

# Verificar en DevTools del navegador
# F12 > Toggle device toolbar
```

**Solución**: Los estilos responsive están implementados en cada componente.
</details>

### Comandos de Mantenimiento

```bash
# ============================================
# MANTENIMIENTO DE LA BASE DE DATOS
# ============================================

# Backup de la base de datos
docker exec mysql_container mysqldump -u actitubb_user -p actitubb > backup.sql

# Restaurar backup
docker exec -i mysql_container mysql -u actitubb_user -p actitubb < backup.sql

# ============================================
# LIMPIEZA DEL SISTEMA
# ============================================

# Limpiar Docker
docker system prune -a              # Eliminar contenedores/imágenes no usadas
docker volume prune                 # Eliminar volúmenes no usados

# Limpiar logs
docker-compose logs --tail=0 -f     # Ver solo logs nuevos

# ============================================
# MONITOREO
# ============================================

# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f --tail=100

# Verificar salud de servicios
docker-compose ps
```

### Logs y Debugging

```bash
# Backend logs
docker-compose logs backend | grep ERROR
docker-compose logs backend | grep -i "auth\|jwt\|token"

# Frontend logs  
docker-compose logs frontend | grep -i "error\|warning"

# MySQL logs
docker-compose logs mysql | grep -i "error\|warning"

# Logs específicos por timestamp
docker-compose logs --since="2024-01-01T00:00:00" backend
```
