# 🏛️ ADR-020: Quick Capture Philosophy

**Estado:** ✅ Aprobada (2026-07-17).

---

## Contexto

Fase 2B se abrió como un workstream de producto nuevo tras el cierre de ADR-019, con una sola
pregunta: _¿Quick Capture debe permitir crear Compromisos y, si es así, bajo qué filosofía de
producto?_

Investigación (Paso 1), evidencia directa del código:

- Quick Capture soporta hoy exactamente 4 tipos — `Objetivo`, `Hábito`, `Tarea`, `Nota` —, todos
  con un único campo de texto libre y sin flujo de enriquecimiento posterior en el propio diálogo
  (fire-and-forget).
- `Commitment` está excluido por una decisión de VS-031, anterior a ADR-019, cuyo único rastro es
  un comentario en código: "it lives inside a Goal's workspace." Ningún documento de producto
  define nunca una filosofía explícita de Quick Capture.
- `RI-8` (`TECH_DEBT.md`, encontrado 2026-07-16, un día antes de ADR-019) demuestra que incluso el
  mapeo pantalla→tipo por defecto no funcionaba hasta esa fecha — evolución orgánica vía corrección
  de bugs, no diseño deliberado.
- Fase 2A ya demostró, con evidencia del propio dominio, que `Commitment.register()` solo exige
  `title` — exactamente el mismo nivel de fricción técnica que `Goal`, ya soportado hoy en Quick
  Capture.
- Se encontró y registró (`TECH_DEBT.md` Item 34, Blocked by Fase 2B) una inconsistencia real: la
  pestaña de Goals renombrada "Compromisos" en Fase 1 sigue abriendo Quick Capture preseleccionado
  en "Tarea", porque el `source` interno nunca fue actualizado tras el rename.

Paso 2/3 (formulación y evaluación de alternativas) comparó cuatro filosofías mutuamente
excluyentes — Action Capture, Universal Capture, Contextual Capture, Layered Capture — contra seis
criterios explícitos (consistencia con ADR-019, coherencia de marca, fricción, descubribilidad,
escalabilidad, simplicidad del modelo mental). Universal Capture superó a las demás en 5 de 6
criterios, con evidencia concreta, no solo preferencia:

- **Action Capture** ya contradice el propio estado actual del código (Objetivo, que tampoco es una
  "acción inmediata", ya está incluido), y el argumento de fricción pierde fuerza frente a la
  evidencia de Fase 2A.
- **Contextual Capture** tiene evidencia empírica directa en contra como filosofía independiente:
  el mecanismo contextual que ya existe (`SOURCE_DEFAULT_TYPE`) produjo dos bugs reales — RI-8 y el
  propio Item 34 — al quedar desincronizado con cambios de superficie. Funciona como capa de
  presentación sobre Universal Capture, no como filosofía que decida qué existe.
- **Layered Capture** es una dirección de largo plazo válida pero depende de infraestructura
  (clasificación de intención, posiblemente Coach) que no existe hoy — fuera de alcance de esta
  fase, registrada como visión futura, no descartada.

## Decisión

**1. Quick Capture es el mecanismo universal de captura del producto.** Toda entidad de primer
nivel del modelo de dominio es elegible para Quick Capture siempre que pueda crearse con un
conjunto mínimo de información. El enriquecimiento posterior es parte explícita del flujo del
producto, no una excepción.

**2. `Commitment` pasa a formar parte de Quick Capture**, como consecuencia directa de la decisión
1 — no como una decisión aislada sobre un tipo específico. La implementación deriva de la
filosofía, no al revés.

La exclusión anterior de `Commitment` (VS-031) queda formalmente superada: no porque fuera
incorrecta en su momento, sino porque respondía a un modelo conceptual (Commitment "vive dentro" de
un Goal, sin existencia propia visible) que ADR-019 ya reemplazó.

## Regla para prevenir recurrencia

Cuando aparezca una nueva entidad de primer nivel en el dominio, la pregunta por defecto es "¿por
qué excluirla de Quick Capture?", no "¿por qué incluirla?". La carga de la prueba recae sobre la
exclusión, no sobre la inclusión — exactamente el argumento que resolvió esta ADR ("no encuentro
una propiedad especial que justifique que Compromiso sea el único concepto excluido").

## Alcance de la implementación (Fase 2B)

Limitado a lo que se deriva directamente de la filosofía aprobada:

- Agregar `commitment` como quinto tipo en `CAPTURE_TYPES`.
- Corregir `SOURCE_DEFAULT_TYPE` para la pestaña "Compromisos" — resuelve `TECH_DEBT.md` Item 34,
  que deja de estar bloqueado.
- Permitir que Coach pueda sugerir `commitment` como tipo de prefill (`QuickCapturePrefill['type']`
  ampliado) — las heurísticas de sugerencia en sí pueden permanecer iguales inicialmente.
- Mantener el principio de captura mínima: solo título, sin pedir Objetivo en el diálogo de Quick
  Capture. Si no puede inferirse un Objetivo desde el contexto, el Compromiso nace sin asociación y
  se completa después — el mismo patrón que Task/Habit ya siguen.

**Explícitamente fuera de alcance:** clasificación de intención, IA, o cualquier cambio al flujo
posterior a la captura (eso pertenece a la dirección "Layered Capture", registrada como visión
futura, no parte de esta decisión).

## Consecuencias

- **Positivas:** resuelve una asimetría sin justificación vigente; establece una regla estable para
  futuras entidades de primer nivel sin necesitar otra ADR cada vez; desbloquea `TECH_DEBT.md` Item 34.
- **Riesgo aceptado:** ninguno nuevo — el patrón de captura mínima + enriquecimiento posterior ya
  está validado en producción para Goal/Habit/Task.
- **Deuda evitada:** no se introduce un mecanismo de clasificación contextual adicional (Alternativa
  C), evitando repetir la fragilidad ya demostrada por `SOURCE_DEFAULT_TYPE`.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
