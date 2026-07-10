# 🚀 Guía de Configuración Local (Local Setup Guide)

Bienvenido a la guía oficial paso a paso para levantar **Commitment v2** en tu entorno de desarrollo local. Este proyecto es un monorepo administrado por **pnpm** y **Turborepo** que incluye un backend en NestJS, una aplicación móvil en Expo (React Native), e infraestructura de soporte local (Docker y Supabase).

---

## 📋 Pre-requisitos

Asegúrate de contar con lo siguiente instalado en tu máquina:

1. **Docker Desktop:** Activo y corriendo.
2. **Node.js:** Versión `v22.0.0` o superior (Recomendado LTS).

_Nota: No requieres instalar herramientas globales como `pnpm` o `supabase` en tu sistema operativo; toda la guía utiliza comandos prefijados con `npx` para ejecutarse de forma aislada y segura._

---

## 🛠️ Paso 1: Instalación de Dependencias

Clona el repositorio e instala las dependencias desde la raíz del proyecto ejecutando:

```bash
npx pnpm install
```

---

## 🐳 Paso 2: Levantar Infraestructura Base (Docker)

El proyecto depende de Redis y herramientas de observabilidad local. Levanta los contenedores en segundo plano:

```bash
docker compose up -d
```

> **Verificación:** Puedes ejecutar `docker ps` para validar que los contenedores `commitment-redis`, `commitment-otel-collector`, `commitment-prometheus` y `commitment-grafana` están corriendo correctamente.

---

## 🗄️ Paso 3: Levantar Base de Datos (Supabase Local)

Para la persistencia local de datos y autenticación, levanta la suite local de Supabase ejecutando en la raíz del proyecto:

```bash
npx supabase start
```

Esto inicializará Postgres, Auth, Storage y levantará la interfaz web de administración. Al completarse, verás un bloque con las credenciales locales:

- **Studio URL (Consola Web):** `http://127.0.0.1:54323`
- **API URL:** `http://127.0.0.1:54321`
- **DB Connection URL:** `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

_Si en algún momento deseas apagar Supabase, ejecuta:_

```bash
npx supabase stop
```

---

## 🖥️ Paso 4: Iniciar el API Backend (NestJS)

El backend expone la API y procesa los comandos/queries. Inicia el servidor de desarrollo en modo de escucha (_watch_):

```bash
npx pnpm --filter backend start:dev
```

El backend levantará por defecto en el puerto `3000` y se conectará automáticamente a tu instancia local de Supabase.

---

## 📱 Paso 5: Iniciar la Aplicación Móvil (Expo)

La aplicación móvil está construida sobre React Native y Expo. Levanta el servidor de desarrollo de Metro:

```bash
npx pnpm --filter mobile start
```

Esto abrirá un menú interactivo en tu terminal donde podrás:

- Presionar **`i`** para abrir el simulador de **iOS** (requiere Xcode en macOS).
- Presionar **`a`** para abrir el emulador de **Android** (requiere Android Studio).
- Escanear el código QR con la aplicación **Expo Go** en tu dispositivo físico (iOS o Android) para probar los cambios en tiempo real.

---

## 📊 Paso 6: Monitoreo & Logs (Opcional)

Si necesitas auditar la telemetría del sistema, puedes acceder localmente a:

- **Grafana:** [http://localhost:3001](http://localhost:3001) (Credenciales por defecto: `admin` / `admin`).
- **Prometheus:** [http://localhost:9090](http://localhost:9090).
- **Supabase Studio (Ver tablas y Auth):** [http://localhost:54323](http://localhost:54323).
