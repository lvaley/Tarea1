#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Construye las imágenes Docker de Neko Coffee con su etiqueta de versión.
#
#   Versión 1.0.0  ←  Tarea1-Tarea4  (backend + CRUD)
#   Versión 2.0.0  ←  Tarea1-Tarea5  (+ seguridad JWT con expiración)
#
# Uso (desde la carpeta Tarea6):
#   ./scripts/build.sh            → construye las dos versiones
#   ./scripts/build.sh 2.0.0      → construye solo la 2.0.0
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# Siempre trabajar desde la raíz de Tarea6, aunque se llame desde otra carpeta.
cd "$(dirname "$0")/.."

# Qué carpeta de código corresponde a cada versión.
carpeta_de() {
  case "$1" in
    1.0.0) echo "Tarea1-Tarea4" ;;
    2.0.0) echo "Tarea1-Tarea5" ;;
    *) return 1 ;;
  esac
}

construir() {
  local version="$1" carpeta
  carpeta="$(carpeta_de "$version")" || {
    echo "❌ Versión desconocida: $version (usa 1.0.0 o 2.0.0)"
    exit 1
  }

  echo
  echo "════════ Versión $version  (código: $carpeta) ════════"

  echo "▶ Backend  → neko-backend:$version"
  docker build \
    -f deploy/backend.Dockerfile \
    --build-arg APP_VERSION="$version" \
    -t "neko-backend:$version" \
    "$carpeta/backend"

  echo "▶ Frontend → neko-frontend:$version"
  docker build \
    -f deploy/frontend.Dockerfile \
    --build-context config=deploy/nginx \
    --build-arg APP_VERSION="$version" \
    -t "neko-frontend:$version" \
    "$carpeta"
}

# Sin argumentos se construyen las dos versiones.
if [ "$#" -eq 0 ]; then
  set -- 1.0.0 2.0.0
fi

for version in "$@"; do
  construir "$version"
done

echo
echo "✅ Imágenes disponibles:"
docker images --filter "reference=neko-*" \
  --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}"
