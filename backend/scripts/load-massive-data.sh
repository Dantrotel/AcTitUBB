#!/bin/bash

# Script de carga masiva de datos para AcTitUBB
# Ejecuta en orden: seed-data-massive.sql y seed-data-generated.sql

echo "=================================="
echo "   CARGA MASIVA DE DATOS"
echo "=================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración de base de datos
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="actitubb_db"
DB_USER="root"
DB_PASS="rootpassword"

# Rutas de los archivos
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MASSIVE_SQL="${SCRIPT_DIR}/seed-data-massive.sql"
GENERATED_SQL="${SCRIPT_DIR}/seed-data-generated.sql"

# Verificar que los archivos existen
if [ ! -f "$MASSIVE_SQL" ]; then
    echo -e "${RED}❌ Error: No se encuentra seed-data-massive.sql${NC}"
    exit 1
fi

if [ ! -f "$GENERATED_SQL" ]; then
    echo -e "${RED}❌ Error: No se encuentra seed-data-generated.sql${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Archivos encontrados:${NC}"
echo "  - seed-data-massive.sql"
echo "  - seed-data-generated.sql"
echo ""

# Función para ejecutar SQL
execute_sql() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}⏳ Ejecutando: $description${NC}"
    
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $description completado${NC}"
        return 0
    else
        echo -e "${RED}❌ Error al ejecutar $description${NC}"
        return 1
    fi
}

# Confirmar ejecución
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto insertará datos masivos en la base de datos${NC}"
echo -e "Base de datos: ${GREEN}$DB_NAME${NC}"
echo -e "Host: ${GREEN}$DB_HOST:$DB_PORT${NC}"
echo ""
read -p "¿Deseas continuar? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo "=================================="
echo "   INICIANDO CARGA DE DATOS"
echo "=================================="
echo ""

# Paso 1: Usuarios y estructura
execute_sql "$MASSIVE_SQL" "Paso 1/2: Usuarios y estructura académica"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falló el Paso 1. Abortando.${NC}"
    exit 1
fi

echo ""

# Paso 2: Propuestas, proyectos y relaciones
execute_sql "$GENERATED_SQL" "Paso 2/2: Propuestas, proyectos y relaciones"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falló el Paso 2. Abortando.${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo "   CARGA COMPLETADA"
echo "=================================="
echo ""

# Verificar conteos
echo -e "${YELLOW}📊 Verificando conteos...${NC}"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
SELECT 
    (SELECT COUNT(*) FROM usuarios) AS Usuarios,
    (SELECT COUNT(*) FROM propuestas) AS Propuestas,
    (SELECT COUNT(*) FROM proyectos) AS Proyectos,
    (SELECT COUNT(*) FROM asignaciones_proyectos) AS Asignaciones,
    (SELECT COUNT(*) FROM fechas) AS Fechas,
    (SELECT COUNT(*) FROM solicitudes_reunion) AS Reuniones,
    (SELECT COUNT(*) FROM notificaciones_proyecto) AS Notificaciones;
EOF

echo ""
echo -e "${GREEN}✅ Proceso completado exitosamente${NC}"
echo ""
echo "Puedes iniciar sesión con:"
echo "  - Super Admin: 17654321-0 / admin123"
echo "  - Admin: 18765432-1 / admin123"
echo "  - Profesor: 16111111-1 / profesor123"
echo "  - Estudiante: 20111111-1 / estudiante123"
echo ""
