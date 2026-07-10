# 🚀 Guía de Configuración Local (Local Setup Guide)

Bienvenido a la guía paso a paso para levantar **Commitment v2** en tu entorno de desarrollo local. Este proyecto es un monorepo que incluye un backend en NestJS, una aplicación móvil en Expo/React Native, e infraestructura de soporte con Docker y Supabase.

## 📋 Pre-requisitos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema (macOS/Linux):

1. **Node.js**: Versión `20.0.0` o superior.
2. **pnpm**: Gestor de paquetes oficial del proyecto. (Versión recomendada: `10.34.4`).
   ```bash
   npm install -g pnpm@10.34.4
   ```
3. **Docker y Docker Compose**: Para levantar los servicios de infraestructura (Redis, Prometheus, Grafana, OpenTelemetry).
4. **Supabase CLI** (Opcional, pero recomendado si usas Supabase localmente para la base de datos):
   ```bash
   brew install supabase/tap/supabase
   ```
5. **Expo CLI / Expo Go**: Necesario para el desarrollo de la aplicación móvil.

---

## 🛠️ Paso 1: Instalación de Dependencias

Clona el repositorio y posiciónate en la raíz del proyecto. Una vez ahí, instala todas las dependencias del monorepo usando `pnpm`:

```bash
cd Commitment-v2
pnpm install
```

---

## 🐳 Paso 2: Levantar la Infraestructura (Docker)

El proyecto depende de servicios adicionales como Redis y herramientas de observabilidad. Levanta los contenedores en segundo plano:

```bash
docker compose up -d
```

> **Verificación:** Puedes comprobar que los contenedores están corriendo con `docker ps`. Deberías ver instancias de `redis`, `otel-collector`, `prometheus` y `grafana`.

---

## 🗄️ Paso 3: Entorno Local de Base de Datos (Supabase)

Si el proyecto requiere interactuar con la base de datos localmente, inicia los servicios de Supabase. (Este directorio se encuentra en la raíz del proyecto):

```bash
supabase start
```

> **Nota:** Esto te proporcionará las credenciales y URLs locales (ej. `API_URL`, claves JWT). Asegúrate de configurar tus archivos `.env` basándote en el `.env.example` en la raíz si es necesario.

---

## 🚀 Paso 4: Iniciar el Backend (NestJS)

El backend de NestJS está ubicado en `apps/backend`. Usando Turborepo, puedes iniciar todo desde la raíz:

```bash
# Iniciar todos los paquetes/apps configurados en turbo:
pnpm dev
```

Si prefieres correr **solamente el backend** de forma manual:

```bash
cd apps/backend
pnpm start:dev
```

El servidor del backend debería iniciar sin problemas y aceptar conexiones (típicamente en el puerto `3000`).

---

## 📱 Paso 5: Iniciar la Aplicación Móvil (Expo)

La aplicación móvil está construida con Expo y se encuentra en `apps/mobile`.

Abre una **nueva pestaña en tu terminal**, navega a la carpeta de mobile y ejecuta el entorno de desarrollo de Expo:

```bash
cd apps/mobile
pnpm start
```

Esto abrirá un menú interactivo en tu terminal donde podrás:

- Presionar **`i`** para abrir el **Simulador de iOS**.
- Presionar **`a`** para abrir el **Emulador de Android**.
- Escanear el código QR con la app **Expo Go** en tu dispositivo físico para probarlo en vivo.

---

## 📊 Paso 6: Monitoreo (Opcional)

Si necesitas acceder a las herramientas de telemetría y monitoreo que levantaste con Docker Compose, ingresa a los siguientes enlaces:

- **Grafana:** [http://localhost:3001](http://localhost:3001) (Credenciales: `admin` / `admin`)
- **Prometheus:** [http://localhost:9090](http://localhost:9090)

---

## 🎉 ¡Listo para Desarrollar!

Si has seguido los pasos anteriores de manera exitosa tendrás:

1. Tu base de datos y contenedores de backend (Supabase/Docker) corriendo de fondo.
2. Tu API NestJS corriendo en modo watch.
3. Tu cliente móvil en Expo actualizándose con Hot-Reloading en tu simulador.
