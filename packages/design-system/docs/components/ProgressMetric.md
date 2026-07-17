# ProgressMetric

## Propósito

Un valor expresado como **progreso hacia una meta** (0..1), no un conteo crudo — esa distinción es
por qué no es simplemente `MetricCard` con un signo de porcentaje. El miembro más rico de la
familia de métricas. Generaliza `features/goals/components/CircularProgress.tsx` (que sigue
existiendo sin cambios — migrar sus usos a `ProgressMetric` es una decisión de Fase B, no tomada
todavía) y agrega una variante lineal.

## Cuándo usarlo

- Progreso de un Goal/Milestone hacia su meta.
- Cualquier "X de Y completado" expresado como proporción, no como conteo.

## Cuándo NO usarlo

- Un conteo simple — `MetricCard`.
- Una tendencia periódica — `StatCard`.

## Ejemplos

```tsx
// Circular (default), con label
<ProgressMetric progress={0.72} i18nKey="goals:weeklyProgress" tone="accent" />

// Lineal, chica, sin porcentaje visible
<ProgressMetric progress={0.5} variant="linear" size="small" showPercentage={false} label="3/6 tasks" />

// Sin ningún texto — solo el anillo con su porcentaje
<ProgressMetric progress={0.4} tone="warning" />
```

## Accesibilidad

- El texto de porcentaje (`72%`) se renderiza como texto plano, legible nativamente.
- La etiqueta opcional (`i18nKey`/`label`) es completamente opcional — a diferencia de `Badge`/
  `StatusIndicator`, `ProgressMetric` puede no llevar ningún texto descriptivo si el contexto ya lo
  deja claro (ej. dentro de una `GoalCard` que ya tiene su propio título).

## Props públicas

```ts
type ProgressMetricProps = (
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never }
  | { i18nKey?: never; label?: never; i18nParams?: never }
) & {
  // el label es opcional — 3 formas válidas
  progress: number; // 0..1, se clampea automáticamente
  variant?: 'circular' | 'linear'; // default 'circular'
  size?: 'small' | 'medium' | 'large'; // default 'medium'
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'; // default 'accent'
  showPercentage?: boolean; // default true
  testID?: string;
};
```

## Notas de implementación

- **Pendiente de revisión arquitectónica (no ahora):** hoy `ProgressMetric` conoce internamente
  `circular`/`linear` vía un switch. Cuando aparezca un segundo consumidor real de cada variante
  (candidatos: Coach para `circular`, Calendar para `linear`), evaluar separar en `ProgressRing` +
  `ProgressBar` de bajo nivel, con `ProgressMetric` componiendo uno de los dos — evita que este
  componente crezca en condicionales indefinidamente. No se hizo ahora por falta de un segundo
  consumidor concreto que justifique la división.
- El texto de porcentaje usa un literal `${Math.round(progress*100)}%`, no `Intl.NumberFormat` —
  heredado sin cambios del `CircularProgress` original que generaliza, consistente con la
  prohibición de `Intl` directo en las vistas del proyecto.
