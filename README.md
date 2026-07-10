# Commitment v2

```text
  ____                               _ _                     _
 / ___|___  _ __ ___  _ __ ___  _ __(_) |_ _ __ ___   ___  _| |_
| |   / _ \| '_ ` _ \| '_ ` _ \| '__| | __| '_ ` _ \ / _ \(_)_  _)
| |__| (_) | | | | | | | | | | | |  | | |_| | | | | |  __/  |_|
 \____\___/|_| |_| |_|_| |_| |_|_|  |_|\__|_| |_| |_|\___|
```

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK--52-000000.svg?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E.svg?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Tamagui](https://img.shields.io/badge/Tamagui-2.x-FF69B4.svg?style=flat-square)](https://tamagui.dev/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-EF4444.svg?style=flat-square&logo=turborepo)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-F69220.svg?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![DDD](https://img.shields.io/badge/Architecture-DDD%20%2F%20Clean-blueviolet.svg?style=flat-square)](#)
[![Accessibility](https://img.shields.io/badge/Accessibility-A11y--first-brightgreen.svg?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Commitment** es una plataforma de software profesional diseñada para guiar y motivar el compromiso humano con un enfoque de alta calidad técnica, resiliencia offline-first y diseño calmo.

---

## 🏛️ Arquitectura del Monorepo

El proyecto está organizado en un monorepo administrado por **pnpm workspaces** y **Turborepo**:

```text
apps/
  ├── mobile                  # Aplicación móvil (React Native + Expo)
  └── backend                 # API del Backend (NestJS)

packages/
  ├── domain                  # Reglas puras de negocio y CQRS base (sin frameworks)
  ├── design-system           # Componentes de UI calmas, Focus, Keyboard e Input (Tamagui)
  ├── theme-engine            # Motor dinámico e independiente de interpretación de temas
  ├── localization            # SDK centralizado de traducción, localización y formateo de fechas
  ├── platform                # Adaptadores físicos de APIs nativas (Haptics, Keyboard, etc.)
  ├── api-contracts           # Esquemas compartidos de validación de APIs (Zod)
  ├── config                  # Configuraciones compartidas de compilación, linters y formato
  └── shared                  # Utilidades y definiciones de tipos reutilizables
```

---

## 📦 Package Responsibilities

| Package                         | Responsabilidad                                                                    |
| :------------------------------ | :--------------------------------------------------------------------------------- |
| **`@commitment/domain`**        | Reglas puras de negocio, CQRS, agregados e historial inmutable de eventos.         |
| **`@commitment/theme-engine`**  | Resolución agnóstica de temas basada en especificaciones manifest JSON.            |
| **`@commitment/design-system`** | Componentes calmos de interfaz gráfica de usuario y orquestación de accesibilidad. |
| **`@commitment/platform`**      | Abstracción y adaptadores físicos para APIs nativas de sistema operativo.          |
| **`@commitment/localization`**  | Traducción, formateo de fechas y localización de monedas unificado.                |
| **`@commitment/api-contracts`** | Contratos de comunicación y validación Zod compartidos entre cliente y backend.    |

---

## 🔗 Diagrama de Dependencias Permitidas

Las dependencias entre paquetes dentro del monorepo siguen una jerarquía estricta para salvaguardar la robustez del sistema:

```mermaid
graph TD
    apps/mobile(apps/mobile) --> DS[@commitment/design-system]
    apps/backend(apps/backend) --> Domain[@commitment/domain]

    DS --> Platform[@commitment/platform]
    DS --> Localization[@commitment/localization]
    DS --> ThemeEngine[@commitment/theme-engine]

    ThemeEngine --> Domain
    Localization --> Domain
    Platform --> Domain
