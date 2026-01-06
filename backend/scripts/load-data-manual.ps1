# Script simplificado para cargar datos sin Docker
# Requiere que mysql.exe esté instalado y en el PATH

$DB_HOST = "localhost"
$DB_PORT = "3306"
$DB_NAME = "actitubb"
$DB_USER = "root"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   CARGA MANUAL DE DATOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar password
$DB_PASS = Read-Host "Ingresa la password de MySQL root" -AsSecureString
$DB_PASS_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASS))

Write-Host ""
Write-Host "Ejecutando seed-data-massive.sql..." -ForegroundColor Yellow

# Ejecutar archivos SQL
& mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS_Plain $DB_NAME -e "SOURCE $PSScriptRoot/seed-data-massive.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] seed-data-massive.sql completado" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Fallo en seed-data-massive.sql" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Ejecutando seed-data-generated.sql..." -ForegroundColor Yellow

& mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS_Plain $DB_NAME -e "SOURCE $PSScriptRoot/seed-data-generated.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] seed-data-generated.sql completado" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Fallo en seed-data-generated.sql" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Proceso completado" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales de prueba:"
Write-Host "  - Super Admin: 17654321-0 / admin123"
Write-Host "  - Admin: 18765432-1 / admin123"
Write-Host ""
