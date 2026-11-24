# GarrafaYa

Sistema de distribución de GLP para La Paz y El Alto, Bolivia. El repositorio contiene una API Node.js/Express con PostgreSQL y una aplicación móvil React Native con Expo.

## Requisitos

- Node.js 20 o superior y npm.
- PostgreSQL local para desarrollo, o una base PostgreSQL administrada.
- Expo Go para probar en un teléfono; EAS CLI y una cuenta Expo para generar APK.

## 1. Crear la base de datos PostgreSQL

En Windows, abre PowerShell con PostgreSQL instalado y sus herramientas (`psql` y `createdb`) disponibles en `PATH`:

```powershell
createdb -U postgres garrafaya
psql -U postgres -d garrafaya -f .\backend\schema.sql
psql -U postgres -d garrafaya -f .\backend\seed.sql
```

Si tu usuario o puerto de PostgreSQL son distintos, ajusta los parámetros de conexión. También puedes crear la base `garrafaya` desde pgAdmin y ejecutar primero `backend/schema.sql` y luego `backend/seed.sql` en esa base.

El seed agrega zonas de La Paz y El Alto, los camiones `4238-KFP`, `3178-UGT`, `4821-NSE`, precios oficiales y cuentas de demostración:

| Perfil | Correo | Contraseña local |
|---|---|---|
| Administrador | `admin@garrafaya.bo` | `GarrafaYa123!` |
| Camionero | `camionero@garrafaya.bo` | `GarrafaYa123!` |
| Cliente | `cliente@garrafaya.bo` | `GarrafaYa123!` |

Estas credenciales son únicamente para desarrollo y demostración. No las uses en producción.

## 2. Ejecutar el backend local

Desde la raíz del repositorio, crea la configuración local:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Edita `backend/.env` para que `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD` coincidan con PostgreSQL. Define también un `JWT_SECRET` aleatorio y privado. Después:

```powershell
Set-Location .\backend
npm ci
npm start
```

El servidor usa el puerto `3000` por defecto. Comprueba el estado en `http://localhost:3000/health` y abre la documentación Swagger en `http://localhost:3000/api-docs`.

## 3. Desplegar el backend en Render

1. Crea una base de datos PostgreSQL en Render.
2. Ejecuta `backend/schema.sql` y después `backend/seed.sql` contra esa base. Puedes conectarte desde una máquina autorizada usando la URL externa de PostgreSQL:

   ```powershell
   $env:DATABASE_URL = "postgresql://..."
   psql $env:DATABASE_URL -f .\backend\schema.sql
   psql $env:DATABASE_URL -f .\backend\seed.sql
   ```

   Trata la URL como un secreto; no la guardes en el repositorio.
3. Crea un Web Service conectado al repositorio y configura `backend` como **Root Directory**.
4. Usa `npm ci` como **Build Command** y `npm start` como **Start Command**.
5. Configura estas variables en Render:
   - `NODE_ENV=production`
   - `DATABASE_URL`: URL interna de la base PostgreSQL de Render, preferiblemente en la misma región.
   - `JWT_SECRET`: valor aleatorio fuerte y exclusivo de producción.
   - `JWT_EXPIRES_IN=12h` (opcional).
   - `CORS_ORIGIN` (opcional; orígenes web permitidos separados por comas).

   Render proporciona `PORT`; la API lo utiliza automáticamente. La conexión PostgreSQL activa SSL en producción.
6. Al terminar el despliegue, comprueba `https://<servicio>.onrender.com/health` y `https://<servicio>.onrender.com/api-docs`.

## 4. Ejecutar el frontend con Expo Go

El ejemplo local se encuentra en `frontend/.env.example`. Cópialo y ajusta `EXPO_PUBLIC_API_URL` según dónde se ejecute Expo Go:

```powershell
Copy-Item .\frontend\.env.example .\frontend\.env
```

- Emulador Android: usa `http://10.0.2.2:3000/api`.
- Teléfono físico con Expo Go: usa `http://<IP-LAN-de-tu-computadora>:3000/api`; ambos dispositivos deben estar en la misma red.
- Render: usa `https://<servicio>.onrender.com/api`.

`localhost` en un teléfono apunta al teléfono, no a tu computadora. Mantén el backend accesible desde el dispositivo.

Inicia Expo:

```powershell
Set-Location .\frontend
npm ci
npx expo start
```

Escanea el código QR con Expo Go. Para iniciar una sesión de prueba, usa una de las cuentas de demostración de la tabla anterior.

## 5. Generar un APK de Android con EAS

La configuración EAS incluye el perfil `preview` para distribución interna como APK. La aplicación tiene definido el identificador Android `com.garrafaya.bolivia`.

1. Instala y configura EAS CLI:

   ```powershell
   npm install --global eas-cli
   eas login
   ```

2. Desde `frontend`, ejecuta una vez `eas build:configure` si EAS aún no ha vinculado el proyecto a tu cuenta.
3. En Expo/EAS, configura `EXPO_PUBLIC_API_URL` en el entorno `preview` con la URL accesible de tu API, por ejemplo `https://<servicio>.onrender.com/api`. No uses `localhost` para un APK instalado en un teléfono.
4. Inicia el build:

   ```powershell
   Set-Location .\frontend
   eas build --platform android --profile preview
   ```

5. Cuando EAS termine, descarga el `.apk` desde el enlace del build y transfiérelo al dispositivo Android para instalarlo.

Para más información sobre las rutas y perfiles disponibles, consulta `frontend/eas.json` y `frontend/app.json`.
