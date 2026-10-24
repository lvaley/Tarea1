# Funciones compartidas por los scripts de Canary (no se ejecuta solo).
PESOS="nginx/fase/pesos.conf"

porcentaje_actual() {
  sed -n 's/^# CANARY: \([0-9]*\)%.*/\1/p' "$PESOS"
}

version_de() {
  docker compose ps --format '{{.Image}}' "frontend-$1" 2>/dev/null | sed 's/.*://' | head -n1
}

# Escribe pesos.conf para el porcentaje $1 (0 a 100).
escribir_pesos() {
  local p="$1" reparto cookie
  if   [ "$p" -eq 0 ];   then reparto="    *    estable;"
  elif [ "$p" -eq 100 ]; then reparto="    *    canary;"
  else                        reparto="    $p%  canary;
    *    estable;"
  fi

  # Con 0 % o 100 % se ignoran las cookies: todos van al mismo grupo.
  if [ "$p" -eq 0 ] || [ "$p" -eq 100 ]; then
    cookie="map \$host \$grupo_cookie { default \"\"; }"
  else
    cookie="map \$cookie_neko_canary_$p \$grupo_cookie {
    estable estable;
    canary  canary;
    default \"\";
}"
  fi

  cat > "$PESOS.tmp" <<CONF
# CANARY: $p%   (archivo generado por porcentaje.sh)

# Sorteo por petición: $p % a la versión canary, el resto a la estable.
split_clients "\${request_id}" \$grupo_azar {
$reparto
}

# Cookie de afinidad propia de esta fase (al cambiar de fase se vuelve a sortear).
map \$host \$nombre_cookie { default neko_canary_$p; }
$cookie
CONF
  mv "$PESOS.tmp" "$PESOS"
}

recargar_router() {
  if ! docker compose exec -T router nginx -t >/dev/null 2>&1; then
    echo "❌ Configuración de Nginx inválida."
    return 1
  fi
  docker compose exec -T router nginx -s reload >/dev/null 2>&1
  sleep 1
}

mostrar_estado() {
  local p; p="$(porcentaje_actual)"
  echo "┌───────────────────────────────────────────────┐"
  printf "│ ESTABLE  versión %-8s → %3s %% del tráfico │\n" "$(version_de estable)" "$((100 - p))"
  printf "│ CANARY   versión %-8s → %3s %% del tráfico │\n" "$(version_de canary)"  "$p"
  echo "└───────────────────────────────────────────────┘"
}
