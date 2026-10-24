#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Cierre del canary: la versión canary pasa a ser la ESTABLE y los
# contenedores canary se apagan. Requiere estar al 100 %, así nadie
# queda sin servicio mientras se actualiza la estable.
# Uso: ./estrategias/03-canary/promover.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

[ "$(porcentaje_actual)" -eq 100 ] || {
  echo "❌ Primero lleva la canary al 100 %: ./estrategias/03-canary/porcentaje.sh 100"
  exit 1
}

NUEVA="$(version_de canary)"
echo "▶ [1/3] Actualizando la estable a $NUEVA (los usuarios siguen en la canary)"
ESTABLE_TAG="$NUEVA" docker compose up -d --wait backend-estable frontend-estable

echo "▶ [2/3] Devolviendo el 100 % del tráfico a la estable"
escribir_pesos 0
recargar_router

echo "▶ [3/3] Apagando los contenedores canary"
docker compose stop frontend-canary backend-canary
docker compose rm -f frontend-canary backend-canary >/dev/null

echo
echo "✅ $NUEVA es ahora la versión estable."
mostrar_estado
