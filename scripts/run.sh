#!/bin/bash
# IntelliStock - Inicio rápido
# =============================
# Uso: ./run.sh
#
# Este script configura e inicia el backend Django y el frontend Next.js.

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
PYTHON="${PYTHON:-python3}"

echo "========================================"
echo "  IntelliStock - Iniciando servicios"
echo "========================================"

# ─── 1. Verificar PostgreSQL ─────────────────────────────────
echo ""
echo "[1/5] Verificando PostgreSQL..."
if command -v pg_isready &>/dev/null; then
    pg_isready -q && echo "  PostgreSQL OK" || {
        echo "  PostgreSQL no está corriendo. Intenta: sudo service postgresql start"
        exit 1
    }
else
    echo "  PostgreSQL no encontrado. Instálalo: sudo apt install postgresql"
    exit 1
fi

# Crear BD si no existe (usando el usuario intellistock si ya existe)
python3 -c "
import subprocess, sys
try:
    subprocess.run(['psql', '-U', 'intellistock', '-h', 'localhost', '-d', 'intellistock', '-c', 'SELECT 1'],
        capture_output=True, env={**__import__('os').environ, 'PGPASSWORD': 'intellistock123'})
    print('  Base de datos intellistock OK')
except:
    print('  Base de datos no encontrada. Crea la BD manualmente:')
    print('    sudo -u postgres psql -c \"CREATE USER intellistock WITH PASSWORD \\\"intellistock123\\\";\"')
    print('    sudo -u postgres psql -c \"CREATE DATABASE intellistock OWNER intellistock;\"')
    sys.exit(1)
"

# ─── 2. Instalar dependencias ────────────────────────────────
echo ""
echo "[2/5] Instalando dependencias del backend..."
pip3 install --break-system-packages -r "$BACKEND_DIR/requirements.txt" -q 2>/dev/null || \
pip3 install --user -r "$BACKEND_DIR/requirements.txt" -q 2>/dev/null || \
pip3 install -r "$BACKEND_DIR/requirements.txt" -q
echo "  Dependencias instaladas"

echo ""
echo "[3/5] Instalando dependencias del frontend..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    (cd "$FRONTEND_DIR" && npm install --silent 2>/dev/null) || echo "  npm install falló (continúa...)"
fi

# ─── 3. Migraciones y datos de ejemplo ───────────────────────
echo ""
echo "[4/5] Configurando base de datos..."
cd "$BACKEND_DIR"
$PYTHON manage.py migrate --verbosity 0 2>&1
$PYTHON manage.py seed_data 2>&1
cd "$PROJECT_DIR"

# ─── 4. Iniciar servicios ────────────────────────────────────
echo ""
echo "[5/5] Iniciando servicios..."
echo ""

cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $DJANGO_PID $NEXT_PID 2>/dev/null || true
    wait $DJANGO_PID $NEXT_PID 2>/dev/null || true
    echo "Servicios detenidos."
}
trap cleanup EXIT INT TERM

# Backend Django
$PYTHON "$BACKEND_DIR/manage.py" runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Frontend Next.js
(cd "$FRONTEND_DIR" && npm run dev) &
NEXT_PID=$!

echo "========================================"
echo "  Servicios corriendo"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000/api/"
echo "  Admin:     http://localhost:8000/admin/"
echo ""
echo "  Credenciales:"
echo "    Email: admin@intellistock.com"
echo "    Pass:  admin123"
echo ""
echo "  Presiona Ctrl+C para detener todo"
echo "========================================"
wait
