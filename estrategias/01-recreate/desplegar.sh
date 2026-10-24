#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Despliegue RECREATE: detiene la versión actual y levanta la nueva.
#
# Uso (desde cualquier carpeta):
#   ./estrategias/01-recreate/desplegar.sh 1.0.0   → primer despliegue
#   ./estrategias/01-recreate/desplegar.sh 2.0.0   → actualización
#   ./estrategias/01-recreate/desplegar.sh 1.0.0   → rollback (también con caída)
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

NUEVA="${1:?Indica la versión a desplegar: 1.0.0 o 2.0.0}"
ahora() { perl -MTime::HiRes=time -e 'printf "%.3f", time'; }

ACTUAL="$(docker compose ps --format '{{.Image}}' frontend 2>/dev/null | sed 's/.*://' || true)"
echo "Versión actual : ${ACTUAL:-ninguna}"
echo "Versión nueva  : $NUEVA"
echo

inicio="$(ahora)"

echo "[1/2] Deteniendo y eliminando la versión actual..."
docker compose down

echo "[2/2] Iniciando la versión $NUEVA (espera a que esté healthy)..."
APP_TAG="$NUEVA" docker compose up -d --wait

fin="$(ahora)"
echo
echo "✅ Despliegue terminado en $(awk -v a="$fin" -v b="$inicio" 'BEGIN{printf "%.2f", a-b}') s"
echo "   (durante ese tiempo la tienda NO estuvo disponible)"
echo
docker compose ps
echo
curl -s http://localhost:8080/version.json
