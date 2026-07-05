# EL CONTRATO CONDUCTUAL DE LOS PRIMEROS CINCO MINUTOS (FTUE SYSTEM)

**Versión:** 2.0 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Especificación Transversal de Onboarding para UX, IA, Frontend y QA

---

## REGLA SUPREMA DEL PRIMER CONTACTO

> **En los primeros 300 segundos, Commitment no busca vender ni enseñar un tutorial; busca demostrar empatía profunda y entregar el primer valor de claridad. La Biblioteca de Vida nace viva desde el minuto uno.**

---

## ⏱️ KPIS DE CONFIANZA Y TIEMPOS ESPERADOS

- **Time to First Value (TTFV):** **< 120 segundos.** (El usuario debe experimentar el momento _"Esta app realmente me entendió"_ antes del minuto 2).
- **Trust Moment Index:** Medición del instante exacto donde el usuario deja de evaluar y comienza a confiar.
- **Regla de Permisos Contextuales:** Queda prohibido solicitar notificaciones o accesos al abrir la app. Cada permiso se solicita **únicamente en el instante de uso real** (ej. notificaciones tras completar el primer compromiso).
- **Regla del Primer Silencio:** Tras el pacto inicial, la app se desvanece a silencio absoluto. Cero tutoriales pop-up, cero promociones, cero tips molestos. Solo _"Nos vemos mañana"_.

---

## 🌳 FTUE DECISION TREE (NARRATIVA NO LINEAL)

El sistema evalúa el perfil de entrada y adapta el recorrido a 4 arquetipos:

```
[ USUARIO ABRE COMMITMENT (Seguridad / Cero permisos) ]
                         │
                         ▼
             ¿Qué actitud demuestra?
                         │
      ┌──────────────────┼──────────────────┬──────────────────┐
      ▼                  ▼                  ▼                  ▼
[ JOURNEY A ]      [ JOURNEY B ]      [ JOURNEY C ]      [ JOURNEY D ]
 (Decidido)          (Con Prisa)        (Agotado)         (Escéptico)
      │                  │                  │                  │
Escribe texto      Usa chips táctiles  Responde "No sé /  Explora libremente
profundo           rápidos sin texto   No tengo energía"  sin responder aún
      │                  │                  │                  │
      └──────────────────┴──────────────────┴──────────────────┘
                         │
                         ▼
         [ SÍNTESIS DE EMPATÍA DE IA (<120s TTFV) ]
                         │
                         ▼
        [ BIBLIOTECA DE VIDA NACE VIVA (Memoria v1) ]
                         │
                         ▼
       [ 1 MICRO-ACCIÓN ATÓMICA HOY + PRIMER SILENCIO ]
```

### Detalle de los 4 Journeys Adaptativos:

- **Journey A (Decidido):** Expresa su intención libremente. IA responde con análisis profundo.
- **Journey B (Con Prisa):** Evita teclear. Usa chips táctiles de 1-tap. La IA acelera la propuesta atómica.
- **Journey C (Agotado Emocionalmente):** Responde _"Estoy cansado / No tengo energía"_. La IA no pide metas; ofrece el _Modo Recarga_ o una acción mental de 30 segundos.
- **Journey D (Escéptico / Explorador):** Omite preguntas. La app le permite ver la Biblioteca de muestra y explorar sin bloquear la interfaz.

---

## 🛡️ ABANDONO, OFFLINE Y REVERSIBILIDAD EN FTUE

1.  **Cero Decisiones Irreversibles:** Durante los primeros 5 minutos el usuario no puede cometer errores destructivos. Todo pacto o micro-acción es mutable y deshacible.
2.  **Continuidad ante Abandono:** Si el usuario cierra la app en el segundo 40 o 180, al regresar **reanuda exactamente en el mismo paso** sin perder nada ni recibir recriminaciones.
3.  **Offline desde el Minuto Uno:** Si la red se pierde en el segundo 70, la app guarda los eventos localmente y permite continuar. Al volver la conectividad, la IA consolida la síntesis silenciosamente.

---

## 🔍 FTUE LINTER (CHECKLIST DE QA)

| Regla de Validación FTUE                                          | Cumple (Sí / No) |
| :---------------------------------------------------------------- | :--------------- |
| 1. ¿El primer valor (TTFV) ocurre en menos de 120 segundos?       | [ ]              |
| 2. ¿La primera victoria se ejecuta antes de los 300 segundos?     | [ ]              |
| 3. ¿Cero permisos solicitados al abrir la app?                    | [ ]              |
| 4. ¿La Biblioteca de Vida nace inicializada con el primer porqué? | [ ]              |
| 5. ¿Es 100% no-lineal (soporta los 4 Journeys A, B, C, D)?        | [ ]              |
| 6. ¿Funciona en modo Offline Resilient durante el onboarding?     | [ ]              |
| 7. ¿Aplica la Regla del Primer Silencio tras el pacto?            | [ ]              |

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — FTUE SYSTEM v2.0**
