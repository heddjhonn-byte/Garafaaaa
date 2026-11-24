# GarrafaYa project instructions

GarrafaYa (Gararfa Ya) is an LPG distribution project for La Paz and El Alto, Bolivia. The repository is a decoupled monorepo: `backend/` uses Node.js, Express, PostgreSQL, and Swagger; `frontend/` uses React Native, Expo, React Navigation, Axios, and AsyncStorage with Atomic Design (`atoms/`, `molecules/`, `organisms/`, `templates/`, `screens/`). Keep the apps decoupled and exchange data through the API.

The CommonJS backend is organized under `backend/src/config`, `middlewares`, `models`, `controllers`, and `routes`, with `backend/src/server.js` as its entry point. Keep SQL in `backend/schema.sql` and `backend/seed.sql`. Use `pg` parameterized queries, bcrypt hashes, JWT auth, dotenv, and CORS. On Render, support `DATABASE_URL`, `process.env.PORT || 3000`, and PostgreSQL SSL `{ rejectUnauthorized: false }` in production.

The Expo app starts at `frontend/App.js`. Follow Atomic Design under `frontend/src/components/{atoms,molecules,organisms,templates}` and keep role-based screens under `frontend/src/screens/{auth,admin,camionero,cliente}`. Centralize Axios/JWT behavior in `src/services/api.js` and persisted session/navigation state in `src/context/AuthContext.js`.

## Local domain

- Base coordinates: `-16.5000, -68.1500`; phone prefix: `+591`; CI extension: `LP`.
- Areas: Sur (Calacoto, Obrajes, Achumani, Chasquipampa), Centro (Miraflores, Sopocachi), Cotahuma, Max Paredes, Periférica, San Antonio, Mallasa, and El Alto (Ciudad Satélite, Villa Adela, Río Seco, Senkata).
- Road references: Av. Ballivián, Av. Arce, Autopista La Paz-El Alto, Av. Busch, Av. Costanera, Av. 6 de Marzo, Av. Juan Pablo II, Puente de las Américas.
- Official prices: 10 kg = `22.50 Bs.`; 45 kg = `101.25 Bs.`.
- UI colors: navy `#0A2540`, primary blue `#1D61E7`, light background `#F8FAFC`.

## Roles and screens

The only JWT roles are `Administrador`, `Camionero`, and `Cliente`. Authentication screens: `LoginScreen`, `RegisterScreen`. Public registration is restricted to `Cliente`; administrators create staff accounts.

Operational app (`Administrador` and `Camionero`):

- `Inicio`: administrator dashboard (plant stock by capacity, today's dispatches/returns, active trucks, deliveries).
- `Camiones`: GPS monitoring; administrators manage trucks and assigned drivers update their location.
- `Rutas`: administrators assign routes; drivers view their active route, update delivery progress, and report incidents.
- `Garrafas`: administrator inventory, incoming stock, returns, and movement history.
- `Usuarios`: administrator-only account management.

Client app:

- `Inicio`: prices in Bs., area schedules, alerts.
- `Mi camión`: live map, remaining truck stock, “Reportar avistamiento”.
- `Noticias`: community board to read and publish gas notices.
- `Historial`: client sightings and alerts.
- `Mi cuenta`: profile and nearby-alert settings.

## Database

`backend/schema.sql` and `backend/seed.sql` define `usuarios`, `inventario_planta`, `camiones`, `zonas`, `rutas`, `despachos`, `movimientos_garrafas`, `incidentes`, `avistamientos`, `noticias`, and `configuracion_precios`. Seed trucks: `4238-KFP`, `3178-UGT`, `4821-NSE`, plus demo users for exactly `Administrador`, `Camionero`, and `Cliente`.

Every dispatch and cylinder movement must specify `capacidad_kg` (`10` or `45`) and `cantidad`. Truck stock is `garrafas_iniciales - garrafas_entregadas`. Consumer truck location combines driver GPS and recent citizen sightings.

## API requirements

Implement and document these REST routes with Swagger:

- `GET /health`; Swagger UI at `/api-docs`.
- Auth `/api/auth`: `POST /register` (public Cliente only), `POST /login`, `GET /me`.
- Admin dashboard: `GET /api/dashboard/resumen`.
- Admin users `/api/usuarios`: `GET /`, `POST /`, `PUT /:id`, `PATCH /:id/estado`, `DELETE /:id`.
- Trucks `/api/camiones`: `GET /`, admin `POST /` and `PUT /:id`, assigned Camionero `PATCH /:id/ubicacion`.
- Zones and routes `/api/zonas`, `/api/rutas`: zone CRUD and administrator route CRUD; `GET /api/rutas/mi-ruta` (Camionero), `PATCH /api/rutas/:id/progreso` (assigned Camionero).
- Admin dispatches `/api/despachos`: `GET /`, `POST /`.
- Admin cylinder inventory `/api/garrafas`: `GET /inventario`, `GET /movimientos`, `POST /movimientos`.
- Incidents `/api/incidentes`: admin/Camionero `GET /`, `POST /`; admin `PATCH /:id/resolver`.
- Citizen sightings `/api/avistamientos`: `GET /`, Cliente `POST /`.
- News and prices: `GET /api/noticias`, Cliente/Admin `POST /api/noticias`, public `GET /api/precios`, admin `PUT /api/precios/:capacidad_kg`.

`POST /api/despachos` is atomic: create dispatch, decrement plant stock by capacity, insert `SALIDA_PLANTA` in `movimientos_garrafas`, and activate/update the assigned route with `garrafas_iniciales` and `garrafas_entregadas = 0`.

`RETORNO_VACIOS` logs empty-cylinder returns and does not add to full-cylinder stock. `DELETE /api/usuarios/:id` deactivates the account to preserve historical references.

Use `process.env.PORT || 3000` for Render. Enforce exactly the three roles `Administrador`, `Camionero`, and `Cliente`; preserve atomic dispatch behavior and capacity-specific inventory accounting. Keep Swagger synchronized with implemented routes.
