# MetricCard

## Propósito

Un número/valor corto + una etiqueta, sin tendencia ni gráfico. El miembro más chico de la familia
de métricas (`MetricCard` → `StatCard` → `ProgressMetric`) — para grillas de 3-5 conteos rápidos
("12 Goals · 84% · 32 Tasks · 7 Habits").

## Cuándo usarlo

- Un conteo simple sin contexto histórico (cuántos Goals activos, cuántos Habits hoy).
- Grillas de métricas donde cada tile es autosuficiente, sin necesidad de comparar contra un período
  anterior.

## Cuándo NO usarlo

- Si el valor necesita mostrar una tendencia ("+12% vs. semana pasada") — usar `StatCard`.
- Si el valor es una proporción hacia una meta (0-100%) — usar `ProgressMetric`, que comunica
  progreso, no un conteo crudo.

## Ejemplos

```tsx
<MetricCard value={12} label="Goals" />
<MetricCard value="84%" i18nKey="insights:completion" tone="success" />
<MetricCard value={7} label="Habits" icon={<Flame size={16} />} tone="warning" onPress={openHabits} />
```

## Accesibilidad

- Cuando `onPress` está presente, se vuelve `accessibilityRole="button"` (heredado de `Card`,
  sobre el que está construido).
- El valor y la etiqueta se renderizan como texto plano — legibles nativamente por lectores de
  pantalla sin configuración adicional.

## Props públicas

```ts
type MetricCardProps = (
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never }
) & {
  value: string | number; // siempre pre-formateado por quien lo llama, MetricCard no formatea números
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'; // default 'neutral'
  icon?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
};
```

## Notas de implementación

- Construido por composición sobre `Card` (`variant="elevated"`, `padding="$3"`) — no reimplementa
  el shell de tarjeta.
