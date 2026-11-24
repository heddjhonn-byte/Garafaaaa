# GarrafaYa

## Project

GarrafaYa (also written Gararfa Ya) manages LPG distribution in La Paz and El Alto, Bolivia. The repository is a decoupled monorepo:

- `backend/`: Node.js, Express, PostgreSQL, and Swagger.
- `frontend/`: React Native, Expo, React Navigation, Axios, and AsyncStorage; use the existing Atomic Design structure (`atoms/`, `molecules/`, `organisms/`, `templates/`, `screens/`).

Keep the backend and mobile app decoupled and use the API for data exchange.

## Backend structure

The backend is a CommonJS Express API. Keep responsibilities in `backend/src/config`, `middlewares`, `models`, `controllers`, and `routes`; `backend/src/server.js` starts the service. PostgreSQL definitions and initial demo data live in `backend/schema.sql` and `backend/seed.sql`. Use `pg`, parameterized SQL, bcrypt password hashes, JWT authentication, dotenv configuration, and CORS. Render uses `DATABASE_URL` and `process.env.PORT || 3000`; PostgreSQL SSL in production uses `rejectUnauthorized: false`.

## Frontend structure

The Expo app starts from `frontend/App.js`. Keep reusable UI in `frontend/src/components/{atoms,molecules,organisms,templates}` and screens in `frontend/src/screens/{auth,admin,camionero,cliente}`. Use `src/services/api.js` for Axios requests and JWT injection from AsyncStorage, and `src/context/AuthContext.js` for session restoration and role-based navigation. The only application profiles are `Administrador`, `Camionero`, and `Cliente`.

## Local domain and UI

- Base coordinates: `-16.5000, -68.1500`; Bolivian phone numbers use `+591`; CI extension is `LP`.
- Service areas: Sur (Calacoto, Obrajes, Achumani, Chasquipampa), Centro (Miraflores, Sopocachi), Cotahuma, Max Paredes, Periférica, San Antonio, Mallasa, and El Alto (Ciudad Satélite, Villa Adela, Río Seco, Senkata).
- Road references include Av. Ballivián, Av. Arce, Autopista La Paz-El Alto, Av. Busch, Av. Costanera, Av. 6 de Marzo, Av. Juan Pablo II, and Puente de las Américas.
- Official prices: 10 kg = `22.50 Bs.`; 45 kg = `101.25 Bs.`.
- UI colors: navy `#0A2540`, primary blue `#1D61E7`, light background `#F8FAFC`.

## Roles and screens

Authentication screens: `LoginScreen` and `RegisterScreen`. The only JWT roles are `Administrador`, `Camionero`, and `Cliente`. Public registration creates `Cliente` accounts only; only administrators can create staff accounts.

Operational app (`Administrador` and `Camionero`):

1. **Inicio**: administrator dashboard for 10 kg/45 kg plant stock, today's dispatches and returns, active trucks, and deliveries.
2. **Camiones**: truck GPS monitoring; administrators manage trucks, and assigned drivers update their live location.
3. **Rutas**: administrators assign routes by area; drivers view their active route, report delivery progress, and report road incidents.
4. **Garrafas**: administrators manage 10 kg/45 kg inventory, incoming stock, returns, and movement history.
5. **Usuarios**: administrator-only account management.

Client app:

1. **Inicio**: prices in Bs., area schedules, and alerts.
2. **Mi camión**: live map, remaining truck stock, and “Reportar avistamiento”.
3. **Noticias**: community board for reading and publishing gas notices.
4. **Historial**: the client's sightings and alerts.
5. **Mi cuenta**: profile and nearby-alert settings.

## Data model

The PostgreSQL schema (`backend/schema.sql` and `backend/seed.sql`) includes:

- `usuarios`: accounts with exactly the `Administrador`, `Camionero`, and `Cliente` roles.
- `inventario_planta`: plant stock, tracked by cylinder capacity.
- `camiones`: distribution vehicles and their operational/GPS data.
- `zonas`: service areas and macrodistricts.
- `rutas`: truck route and delivery progress.
- `despachos`: plant dispatches to trucks.
- `movimientos_garrafas`: cylinder stock movements, including `SALIDA_PLANTA`.
- `incidentes`: road incidents reported for routes.
- `avistamientos`: citizen sightings used with driver GPS to estimate truck location.
- `noticias`: community notices.
- `configuracion_precios`: official prices by cylinder capacity.

Seed data includes trucks `4238-KFP`, `3178-UGT`, and `4821-NSE`, plus test users for exactly `Administrador`, `Camionero`, and `Cliente`.

Every cylinder movement or dispatch must include `capacidad_kg` (`10` or `45`) and `cantidad`. Truck stock is `garrafas_iniciales - garrafas_entregadas`.

## API and dispatch transaction

The backend exposes the following REST APIs:

- `GET /health`; Swagger UI at `/api-docs`.
- Auth (`/api/auth`): `POST /register` (public, Cliente only), `POST /login`, `GET /me`.
- Admin dashboard: `GET /api/dashboard/resumen`.
- Admin users (`/api/usuarios`): `GET /`, `POST /`, `PUT /:id`, `PATCH /:id/estado`, `DELETE /:id`.
- Trucks (`/api/camiones`): `GET /`, admin `POST /` and `PUT /:id`, assigned Camionero `PATCH /:id/ubicacion`.
- Zones and routes (`/api/zonas`, `/api/rutas`): zone CRUD and administrator route CRUD; `GET /api/rutas/mi-ruta` returns the active Camionero route; `PATCH /api/rutas/:id/progreso` updates deliveries/finalizes that assigned route.
- Admin dispatches (`/api/despachos`): `GET /`, `POST /`.
- Admin cylinder inventory (`/api/garrafas`): `GET /inventario`, `GET /movimientos`, `POST /movimientos`.
- Incidents (`/api/incidentes`): admin and driver `GET /`, `POST /`; admin `PATCH /:id/resolver`.
- Citizen sightings (`/api/avistamientos`): `GET /`, Cliente `POST /`.
- News and prices: `GET /api/noticias`, Cliente/Admin `POST /api/noticias`, public `GET /api/precios`, admin `PUT /api/precios/:capacidad_kg`.

`POST /api/despachos` must create the dispatch, decrement plant inventory for its `capacidad_kg`, insert a `SALIDA_PLANTA` row in `movimientos_garrafas`, and activate/update the driver's truck route with `garrafas_iniciales` and `garrafas_entregadas = 0`, all in one SQL transaction.

`RETORNO_VACIOS` records empty-cylinder returns; it does not increase full-cylinder plant stock. `DELETE /api/usuarios/:id` deactivates the account so historical records remain linked.

Consumer truck location combines the driver's GPS position with recent citizen sightings. The server listens on `process.env.PORT || 3000` for Render deployment.

## Implementation guidance

Preserve the three-role limit, role-based access, capacity-specific stock accounting, and transaction atomicity. Keep API documentation aligned with implemented routes. Do not invent business rules or endpoint paths that are not specified.
