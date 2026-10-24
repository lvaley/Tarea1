#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Levanta la versión NUEVA como canary. Todavía no recibe usuarios (0 %),
# solo se puede probar a propósito con la cabecera "X-Canary: siempre".
# Uso: ./estrategias/03-canary/publicar.sh 2.0.0
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

VERSION="${1:?Indica la versión canary, por ejemplo 2.0.0}"
echo "▶ Publicando $VERSION como canary (sin tráfico de usuarios todavía)"

CANARY_TAG="$VERSION" docker compose up -d --wait backend-canary frontend-canary

echo
mostrar_estado
echo
echo "Prueba interna forzando la canary:"
curl -si -H "X-Canary: siempre" http://localhost:8083/api/health | grep -iE "^HTTP|x-app-version|x-grupo|database"
echo
echo "Siguiente fase: ./estrategias/03-canary/porcentaje.sh 10"
