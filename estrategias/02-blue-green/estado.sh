#!/usr/bin/env bash
# Muestra qué entorno y qué versión atienden cada puerto.
# Uso: ./estrategias/02-blue-green/estado.sh
set -euo pipefail
cd "$(dirname "$0")"
source ./comun.sh

mostrar_estado
echo
docker compose ps --format "table {{.Service}}\t{{.Image}}\t{{.Status}}"
