#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Punto de partida: entorno BLUE en producción con la versión indicada.
# Uso: ./estrategias/02-blue-green/iniciar.sh [versión]   (por defecto 1.0.0)
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

VERSION="${1:-1.0.0}"

echo "▶ Blue será producción con la versión $VERSION"
escribir_destinos blue

BLUE_TAG="$VERSION" docker compose up -d --wait backend-blue frontend-blue router

echo
mostrar_estado
echo
curl -si http://localhost:8081/version.json | grep -iE "^HTTP|x-app-version|x-entorno|version"
