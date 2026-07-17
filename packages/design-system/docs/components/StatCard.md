# StatCard

## Propósito

Una métrica principal + un delta/tendencia opcional + un slot para un visual (gráfico, sparkline)
inyectado por quien lo usa. El miembro medio de la familia de métricas — para resúmenes tipo
"cómo voy en X este período" (generaliza el `StatCard` que ya existía en Insights).

## Cuándo usarlo

- Resúmenes semanales/periódicos con contexto de tendencia (Insights, Coach).
- Cualquier métrica donde "¿mejoró o empeoró?" es tan importante como el número en sí.

## Cuándo NO usarlo

- Un conteo simple sin tendencia — usar `MetricCard`, es el tamaño correcto para eso.
- Una proporción hacia una meta — usar `ProgressMetric`.

## Ejemplos

```tsx
// Sin delta ni visual — válido, StatCard no los exige
<StatCard value={45} label="Avg. focus (min)" />

// Con delta pre-traducido — StatCard NO arma el texto del delta
<StatCard
  value={84}
  i18nKey="insights:productivity"
  deltaLabel={t('insights.overview.deltaVsLastWeek', { sign: '+', count: 12 })}
  deltaTone="positive"
/>

// Con un visual inyectado (ej. un Sparkline propio de Insights)
<StatCard value={7} label="Streak" visual={<Sparkline points={weekPoints} />} />
```

## Accesibilidad

- Igual que `MetricCard`: `accessibilityRole="button"` cuando hay `onPress`, texto plano legible
  por defecto en el resto de los casos.

## Props públicas

```ts
type StatCardProps = (
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never }
) & {
  value: string | number;
  deltaLabel?: string; // texto ya resuelto/traducido por el Feature
  deltaTone?: 'positive' | 'negative' | 'neutral'; // default 'neutral' — solo colorea deltaLabel
  visual?: React.ReactNode; // ej. un Sparkline — StatCard solo reserva el layout
  onPress?: () => void;
  testID?: string;
};
```

## Notas de implementación

- **Decisión deliberada:** StatCard no traduce ni formatea `deltaLabel` — lo recibe ya resuelto.
  Un formateador genérico de "vs. período anterior" adentro del Design System seguiría siendo una
  asunción de dominio disfrazada de utilidad genérica. Esa composición (`t('insights.overview.
deltaVsLastWeek', {...})`) sigue viviendo en Insights, no acá.
- Construido por composición sobre `Card`.
