Estructura propuesta para la aplicación monolítica (Express)

Descripción rápida:
- Proyecto preparado para usarse con JavaScript o TypeScript. Incluye plantillas de arranque en `src/` con extensión `.example`.
- Renombra los archivos `.example` a su extensión real cuando elijas JS o TS (por ejemplo `src/index.js.example` -> `src/index.js`).

Estructura de carpetas (raíz):

- `src/` : código fuente
  - `routes/` : definiciones de rutas
  - `controllers/` : lógica de controladores
  - `models/` : modelos (ORM/ODM o capa de datos)
  - `middlewares/` : middlewares de Express
  - `services/` : lógica de negocio y servicios reutilizables
  - `config/` : configuración y constantes

- `views/` : plantillas de vista (EJS, Pug, Handlebars...)
- `public/` : activos públicos (css, js, images)
- `scripts/` : scripts auxiliares (migraciones, seeds, tareas)
- `tests/` : pruebas unitarias/integración
- `logs/` : archivos de logs
- `docs/` : documentación del proyecto

Archivos importantes:
- `.env.example` : variables de entorno de ejemplo (copiar a `.env` y ajustar)
- `.gitignore` : archivos/dirs ignorados por git
- `.editorconfig` : formato básico del editor

Cómo elegir JS o TS:
1. Si eliges JavaScript:
   - Renombra los archivos `*.js.example` a `*.js`.
   - Instala dependencias: `npm install express ...`.
   - Ajusta `package.json` scripts: `start` -> `node src/index.js`.

2. Si eliges TypeScript:
   - Renombra los archivos `*.ts.example` a `*.ts`.
   - Añade `tsconfig.json` y dependencias: `typescript`, `ts-node`, `@types/node`, `@types/express`.
   - Ajusta scripts: `dev` -> `ts-node-dev --respawn src/index.ts`, `build` -> `tsc`.

Notas:
- Mantengo archivos de ejemplo (`*.example`) en el repo para que no sobrescriban la configuración hasta que elijas.
- ¿Quieres que también añada un `tsconfig.json` y plantillas de `package.json` para ambos casos? Si quieres, los creo ahora.