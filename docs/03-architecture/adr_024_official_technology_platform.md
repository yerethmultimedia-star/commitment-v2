# 🏛️ ADR-024: Arquitectura Oficial de Plataforma

**Estado:** ✅ Decidida (2026-07-20). **ADR retrospectiva** — formaliza una arquitectura que ya era
operativa desde 2026-07-02, sin haber sido documentada formalmente hasta ahora. Ver
`docs/03-architecture/ARCHITECTURE_TRANSITION_2026.md` para la cronología completa y la evidencia
histórica; este documento formaliza únicamente la decisión vigente, no narra cómo se llegó a ella.
Producto de **AR-001** (`docs/ARCHITECTURE_REMEDIATION/AR-001/ANALISIS.md`), la primera remediación
del programa Architecture Remediation v1.0. No requirió ningún cambio de código — es una remediación
exclusivamente de gobernanza.

---

## Contexto

ADR-001 a ADR-010 (`docs/01-product/adr/adr_001_to_010.md`, 2026-07-02) establecieron una arquitectura
de plataforma — Flutter, Supabase, Event Sourcing sobre PostgreSQL — que nunca llegó a gobernar la
implementación real. El commit que inicializó el backend real (`8900fee`, 2026-07-02, ~73 minutos
después de escribirse esas ADR) ya usaba NestJS, no Supabase. La Architecture Review v1.0
(`docs/ARCHITECTURE_REVIEW/`) encontró esta divergencia como su hallazgo más significativo; AR-001
investigó su origen y concluyó, con evidencia documental y de control de versiones, que no hubo una
decisión de sustitución formal — hubo dos líneas arquitectónicas paralelas desde el primer día del
proyecto, y ninguna institucionalizó su autoridad sobre la otra. El problema identificado fue de
**gobernanza, no de tecnología**: no se encontró evidencia de que NestJS, React Native, o BullMQ sean
malas decisiones técnicas.

Esta ADR resuelve la ambigüedad formalizando cuál arquitectura rige de aquí en adelante.

## Decisión

La arquitectura oficial de plataforma de Commitment, vigente de facto desde el 2026-07-02 y formalizada
hoy, es:

- **Frontend:** React Native + Expo (Expo Router, Tamagui).
- **Backend:** NestJS, arquitectura CQRS vía `@nestjs/cqrs`.
- **Mensajería / Colas:** BullMQ sobre Redis.
- **Persistencia:** **no incluida en esta decisión.** Sigue siendo una pregunta abierta, rastreada
  como **AR-028** (`docs/ARCHITECTURE_REMEDIATION/REMEDIATION_ROADMAP_V1.md`). Esta ADR no legitima ni
  descarta ningún motor de persistencia porque, a la fecha, ninguno está implementado — todo el estado
  de la aplicación vive en memoria.

## Justificación (requerida por ADR-011 para cambiar una Tecnología Preferida)

ADR-011 exige, para cualquier cambio de tecnología preferida, justificar: beneficios técnicos
tangibles, impacto en costos, complejidad de mantenimiento, y esfuerzo de migración. AR-001 evaluó
cada componente contra 8 criterios (escalabilidad, mantenibilidad, complejidad, costo, DX, seguridad,
evolución futura, alineación con la visión de producto), respondiendo la pregunta que elimina el sesgo
de continuidad: _si hoy empezáramos Commitment desde cero, con los requisitos actuales, ¿elegiríamos
esto?_

- **NestJS — sí.** La regla de dependencia se sostiene limpia (`packages/domain` sin dependencias de
  framework, sin dependencias circulares en el monorepo), los handlers son adaptadores delgados sobre
  clases de dominio agnósticas. La ausencia de autenticación (brecha real, rastreada por separado como
  AR-043) es una brecha de uso, no una limitación del framework — NestJS ya provee Guards/Passport de
  primera clase, simplemente nunca se activaron.
- **React Native + Expo — sí.** El argumento original de ADR-001 ("excelente soporte nativo para
  Motion Tokens y transiciones complejas sin caídas de framerate") ya se resolvió en la práctica: el
  sistema de física de resorte (`TECH_DEBT.md` RI-11/RI-12) está implementado y funcionando sobre
  RN + Tamagui, con valores de spring estandarizados a nivel de producto. No se encontró ningún
  requisito estratégico documentado (rendimiento extremo, renderizado custom, integración nativa
  crítica) que Flutter resolviera significativamente mejor hoy.
- **BullMQ + Redis — sí.** Sistema de notificaciones real, funcionando end-to-end, confirmado por
  métricas de producción reales (Prometheus/Grafana, Architecture Review Iteración 14).
- **Costo de revertir cualquiera de los tres hacia lo que decían ADR-001–010:** alto (re-entrenamiento
  de equipo, reescritura completa de dos aplicaciones), sin beneficio técnico compensatorio
  identificado en ninguna de las 20 iteraciones de la Architecture Review v1.0 ni en AR-001.

## Alternativas Rechazadas

- **Editar ADR-001–010 para que reflejen la arquitectura actual.** Rechazada: reescribe historia,
  elimina trazabilidad, impide reconstruir cómo evolucionó el proyecto.
- **Migrar la implementación real hacia lo que decían ADR-001–010 (Flutter / Supabase / Event
  Sourcing).** Rechazada: ningún hallazgo de la Architecture Review v1.0 ni de AR-001 identificó un
  requisito estratégico o defecto técnico que lo justifique; el costo de migración es alto sin
  beneficio compensatorio.
- **Dejar la ambigüedad sin resolver.** Rechazada: es precisamente la causa raíz que AR-001 investigó;
  perpetuarla mantiene al proyecto sin una autoridad arquitectónica única, y fue identificada como el
  nodo más conectado del grafo de dependencias de todo el programa de remediación (bloqueaba 10 de las
  otras 50 ARs).

## Relación con otras ADR

- **Reclasifica** la autoridad normativa de ADR-001, ADR-002, ADR-003, ADR-004, ADR-008 y ADR-009 (ver
  banner de reclasificación en `docs/01-product/adr/adr_001_to_010.md`) — su contenido no se modifica;
  dejan de ser la especificación vigente y pasan a registro histórico de la arquitectura inicial del
  proyecto (2026-07-02).
- ADR-005, ADR-006, ADR-007 y ADR-010 no quedan afectadas por esta ADR — no versan sobre plataforma
  tecnológica.
- **No reemplaza** ADR-021 (persistencia: CQRS de estado versionado, no Event Sourcing) — la
  complementa. ADR-021 ya había resuelto tácitamente la porción de persistencia de ADR-002/003/004;
  esta ADR formaliza el resto de la plataforma (frontend, backend, mensajería) que quedaba sin
  gobernanza explícita.
- Cumple el proceso que **ADR-011** exige para cambiar Tecnologías Preferidas.

## Impacto sobre el programa de remediación

Desbloquea, directa o transitivamente, las 10 ARs que dependían de esta decisión: AR-018, AR-025,
AR-027, AR-028, AR-043, AR-045, AR-046, AR-048, AR-049, AR-050 (ver
`docs/ARCHITECTURE_REMEDIATION/REMEDIATION_DASHBOARD.md` para el detalle Antes/Después).

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
