#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Monitorea la tienda mientras se despliega: hace una petición cada
# INTERVALO segundos y registra el código HTTP y la versión que respondió.
# Detecta las caídas y, al salir con Ctrl+C, muestra un resumen.
#
# Uso:
#   ./scripts/monitor.sh [URL] [INTERVALO]
#   ./scripts/monitor.sh http://localhost:8080/api/health 0.5
# Guardar la evidencia a la vez:
#   ./scripts/monitor.sh | tee evidencias/paso3/monitor.txt
# ─────────────────────────────────────────────────────────────
URL="${1:-http://localhost:8080/api/health}"
INTERVALO="${2:-0.5}"

# Hora con milisegundos (macOS no soporta date +%N, por eso se usa perl).
ahora()   { perl -MTime::HiRes=time -e 'printf "%.3f", time'; }
hora_de() { perl -MPOSIX=strftime -e 'printf "%s.%03d", strftime("%H:%M:%S", localtime($ARGV[0])), ($ARGV[0]-int($ARGV[0]))*1000' "$1"; }
restar()  { awk -v a="$1" -v b="$2" 'BEGIN{printf "%.2f", a-b}'; }
sumar()   { awk -v a="$1" -v b="$2" 'BEGIN{printf "%.2f", a+b}'; }

total=0; fallos=0; caido_desde=""; tiempo_caido=0; caidas=0; versiones=""

resumen() {
  if [ -n "$caido_desde" ]; then
    tiempo_caido="$(sumar "$tiempo_caido" "$(restar "$(ahora)" "$caido_desde")")"
  fi
  echo
  echo "════════════ RESUMEN ════════════"
  echo "Peticiones totales : $total"
  echo "Peticiones fallidas: $fallos"
  echo "Caídas detectadas  : $caidas"
  echo "Tiempo sin servicio: ${tiempo_caido} s"
  echo "Versiones vistas   :${versiones:- ninguna}"
  exit 0
}
trap resumen INT TERM

echo "Monitoreando $URL cada ${INTERVALO}s  (Ctrl+C para terminar)"
echo "HORA          HTTP  VERSIÓN"

while true; do
  t="$(ahora)"
  salida="$(curl -s -m 1 -o /dev/null -D - -w 'CODIGO=%{http_code}' "$URL" 2>/dev/null)"
  codigo="$(printf '%s' "$salida" | sed -n 's/.*CODIGO=//p')"
  version="$(printf '%s' "$salida" | awk -F': ' 'tolower($1)=="x-app-version"{print $2}' | tr -d '\r')"
  codigo="${codigo:-000}"
  total=$((total + 1))

  if [ "$codigo" = "200" ]; then
    if [ -n "$caido_desde" ]; then
      duracion="$(restar "$t" "$caido_desde")"
      tiempo_caido="$(sumar "$tiempo_caido" "$duracion")"
      caido_desde=""
      echo "              ✅ Servicio restablecido después de ${duracion} s"
    fi
    case " $versiones " in *" $version "*) ;; *) versiones="$versiones $version" ;; esac
    estado=""
  else
    fallos=$((fallos + 1))
    if [ -z "$caido_desde" ]; then
      caido_desde="$t"
      caidas=$((caidas + 1))
      echo "              ⚠️  CAÍDA DETECTADA"
    fi
    estado="  ← sin servicio"
  fi

  printf "%s  %s   %s%s\n" "$(hora_de "$t")" "$codigo" "${version:--}" "$estado"
  sleep "$INTERVALO"
done
