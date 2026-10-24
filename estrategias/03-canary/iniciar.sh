#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Punto de partida: solo la versión ESTABLE, con el 100 % del tráfico.
# Uso: ./estrategias/03-canary/iniciar.sh [versión]   (por defecto 1.0.0)
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

VERSION="${1:-1.0.0}"
echo "▶ Versión estable: $VERSION (canary al 0 %)"
escribir_pesos 0

ESTABLE_TAG="$VERSION" docker compose up -d --wait backend-estable frontend-estable router

echo
mostrar_estado