```

### Reglas de Dependencia y Aislamiento:

- **Dominio Puro:** El paquete `domain` **nunca** depende de ningún otro módulo del monorepo, framework de persistencia o renderizado.
- **Theme Engine Agnóstico:** El paquete `theme-engine` **no depende** de librerías visuales como React o Tamagui.
- **Design System Aislado:** El paquete `design-system` **nunca** importa APIs de hardware o sistemas operativos directamente.
- ** features Libres de Hardware:** Los slices funcionales (features) **nunca** importan ni consumen paquetes de `react-native`, `expo-*` ni APIs nativas directamente. Toda interacción pasa por los servicios inyectados de `@commitment/platform`.

---

## 🛠️ Stack Tecnológico

- **Aplicación Móvil:** React Native + Expo (TypeScript)
- **UI & Estilos:** Tamagui (CSS-in-JS con HSL tokens)
- **Servidor Backend:** NestJS (Node.js + PostgreSQL)
- **Gestión del Monorepo:** Turborepo + pnpm
- **Base de Datos Local:** SQLite (para almacenamiento offline)
- **Estado Local / Queries:** Zustand + React Query
- **Validación de Datos:** Zod
- **Testing:** Jest + React Native Testing Library (RNTL v14)

---

## 🛡️ Architecture Guarantees

- **[✔] Bounded Context & Pure Domain:** El dominio de negocio es 100% agnóstico a frameworks y bases de datos.
- **[✔] Agnóstic Theme Engine:** El motor de apariencia es independiente y configurable vía especificaciones JSON.
- **[✔] Design System decoupled from Native APIs:** Desacoplamiento de llamadas al sistema operativo de la capa interactiva.
- **[✔] Centralized Localization SDK:** Manejo único y riguroso de traducciones y fechas sin usar `Intl` nativo.
- **[✔] Event-Driven Domain:** Evolución de estados mediante la reproducción inmutable de eventos.
- **[✔] Feature Independence:** Los slices de desarrollo son autosuficientes y modulares.
- **[✔] Accessibility-First:** Foco priorizado, auto-scroll y anuncios integrados por defecto.

---

## ⚙️ Requisitos del Entorno

- **Node.js:** `v22.0.0` o superior (Recomendado LTS)
- **pnpm:** `v10.0.0` o superior
- **Expo CLI:** SDK 52 compatible

---

## 🚀 Instalación y Configuración

Instala todas las dependencias del monorepo ejecutando en la raíz:

```bash
npx pnpm install
```

---

## 💻 Comandos Útiles

Todos los comandos se ejecutan desde la raíz del monorepo:

### Construcción y Compilación

```bash
npx pnpm build
```

### Ejecución de Pruebas

```bash
# Correr todo el set de pruebas
npx pnpm test

# Correr pruebas con refresco de snapshots
npx pnpm --filter @commitment/design-system test -- -u
```

### Linter y Verificación de Tipos

```bash
npx pnpm lint
```

### Ejecución en Modo Desarrollo

```bash
# Levantar el entorno móvil de Expo
npx pnpm --filter mobile start

# Levantar el servidor de desarrollo NestJS backend
npx pnpm --filter backend start:dev
```

---

## 📂 Estructura de Directorios

- `apps/`: Contiene los ejecutables y puntos de entrada de los despliegues (NestJS backend, Expo mobile app).
- `packages/`: Módulos compartidos, desacoplados y reutilizables en la plataforma.
- `docs/`: Documentación del producto, especificaciones, y decisiones arquitectónicas históricas (ADRs).
- `engineering/`: Herramientas de gobernanza operativa, prompts de IA, checklists de arquitectura y plantillas.

---

## 🌐 Internacionalización (Localización)

- **Sin texto plano:** Todo componente visual debe consumir claves de traducción válidas (`i18nKey`) resueltas por el SDK.
- **Formateo Centralizado:** Los números, divisas y fechas deben ser procesados a través del SDK de `@commitment/localization`.
- **Restricciones:** No está permitido el uso directo del constructor `Intl` nativo dentro de las features o componentes del Design System.

---

## ♿ Accesibilidad (A11y)

- **Focus Manager:** Un orquestador centralizado de pila de contextos priorizados (`screen`, `dialog`, `bottomSheet`, `popover`, `tooltip`, `coach`).
- **Screen Announcements:** Notificaciones de audio asíncronas para lectores de pantalla mediante prioridades (`polite` y `assertive`).
- **Keyboard & Input Management:** Auto-scroll inteligente y reubicación de campos activos en formularios para evitar oclusión por teclado, controlando asincronía en RNTL v14.

---

## 🗺️ Estado del Roadmap

```text
[✔] Core Platform & Workspace
[✔] Design System Foundation
[✔] Theme Engine & Experience Themes
[✔] Dynamic Dashboard & Widget Registry
[✔] Focus, Keyboard & Input Infrastructure
[ ] Offline Storage & Operation Queues (planned)
[ ] Cloud Sync & Profile Preferences (planned)
[ ] Analytics & Telemetry (planned)
[ ] AI Coach Conversational Context (planned)
```

---

## 🤝 Cómo Contribuir

1. **Ejecutar Tests:** Asegúrate de que las 56 pruebas de Jest pasen sin errores.
2. **Typecheck y Linters:** Ejecuta `npx pnpm build` y `npx pnpm lint` en la raíz.
3. **Respetar los límites:** No introduzcas dependencias directas de React Native, APIs de almacenamiento o hardware nativo dentro de `@commitment/design-system` o los features.

---

## 📚 Documentación Adicional

- [docs/ARCHITECTURE_OVERVIEW.md](file:///Users/yereth/Desktop/Commitment-v2/docs/ARCHITECTURE_OVERVIEW.md): Documentación arquitectónica técnica profunda (C4 Diagrams, Flujos de Datos).
- [docs/](file:///Users/yereth/Desktop/Commitment-v2/docs/): Directorio principal de especificaciones y ADRs de producto y técnicos.
- [engineering/](file:///Users/yereth/Desktop/Commitment-v2/engineering/): Herramientas y estándares del flujo de ingeniería (Gobernanza activa, templates y prompts).
- [HANDBOOK.md](file:///Users/yereth/Desktop/Commitment-v2/HANDBOOK.md): Manual de Onboarding técnico y de estilo del proyecto.
