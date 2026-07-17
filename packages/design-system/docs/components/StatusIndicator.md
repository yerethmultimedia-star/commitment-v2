# StatusIndicator

## Propósito

Comunica **estado**, no importancia: online/offline, sincronizado/pendiente/fallido. Un punto de
color (opcionalmente + ícono) junto a un texto — visualmente liviano, a diferencia del pill con
fondo de `Badge`.

## Cuándo usarlo

- Estado de conexión/sincronización (online, offline, syncing).
- Estado de un proceso (pending, failed, completed) cuando NO se necesita el peso visual de un pill.
- Cualquier fila de lista donde el estado es secundario al contenido principal (ej. un ítem de
  Calendar cuyo tipo se indica con un punto de color, no un badge).

## Cuándo NO usarlo

- Para prioridad o categoría — eso es `Badge`, que comunica importancia, no estado.
- Cuando el estado necesita ser el foco visual principal del elemento — un pill (`Badge`) llama más
  la atención que un punto + texto.

## Ejemplos

```tsx
<StatusIndicator label="Online" tone="success" />
<StatusIndicator i18nKey="calendar:status.synced" tone="accent" />

// Sin punto, solo ícono
<StatusIndicator label="Offline" showDot={false} icon={<CloudOff size={14} />} tone="danger" />

// Vertical (punto arriba, texto abajo) — para grillas compactas
<StatusIndicator label="Failed" tone="danger" orientation="vertical" />

// Texto largo en un contenedor angosto (ej. una recomendación de Coach)
<StatusIndicator label="Necesita más de tu atención esta semana" truncate tone="warning" />
```

## Accesibilidad

- `accessibilityRole="text"` con `accessibilityLabel` — por defecto, el texto visible resuelto.
- `accessibilityLabelI18nKey` opcional para un nombre accesible distinto al texto visible.

## Props públicas

```ts
type StatusIndicatorProps = (
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never }
) & {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'; // default 'neutral'
  size?: 'small' | 'medium' | 'large'; // default 'medium'
  icon?: React.ReactNode;
  showDot?: boolean; // default true
  orientation?: 'horizontal' | 'vertical'; // default 'horizontal'
  truncate?: boolean; // default false
  accessibilityLabelI18nKey?: string;
  testID?: string;
};
```

## Notas de implementación

- Reutiliza el mismo mapeo de tono→token semántico que `Badge` (`$success`/`$warning`/`$danger`/
  `$info`/`$accent`) — un solo vocabulario de color entre ambos componentes, no dos independientes.
- Componente congelado — no se le agregarán más props sin un caso de uso concreto que lo justifique.
