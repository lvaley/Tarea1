# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# Imagen del FRONTEND de Neko Coffee (React + Vite servido por Nginx)
# Contexto de build : carpeta Tarea1-Tarea4 o Tarea1-Tarea5
# Contexto "config" : deploy/nginx  (se pasa con --build-context)
# ─────────────────────────────────────────────────────────────

# ---------- Etapa 1: compilar la SPA ----------
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo las dependencias: Docker reutiliza esta capa si no cambian.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# El frontend llama a la API en el MISMO origen (/api); Nginx la reenvía al backend.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

ARG APP_VERSION=dev
RUN npm run build \
 && printf '{"app":"neko-coffee","version":"%s"}\n' "$APP_VERSION" > dist/version.json

# ---------- Etapa 2: servir con Nginx ----------
FROM nginx:1.27-alpine

ARG APP_VERSION=dev
LABEL org.opencontainers.image.title="neko-coffee-frontend" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.authors="ねこ Code"

# APP_VERSION: se muestra en la cabecera X-App-Version.
# BACKEND_HOST: nombre del contenedor/servicio del backend (se puede cambiar al ejecutar).
ENV APP_VERSION=${APP_VERSION} \
    BACKEND_HOST=backend

COPY --from=config frontend.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
