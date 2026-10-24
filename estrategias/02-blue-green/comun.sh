# Funciones compartidas por los scripts de Blue-Green (no se ejecuta solo).
DESTINOS="nginx/activo/destinos.conf"

# Entorno que hoy recibe a los usuarios: blue o green.
entorno_activo() {
  if grep -q "ENTORNO ACTIVO: green" "$DESTINOS"; then echo green; else echo blue; fi
}

# El otro entorno.
entorno_inactivo() {
  if [ "$(entorno_activo)" = blue ]; then echo green; else echo blue; fi
}

# Versión que está corriendo en un entorno (lee la imagen del contenedor).
version_de() {
  docker compose ps --format '{{.Image}}' "frontend-$1" 2>/dev/null | sed 's/.*://' | head -n1
}

# Escribe destinos.conf: $1 = entorno que pasa a producción.
escribir_destinos() {
  local activo="$1" inactivo
  if [ "$activo" = blue ]; then inactivo=green; else inactivo=blue; fi
  cat > "$DESTINOS.tmp" <<CONF
# ENTORNO ACTIVO: $activo   (archivo generado por cambiar.sh)
map \$host \$destino_produccion { default frontend-$activo; }
map \$host \$destino_prueba     { default frontend-$inactivo; }
CONF
  mv "$DESTINOS.tmp" "$DESTINOS"
}

mostrar_estado() {
  local a i
  a="$(entorno_activo)"; i="$(entorno_inactivo)"
  echo "┌──────────────────────────────────────────────────────┐"
  printf "│ PRODUCCIÓN :8081 → %-6s  versión %-18s │\n" "$a" "${2:-$(version_de "$a")}"
  printf "│ PRUEBA     :8082 → %-6s  versión %-18s │\n" "$i" "$(version_de "$i")"
  echo "└──────────────────────────────────────────────────────┘"
}
