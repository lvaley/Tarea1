#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Cambia el tráfico de producción al otro entorno (blue ⇄ green).
# Se ejecuta igual para el cambio y para el ROLLBACK.
#
# Uso: ./estrategias/02-blue-green/cambiar.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

ANTES="$(entorno_activo)"
DESPUES="$(entorno_inactivo)"

echo "Producción actual: $ANTES ($(version_de "$ANTES"))"
echo "Nuevo destino    : $DESPUES ($(version_de "$DESPUES"))"
echo

# 1) Seguridad: no mandar usuarios a un entorno que no responde.
echo "[1/3] Verificando que $DESPUES responde..."
if ! docker compose exec -T router wget -qO- "http://frontend-$DESPUES/api/health" >/dev/null 2>&1; then
  echo "❌ $DESPUES no responde. Cambio CANCELADO; producción sigue en $ANTES."
  exit 1
fi
echo "      ✔ $DESPUES está sano"

# 2) Cambiar el destino y validar la configuración de Nginx.
echo "[2/3] Apuntando producción a $DESPUES..."
cp "$DESTINOS" "$DESTINOS.bak"
escribir_destinos "$DESPUES"
if ! docker compose exec -T router nginx -t >/dev/null 2>&1; then
  mv "$DESTINOS.bak" "$DESTINOS"
  echo "❌ Configuración inválida. Se restauró la anterior."
  exit 1
fi
rm -f "$DESTINOS.bak"

# 3) Recargar Nginx: las conexiones abiertas terminan normalmente
#    y las nuevas ya van al otro entorno → sin tiempo sin servicio.
echo "[3/3] Recargando el router (sin cortar conexiones)..."
docker compose exec -T router nginx -s reload >/dev/null 2>&1
sleep 1

echo
echo "✅ Tráfico cambiado: $ANTES → $DESPUES"
mostrar_estado
echo
curl -si http://localhost:8081/version.json | grep -iE "^HTTP|x-app-version|x-entorno|version"
echo
echo "La versión anterior sigue corriendo en $ANTES (rollback: vuelve a ejecutar cambiar.sh)."
