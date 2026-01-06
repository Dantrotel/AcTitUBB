# Script de carga masiva de datos para AcTitUBB (Windows PowerShell)
# Ejecuta en orden: seed-data-massive.sql y seed-data-generated.sql

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   CARGA MASIVA DE DATOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Configuración de base de datos
$DB_HOST = "localhost"
$DB_PORT = "3306"
$DB_NAME = "actitubb"
$DB_USER = "root"
$DB_PASS = "1234"

# Rutas de los archivos
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$MASSIVE_SQL = Join-Path $SCRIPT_DIR "seed-data-massive.sql"
$GENERATED_SQL = Join-Path $SCRIPT_DIR "seed-data-generated.sql"

# Verificar que los archivos existen
if (-not (Test-Path $MASSIVE_SQL)) {
    Write-Host "[ERROR] No se encuentra seed-data-massive.sql" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $GENERATED_SQL)) {
    Write-Host "[ERROR] No se encuentra seed-data-generated.sql" -ForegroundColor Red
    exit 1
}

Write-Host "Archivos encontrados:" -ForegroundColor Yellow
Write-Host "  - seed-data-massive.sql"
Write-Host "  - seed-data-generated.sql"
Write-Host ""

# Función para ejecutar SQL usando Docker
function Execute-SQL {
    param (
        [string]$File,
        [string]$Description
    )
    
    Write-Host "Ejecutando: $Description" -ForegroundColor Yellow
    
    # Ejecutar usando Docker con el contenedor correcto
    # PowerShell usa Get-Content con pipe
    Get-Content $File -Raw | docker exec -i actitubb_mysql mysql -u$DB_USER -p$DB_PASS $DB_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $Description completado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[ERROR] Error al ejecutar $Description" -ForegroundColor Red
        return $false
    }
}

# Confirmar ejecución
Write-Host "ADVERTENCIA: Esto insertara datos masivos en la base de datos" -ForegroundColor Yellow
Write-Host "Base de datos: " -NoNewline
Write-Host $DB_NAME -ForegroundColor Green
Write-Host "Host: " -NoNewline
Write-Host "${DB_HOST}:${DB_PORT}" -ForegroundColor Green
Write-Host ""

$confirmation = Read-Host "Deseas continuar? (S/N)"
if ($confirmation -ne 'S' -and $confirmation -ne 's') {
    Write-Host "Operacion cancelada"
    exit 0
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   INICIANDO CARGA DE DATOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Usuarios y estructura
if (-not (Execute-SQL -File $MASSIVE_SQL -Description "Paso 1/2: Usuarios y estructura academica")) {
    Write-Host "[ERROR] Fallo el Paso 1. Abortando." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Propuestas, proyectos y relaciones
if (-not (Execute-SQL -File $GENERATED_SQL -Description "Paso 2/2: Propuestas, proyectos y relaciones")) {
    Write-Host "[ERROR] Fallo el Paso 2. Abortando." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   CARGA COMPLETADA" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar conteos
Write-Host "Verificando conteos..." -ForegroundColor Yellow

$query = @"
SELECT 
    (SELECT COUNT(*) FROM usuarios) AS Usuarios,
    (SELECT COUNT(*) FROM propuestas) AS Propuestas,
    (SELECT COUNT(*) FROM proyectos) AS Proyectos,
    (SELECT COUNT(*) FROM asignaciones_proyectos) AS Asignaciones,
    (SELECT COUNT(*) FROM fechas) AS Fechas,
    (SELECT COUNT(*) FROM solicitudes_reunion) AS Reuniones,
    (SELECT COUNT(*) FROM notificaciones_proyecto) AS Notificaciones;
"@

docker exec actitubb_mysql mysql -u$DB_USER -p$DB_PASS $DB_NAME -e $query

Write-Host ""
Write-Host "[OK] Proceso completado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Puedes iniciar sesion con:"
Write-Host "  - Super Admin: 17654321-0 / admin123"
Write-Host "  - Admin: 18765432-1 / admin123"
Write-Host "  - Profesor: 16111111-1 / profesor123"
Write-Host "  - Estudiante: 20111111-1 / estudiante123"
Write-Host ""
