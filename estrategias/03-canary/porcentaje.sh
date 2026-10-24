#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Define qué porcentaje de los usuarios recibe la versión canary.
#   ./estrategias/03-canary/porcentaje.sh 10    → fase 1
#   ./estrategias/03-canary/porcentaje.sh 50    → fase 2
#   ./estrategias/03-canary/porcentaje.sh 100   → todos en la canary
#   ./estrategias/03-canary/porcentaje.sh 0     → ROLLBACK inmediato
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

P="${1:?Indica el porcentaje para la canary (0 a 100)}"
case "$P" in ''|*[!0-9]*) echo "❌ Usa un número entre 0 y 100"; exit 1 ;; esac
[ "$P" -le 100 ] || { echo "❌ Usa un número entre 0 y 100"; exit 1; }

ANTES="$(porcentaje_actual)"

# Seguridad: no mandar usuarios a una canary que no responde.
if [ "$P" -gt 0 ]; then
  if ! docker compose exec -T router wget -qO- http://frontend-canary/api/health >/dev/null 2>&1; then
    echo "❌ La canary no responde. Publícala primero con publicar.sh"
    exit 1
  fi
fi

cp "$PESOS" "$PESOS.bak"
escribir_pesos "$P"
if ! recargar_router; then
  mv "$PESOS.bak" "$PESOS"
  echo "   Se restauró la fase anterior ($ANTES %)."
  exit 1
fi
rm -f "$PESOS.bak"

if [ "$P" -eq 0 ] && [ "$ANTES" -gt 0 ]; then
  echo "↩️  ROLLBACK: canary $ANTES % → 0 %. Todos vuelven a la versión estable."
else
  echo "✅ Canary: $ANTES % → $P %"
fi
echo
mostrar_estado
echo
echo "Mide la distribución con: ./scripts/distribucion.sh"
