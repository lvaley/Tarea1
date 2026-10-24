#!/usr/bin/env bash
# Muestra el reparto actual y los contenedores del Canary.
# Uso: ./estrategias/03-canary/estado.sh
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

mostrar_estado
echo
docker compose ps --format "table {{.Service}}\t{{.Image}}\t{{.Status}}"
