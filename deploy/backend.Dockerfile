# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# Imagen del BACKEND de Neko Coffee (Node.js + Express + Mongoose)
# Contexto de build: carpeta backend/ de Tarea1-Tarea4 o Tarea1-Tarea5
# Las credenciales (MONGODB_URI, JWT_SECRET) NO van en la imagen:
# se entregan al ejecutar el contenedor con --env-file.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production \
    PORT=5000

# Solo dependencias de producción.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

ARG APP_VERSION=dev
LABEL org.opencontainers.image.title="neko-coffee-backend" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.authors="ねこ Code"
ENV APP_VERSION=${APP_VERSION}

# No ejecutar como root dentro del contenedor.
USER node

EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "server.js"]
