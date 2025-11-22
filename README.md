# EVA — App de Votación (Monolito Express)

Estructura mínima creada para arrancar una aplicación monolítica con Express.

Quickstart

1. Instalar dependencias:

```powershell
npm install
```

2. Ejecutar en desarrollo (con reinicio automático si instalaste `nodemon`):

```powershell
npm run dev
```

3. Abrir en el navegador:

http://localhost:3000/

Qué hay en este repositorio

- `index.js` — Punto de entrada Express (CommonJS). Sirve `public/index.html` en `/`, archivos estáticos desde `/public` y monta `src/routes/index.js` si existe.
- `public/index.html` — Página de inicio estática.
- `public/css/main.css` y `public/js/main.js` — activos mínimos para que las carpetas no queden vacías.
- `src/` — código fuente del backend (rutas, controladores, modelos, middlewares, services, config).
- `views/` — plantillas (hay un `index.ejs` de ejemplo).
- `scripts/` — scripts auxiliares (`seed.js` placeholder).
- `tests/` — tests de ejemplo.
- `docs/` — documentación adicional (`STRUCTURE.md`).

Decisiones y recomendaciones

- La estructura es adecuada para una app monolítica de votación: las capas `routes`, `controllers`, `services`, y `models` facilitan mantener el dominio de votación organizado dentro de un solo repositorio.
- Si planeas un crecimiento grande o múltiples equipos trabajando independientemente, considera dividir en microservicios más adelante.
- Puedes elegir JavaScript (actual) o migrar a TypeScript si quieres tipado y mayor seguridad. Hay plantillas `.example` de TypeScript en `src/`.

Siguientes pasos sugeridos

- Implementar modelos (ORM/ODM) para votos, elecciones, candidatos y usuarios.
- Añadir persistencia (Postgres, MySQL, MongoDB) y migraciones.
- Añadir autenticación y autorización (por ejemplo JWT o sesiones) en `src/middlewares/auth.js`.
- Implementar rutas REST para votar, listar candidatos y ver resultados.

