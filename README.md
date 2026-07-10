# Commitment v2

> **"Frameworks are replaceable. Business rules are not."**

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
  ├── design-system           # Primitivas de UI calmas, Focus, Keyboard e Input Management (Tamagui)
  ├── theme-engine            # Motor dinámico e independiente de interpretación de temas
  ├── localization            # SDK centralizado de traducción, localización y formateo de fechas
  ├── platform                # Adaptadores físicos de APIs nativas de cada sistema operativo (Mobile/Web)
  ├── api-contracts           # Esquemas compartidos de validación de APIs (Zod)
  ├── config                  # Configuraciones compartidas de compilación, linters y formato
  └── shared                  # Utilidades y definiciones de tipos reutilizables
```

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

## ⚙️ Requisitos del Entorno

Asegúrate de contar con las siguientes versiones mínimas instaladas en tu entorno local:

- **Node.js:** `v22.0.0` o superior (Recomendado LTS)
- **pnpm:** `v10.0.0` o superior
- **Expo CLI:** SDK 51/52 compatible

---

## 🚀 Instalación y Configuración

Clona el repositorio e instala todas las dependencias del monorepo ejecutando en la raíz:

```bash
npx pnpm install
```

---

## 💻 Comandos Útiles

Turborepo compila y orquesta las tareas en paralelo de forma eficiente. Todos los comandos se ejecutan desde la raíz del monorepo:

### Construcción y Compilación

```bash
npx pnpm build
```

### Ejecución de Pruebas

```bash
# Correr todo el set de pruebas del monorepo
npx pnpm test

# Correr pruebas con refresco de snapshots
npx pnpm --filter @commitment/design-system test -- -u
```

### Linter y Verificación de Tipos

```bash
# Ejecutar verificación de estilos y linter
npx pnpm lint

# Ejecutar typecheck de TypeScript en todos los paquetes
npx pnpm typecheck
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

## 🧠 Principios Arquitectónicos

1. **Domain-Driven Design (DDD):** El núcleo de reglas de negocio en `packages/domain` es puro, no importa frameworks de persistencia ni utilidades de renderizado.
2. **Vertical Slices:** Fomentamos la organización de código por características funcionales completas (Slices) en lugar de capas técnicas estrictas.
3. **Desacoplamiento de APIs Nativa (Platform SDK):** Ninguna Feature de la aplicación móvil interactúa directamente con APIs nativas (como `BackHandler`, `Keyboard`, `AccessibilityInfo` o `SecureStore`). En su lugar, consumen abstracciones proporcionadas por `@commitment/platform` inyectadas mediante el `PlatformProvider`.
4. **Independencia del Design System:** El Design System provee las primitivas de interacción abstractas pero no maneja estado global ni depende de singletons de plataformas nativas.

---

## 🔌 Capas del Sistema de Interacción

La arquitectura sigue una estructura unidireccional y limpia para aislar la lógica de presentación de las llamadas al sistema operativo:

```text
[ Feature (Slice de Negocio) ]
             ↓
[ Design System (Primitivas UI) ]
             ↓
[ Platform SDK (PlatformProvider) ]
             ↓
[ Native APIs (react-native, expo-*, etc.) ]
```

---

## 🎨 Sistema de Temas (Theme Engine)

El motor de apariencia está diseñado para soportar múltiples fuentes de renderizado e interpretación dinámica. Su flujo de resolución es:

```text
[ Theme Manifest (Configuración JSON) ]
                     ↓
[ Theme Engine (Procesador Agnóstico) ]
                     ↓
[ Resolved Theme (Estructura en Memoria) ]
                     ↓
[ Design System Adapter (Tamagui Tokens) ]
                     ↓
[ Tamagui Provider (UI final) ]
```

---

## 🌐 Internacionalización (Localización)

La plataforma impone reglas estrictas de internacionalización para evitar regresiones de formato y rigidez idiomática:

- **Sin texto plano:** Todo componente visual debe consumir claves de traducción válidas (`i18nKey`) resueltas por el SDK.
- **Formateo Centralizado:** Los números, divisas y fechas deben ser procesados a través del SDK de `@commitment/localization`.
- **Restricciones:** No está permitido el uso directo del constructor `Intl` nativo dentro de las features o componentes del Design System.

---

## ♿ Accesibilidad (A11y)

El monorepo cuenta con una infraestructura de accesibilidad de primer nivel incorporada de forma nativa en la base:

- **Focus Manager:** Un orquestador centralizado de pila de contextos priorizados (`screen`, `dialog`, `bottomSheet`, `popover`, `tooltip`, `coach`).
- **Screen Announcements:** Notificaciones de audio asíncronas para lectores de pantalla mediante prioridades (`polite` y `assertive`).
- **Keyboard & Input Management:** Auto-scroll inteligente y reubicación de campos activos en formularios para evitar oclusión por teclado, controlando asincronía en RNTL v14.

---

## 🗺️ Estado del Roadmap

```text
✅ Core Platform & Workspace
✅ Design System Foundation
✅ Theme Engine & Experience Themes
✅ Dynamic Dashboard & Widget Registry
✅ Focus, Keyboard & Input Infrastructure
🚧 Offline Storage & Operation Queues
🚧 Cloud Sync & Profile Preferences
🚧 Analytics & Telemetry
🚧 AI Coach Conversational Context
```

---

## 🤝 Cómo Contribuir

Antes de abrir una solicitud de cambio (Pull Request), asegúrate de cumplir con el siguiente checklist de control:

1. **Ejecutar Tests:** Asegúrate de que las 56 pruebas de Jest pasen sin errores.
2. **Typecheck y Linters:** Ejecuta `npx pnpm typecheck` y `npx pnpm lint` en la raíz.
3. **Respetar los límites:** No introduzcas dependencias directas de React Native, APIs de almacenamiento o hardware nativo dentro de `@commitment/design-system` o los features.
4. **Validar las dependencias del monorepo:** Asegúrate de que no existan dependencias cruzadas que rompan el aislamiento de paquetes.

---

## 📚 Documentación Adicional

- [docs/](file:///Users/yereth/Desktop/Commitment-v2/docs/): Directorio principal de documentación de producto, dominio y arquitectura global.
- [engineering/](file:///Users/yereth/Desktop/Commitment-v2/engineering/): Herramientas y estándares del flujo de ingeniería (Gobernanza activa, templates y prompts).
- [HANDBOOK.md](file:///Users/yereth/Desktop/Commitment-v2/HANDBOOK.md): Manual de Onboarding técnico y de estilo del proyecto.
