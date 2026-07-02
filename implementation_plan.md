# Plan de Implementación: Creación de Paquetes Compartidos en el Monorepo (Sprint 1)

Este plan detalla la creación e inicialización de la infraestructura compartida en el directorio `/packages` de acuerdo con las directivas del **Sprint 1 — Core Platform** y las reglas inviolables de Commitment v2.

## Justificación e Impacto Arquitectónico

- **Por qué se hace:** La **Regla #2 (Infrastructure First)** y la **Regla #13 (Si no es reutilizable no existe)** mandan crear infraestructura compartida antes que cualquier funcionalidad. Crear paquetes compartidos permite un desacoplamiento riguroso y promueve la reutilización de código (p. ej., reglas de dominio puro, contratos de API, tokens de diseño).
- **Riesgos y Mitigación:** Colisiones de dependencias entre espacios de trabajo. (Mitigación: Pinned dependencies y uso riguroso de referencias de workspace `workspace:*` en `package.json` locales).

---

## Proposed Changes

Crearemos la carpeta `packages/` con la siguiente estructura de paquetes:

```text
packages/
├── config/             # Configuración compartida de TypeScript y linters
├── shared/             # Utilidades, tipos helper y abstracciones comunes de software
├── domain/             # Dominio puro (Event Sourcing y CQRS Core) sin frameworks
├── api-contracts/      # Esquemas de entrada/salida y validaciones Zod compartidas
└── design-system/      # Tokens de diseño calmo (colores HSL, curvas de movimiento, fuentes)
```

Cada paquete contará con:

1. `package.json` configurado como módulo ES y exports definidos.
2. `tsconfig.json` extendiendo la configuración base compartida.
3. Build script usando `tsc` o bundles ligeros.
4. Archivo `README.md` documentando su propósito técnico.
5. Setup de pruebas Jest.
6. Código inicial de infraestructura (sin lógica de negocio).

---

### 1. Config Package (`@commitment/config`)

#### [NEW] [package.json](file:///Users/yereth/Desktop/Commitment-v2/packages/config/package.json)

#### [NEW] [tsconfig.base.json](file:///Users/yereth/Desktop/Commitment-v2/packages/config/tsconfig.base.json)

Configuración de TypeScript estricta reutilizable por los demás paquetes y aplicaciones.

#### [NEW] [README.md](file:///Users/yereth/Desktop/Commitment-v2/packages/config/README.md)

---

### 2. Shared Utilities Package (`@commitment/shared`)

#### [NEW] [package.json](file:///Users/yereth/Desktop/Commitment-v2/packages/shared/package.json)

#### [NEW] [tsconfig.json](file:///Users/yereth/Desktop/Commitment-v2/packages/shared/tsconfig.json)

#### [NEW] [README.md](file:///Users/yereth/Desktop/Commitment-v2/packages/shared/README.md)

#### [NEW] [index.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/shared/src/index.ts)

Exportará tipos comunes (p. ej. `Nullable`, `Optional`).

---

### 3. Domain Infrastructure Package (`@commitment/domain`)

#### [NEW] [package.json](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/package.json)

#### [NEW] [tsconfig.json](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/tsconfig.json)

#### [NEW] [README.md](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/README.md)

#### [NEW] [index.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/index.ts)

#### [NEW] [domain-event.interface.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/core/domain-event.interface.ts)

Contrato del envelope del evento de dominio según `event_catalog.md`.

#### [NEW] [aggregate-root.base.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/core/aggregate-root.base.ts)

Clase abstracta base de agregado para Event Sourcing.

#### [NEW] [event-store.interface.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/core/event-store.interface.ts)

Contrato abstracto para el Event Store.

#### [NEW] [cqrs.interface.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/core/cqrs.interface.ts)

Abstracciones para Command, Query y Handlers agnósticos.

---

### 4. API Contracts Package (`@commitment/api-contracts`)

#### [NEW] [package.json](file:///Users/yereth/Desktop/Commitment-v2/packages/api-contracts/package.json)

#### [NEW] [tsconfig.json](file:///Users/yereth/Desktop/Commitment-v2/packages/api-contracts/tsconfig.json)

#### [NEW] [README.md](file:///Users/yereth/Desktop/Commitment-v2/packages/api-contracts/README.md)

#### [NEW] [index.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/api-contracts/src/index.ts)

---

### 5. Design System Tokens Package (`@commitment/design-system`)

#### [NEW] [package.json](file:///Users/yereth/Desktop/Commitment-v2/packages/design-system/package.json)

#### [NEW] [tsconfig.json](file:///Users/yereth/Desktop/Commitment-v2/packages/design-system/tsconfig.json)

#### [NEW] [README.md](file:///Users/yereth/Desktop/Commitment-v2/packages/design-system/README.md)

#### [NEW] [index.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/design-system/src/index.ts)

#### [NEW] [colors.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/design-system/src/tokens/colors.ts)

Definición de tokens de paleta de colores calm HSL para ser usados o traducidos por Flutter/Tailwind.

---

## Verification Plan

### Automated Tests

- Ejecutar compilación de todos los paquetes usando `pnpm run build` en el root (vía Turborepo).
- Ejecutar linters globales `pnpm run lint` y verificar que pasen con 0 errores.
- Escribir pruebas unitarias en `packages/domain/src/core/__tests__/aggregate-root.spec.ts` para verificar la acumulación e hidratación de eventos.

### Manual Verification

- Comprobar que no existan dependencias cruzadas incorrectas o referencias de frameworks en `/packages`.
