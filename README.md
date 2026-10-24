# Neko Coffee · Estrategias de despliegue con Docker

Implementación y comparación de tres estrategias de despliegue (**Recreate**, **Blue-Green** y **Canary**) usando Docker, Docker Compose y Nginx. Como base se usan las aplicaciones de las tareas 4 y 5, que son dos versiones reales de la misma tienda en línea, *Neko Coffee*.

---

## Resultados

En las tres estrategias se actualizó la tienda de la versión **1.0.0** a la **2.0.0** mientras se medía su disponibilidad.

| Estrategia | Tiempo sin servicio | Peticiones fallidas | Usuarios expuestos a la versión nueva | Rollback |
|---|---|---|---|---|
| **Recreate** | **6.30 s** | 11 de 73 | 100 % de golpe | Redesplegar (con caída) |
| **Blue-Green** | **0 s** | 0 de 42 | 100 % de golpe | Inmediato |
| **Canary** | **0 s** | 0 | 11 % → 55 % → 100 % | Inmediato |

## Versiones

| Versión | Código | Qué incluye |
|---|---|---|
| **1.0.0** | [`Tarea1-Tarea4/`](Tarea1-Tarea4) | Backend con MongoDB, autenticación, CRUD de productos, banners y pedidos, panel de administración |
| **2.0.0** | [`Tarea1-Tarea5/`](Tarea1-Tarea5) | Todo lo anterior + seguridad JWT con expiración de 5 minutos y cierre de sesión automático |

Cada versión se ejecuta en dos contenedores:

```
Navegador ──► frontend (Nginx :80) ──► /api/* ──► backend (Node.js :5000) ──► MongoDB Atlas
```

**Stack:** React + Vite + React Bootstrap · Node.js + Express + Mongoose · MongoDB Atlas · Docker · Nginx

## Estructura del repositorio

```
.
├── Tarea1-Tarea4/          código de la Tarea 4  → versión 1.0.0
├── Tarea1-Tarea5/          código de la Tarea 5  → versión 2.0.0
├── deploy/                 Dockerfiles, .dockerignore y Nginx del frontend
├── estrategias/
│   ├── 01-recreate/        reemplazo directo
│   ├── 02-blue-green/      dos entornos + router Nginx
│   └── 03-canary/          reparto por porcentaje + afinidad por cookie
├── scripts/
│   ├── build.sh            construye las 4 imágenes con su etiqueta
│   ├── monitor.sh          mide caídas durante un despliegue
│   └── distribucion.sh     cuenta qué versión atendió cada petición
├── backend.env.example     plantilla de variables de entorno
└── Manual-Estrategias-Despliegue-Docker.pdf
```

El código de las tareas 4 y 5 **no se modificó**. Los Dockerfiles están en `deploy/` y cada carpeta se usa solo como contexto de build, así que la misma receta construye las dos versiones.

## Estrategia 1 · Recreate

Se detiene la versión actual y se levanta la nueva en su lugar. **Hay tiempo sin servicio.**

```bash
./estrategias/01-recreate/desplegar.sh 1.0.0      # primer despliegue → http://localhost:8080
./estrategias/01-recreate/desplegar.sh 2.0.0      # actualización (con caída)
./estrategias/01-recreate/desplegar.sh 1.0.0      # rollback (también con caída)
docker compose -p neko-recreate down              # detener
```

Para ver la caída, ejecuta el monitor en otra terminal antes de actualizar:

```bash
./scripts/monitor.sh http://localhost:8080/api/health
```

## Estrategia 2 · Blue-Green

Dos entornos completos. Uno atiende a los usuarios y el otro recibe la versión nueva. Un Nginx cambia el tráfico con una recarga, **sin cortar conexiones**.

| Puerto | Uso |
|---|---|
| `8081` | Producción (entorno activo) |
| `8082` | Prueba del entorno inactivo |

```bash
./estrategias/02-blue-green/iniciar.sh 1.0.0      # blue en producción
./estrategias/02-blue-green/publicar.sh 2.0.0     # 2.0.0 en green, sin afectar a nadie
./estrategias/02-blue-green/cambiar.sh            # producción → green
./estrategias/02-blue-green/cambiar.sh            # rollback → blue
./estrategias/02-blue-green/estado.sh             # ver qué versión atiende cada puerto
docker compose -p neko-bluegreen down             # detener
```

`cambiar.sh` verifica que el entorno destino responda y valida la configuración de Nginx antes de cambiar el tráfico.

## Estrategia 3 · Canary

La versión nueva recibe solo un porcentaje de los usuarios, que se aumenta por fases. Tienda en `http://localhost:8083`.

```bash
./estrategias/03-canary/iniciar.sh 1.0.0          # estable al 100 %
./estrategias/03-canary/publicar.sh 2.0.0         # canary publicada al 0 %
./estrategias/03-canary/porcentaje.sh 10          # fase 1
./estrategias/03-canary/porcentaje.sh 50          # fase 2
./estrategias/03-canary/porcentaje.sh 100         # fase 3
./estrategias/03-canary/porcentaje.sh 0           # rollback inmediato
./estrategias/03-canary/promover.sh               # la canary pasa a ser la estable
docker compose -p neko-canary down                # detener
```

Medir el reparto en cada fase:

```bash
./scripts/distribucion.sh
```

| Fase | 1.0.0 | 2.0.0 |
|---|---|---|
| 10 % | 89 % | 11 % |
| 50 % | 45 % | 55 % |
| 100 % | 0 % | 100 % |

**Afinidad por cookie:** el router asigna a cada navegador una cookie con su grupo para que siempre reciba la misma versión. Sin ella, una visita podría cargar el HTML de una versión y el JavaScript de la otra, y la SPA se rompería. La cabecera `X-Canary: siempre` fuerza la versión nueva para pruebas internas.

## Ventajas y riesgos

| | Recreate | Blue-Green | Canary |
|---|---|---|---|
| **Ventaja principal** | La más simple y con menos recursos | Sin caída y rollback instantáneo | Menor riesgo: se expone a pocos usuarios primero |
| **Riesgo principal** | Caída garantizada, también en el rollback | Duplica recursos; la base de datos compartida debe ser compatible | Más compleja; requiere monitoreo y afinidad de sesión |
| **Ideal para** | Desarrollo y apps internas | Releases críticos | Cambios riesgosos validados con usuarios reales |

En las tres estrategias, las versiones que conviven comparten la misma base de datos y el mismo `JWT_SECRET`, por eso la sesión de un usuario sobrevive al cambio de versión. También es su principal riesgo: si una versión nueva cambiara el esquema o el formato del token, el rollback podría romper la versión anterior.

## Seguridad

- Las credenciales viven solo en `backend.env`, excluido por `.gitignore`.
- Los Dockerfiles no usan `ARG` ni `ENV` para secretos, porque quedarían en el historial de la imagen.
- Los `.dockerignore` excluyen cualquier `.env`.
- El backend corre con un usuario sin privilegios (`node`) y ambas imágenes tienen `HEALTHCHECK`.
- Las imágenes base usan versiones fijas (`node:22-alpine`, `nginx:1.27-alpine`).

---

## Autor

- **Estudiante:** Luis Enrique Valey Osorio (9490-21-16222)
- **Proyecto:** Tienda en Línea con React, Bootstrap, React Router y estado global (Context API + useReducer)
