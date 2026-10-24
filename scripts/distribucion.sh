#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Envía N peticiones (sin cookies, como N visitantes distintos) y cuenta
# qué versión atendió cada una. Sirve para comprobar el reparto del Canary.
#
# Uso: ./scripts/distribucion.sh [URL] [N]
#      ./scripts/distribucion.sh http://localhost:8083/api/health 200
# ─────────────────────────────────────────────────────────────
URL="${1:-http://localhost:8083/api/health}"
N="${2:-200}"

echo "Enviando $N peticiones a $URL ..."
for _ in $(seq 1 "$N"); do
  salida="$(curl -s -m 2 -o /dev/null -D - -w 'CODIGO=%{http_code}' "$URL" 2>/dev/null)"
  codigo="$(printf '%s' "$salida" | sed -n 's/.*CODIGO=//p')"
  version="$(printf '%s' "$salida" | awk -F': ' 'tolower($1)=="x-app-version"{print $2}' | tr -d '\r')"
  if [ "$codigo" = "200" ]; then echo "${version:-desconocida}"; else echo "ERROR-${codigo:-000}"; fi
done | sort | uniq -c | awk -v n="$N" '
  { cuenta[$2]=$1 }
  END {
    print ""
    printf "%-12s %8s %8s\n", "VERSIÓN", "PETIC.", "%"
    for (v in cuenta) {
      pct = cuenta[v] * 100 / n
      barra = ""; for (i = 0; i < pct / 2; i++) barra = barra "█"
      printf "%-12s %8d %7.1f%%  %s\n", v, cuenta[v], pct, barra
    }
  }'
