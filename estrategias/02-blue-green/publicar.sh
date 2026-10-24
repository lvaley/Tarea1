#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Publica una versión NUEVA en el entorno INACTIVO.
# Los usuarios no se enteran: producción sigue igual. La nueva versión
# se puede probar en http://localhost:8082 antes de hacer el cambio.
#
# Uso: ./estrategias/02-blue-green/publicar.sh 2.0.0
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

VERSION="${1:?Indica la versión a publicar, por ejemplo 2.0.0}"
DESTINO="$(entorno_inactivo)"

echo "Producción (sin cambios): $(entorno_activo)"
echo "▶ Publicando $VERSION en el entorno INACTIVO: $DESTINO"

if [ "$DESTINO" = blue ]; then
  BLUE_TAG="$VERSION"  docker compose up -d --wait backend-blue  frontend-blue
else
  GREEN_TAG="$VERSION" docker compose up -d --wait backend-green frontend-green
fi

echo
mostrar_estado
echo
echo "Prueba de la versión nueva (puerto 8082):"
curl -si http://localhost:8082/api/health | grep -iE "^HTTP|x-app-version|x-entorno|database"
echo
echo "Si todo está bien, cambia el tráfico con: ./estrategias/02-blue-green/cambiar.sh"
