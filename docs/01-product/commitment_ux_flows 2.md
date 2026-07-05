# ESPECIFICACIÓN FUNCIONAL Y UX FLOWS TRANSVERSALES DE COMMITMENT

**Versión:** 2.1 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Contrato Funcional Transversal para Producto, UX, IA, Ingeniería y QA

---

## PRINCIPIO SUPREMO DE AUTONOMÍA

> **La misión final de Commitment no es aumentar la dependencia del usuario hacia la plataforma, sino aumentar progresivamente su autonomía. Todo diseño deberá acercar al usuario a ese estado, incluso si eso implica una menor frecuencia de uso.**

---

## TABLA DE INMUTABILIDAD DEL DOMINIO

| Elemento del Dominio             | ¿Puede Modificarse? | Condiciones / Protocolo de Cambio                |
| :------------------------------- | :------------------ | :----------------------------------------------- |
| **Microacción**                  | Sí                  | Reducción atómica, postergación o compleción.    |
| **Blueprint**                    | Sí                  | Ajuste de pasos o rutinas sugeridas.             |
| **Ritmo**                        | Sí                  | Descubrimiento y recalibración continua por IA.  |
| **Objetivo / Proyecto**          | Sí                  | Reorganización táctica con confirmación.         |
| **Compromiso (Estado)**          | Sí                  | Transición formal por máquina de estados.        |
| **Ancla de Identidad**           | Sí (con reflexión)  | Requiere el Flow de Cambio de Identidad.         |
| **Eventos Históricos Emitidos**  | ❌ **NUNCA**        | Inmutables por arquitectura Event Sourcing.      |
| **Biblioteca de Vida Histórica** | ❌ **NUNCA**        | Registro inalterable de sabiduría y resiliencia. |

---

## MATRIZ RESUMEN DE TIEMPOS ESPERADOS Y KPIS POR FLOW

| Flow ID     | Nombre del Flujo                  | Duración Esperada   | KPI Principal de Éxito           | Eventos Principales Emitidos                       |
| :---------- | :-------------------------------- | :------------------ | :------------------------------- | :------------------------------------------------- |
| **FLOW 00** | **El "No Flow" (La Vida Real)**   | 0 segundos          | 100% Silencio Sistémico          | Ninguno (Respeto al silencio)                      |
| **FLOW 01** | **Primer Uso (FTUE & Pacto)**     | 2 a 4 minutos       | Compleción Onboarding >85%       | `CompromisoConcebido`, `PactoActivado`             |
| **FLOW 02** | **El Día Ordinario**              | **6 a 10 segundos** | Latencia Media <10s              | `MicroaccionEjecutada`                             |
| **FLOW 03** | **Ritual de Cierre & Archivo**    | 3 a 5 minutos       | Reflexiones completadas >80%     | `ReflexionRegistrada`, `CapsulaInmortalizada`      |
| **FLOW 04** | **Fricción y Rescate Resiliente** | 45 a 90 segundos    | Rescate exitoso >60%             | `FriccionDetectada`, `VictoriaDeRegresoRegistrada` |
| **FLOW 05** | **El Hijo Pródigo (Ausencia)**    | 1 a 2 minutos       | Usuarios reactivados >40%        | `CompromisoRe-alineado`                            |
| **FLOW 06** | **Fallo Técnico / Offline / LLM** | Inmediato (<2s)     | Zéro errores visibles al usuario | `ModoDegradadoActivado` / `EventoLocalGuardado`    |
| **FLOW 07** | **Acompañamiento de Red**         | 30 a 60 segundos    | Enlaces generados con éxito      | `InvitacionRedGenerada`, `MensajeRecibido`         |
| **FLOW 08** | **Soberanía de Datos**            | <30 segundos        | Descarga completa exitosa        | `SoberaniaEjercida`                                |
| **FLOW 09** | **El Día de la Autonomía**        | Infinito            | Trascendencia & Legado           | `LegadoConsolidado`                                |
| **FLOW 10** | **Cancelación Consciente**        | 1 a 2 minutos       | Desestimación sin culpa          | `CompromisoCanceladoConsciente`                    |
| **FLOW 11** | **Evolución de Identidad**        | 2 a 3 minutos       | Re-alineación de propósito       | `AnclaIdentidadEvolucionada`                       |
| **FLOW 12** | **Continuidad Multi-dispositivo** | Inmediato (<3s)     | Sincronización transparente      | `EstadoSincronizado`                               |

---

## DESGLOSE DE FLUIDEZ Y CASOS DE USO (ADENDA v2.1)

### 🟢 FLOW 00: El "No Flow" (La Vida Real)

- 🤖 **Triggers de IA:** TODOS PROHIBIDOS ❌. El usuario está viviendo su vida. Silencio Absoluto.

### 🟢 FLOW 02: El Día Ordinario (Check-in Calmo <10s)

- 🤖 **Triggers de IA:** PROHIBIDOS ❌. Abre espacio _Presente_ ──► Swipe calmo sobre micro-acción ──► Cierre automático en <10s.

### 🔴 FLOW 04: Fricción y Rescate Resiliente (El Momento Mágico)

- 🤖 **Triggers de IA:** ✓ Trigger #5 (Rescate por Riesgo). Oculta navegación ──► Presenta opción de 60s o Modo Recarga ──► Registra Victoria de Regreso.

### 🛡️ FLOW 06: Fallo Técnico, Offline Resilient y Caída de LLM

- 🤖 **Triggers de IA:** DESACTIVADOS ❌. El sistema muestra: _"Hoy continuaremos con tu último plan confirmado."_ Cero mensajes de error técnico.

### 🧘 FLOW 10: Cancelación Consciente (Desestimación Respetuosa)

- 🤖 **Triggers de IA:** ✓ Trigger #3 (Facilitar reflexión).
- ⏱️ **Tiempo Esperado:** 1 a 2 minutos. | 📈 **KPI:** Desestimación honesta sin sentimiento de fracaso.
- ⚡ **Eventos Emitidos:** `CompromisoCanceladoConsciente`, `AprendizajeCancelacionRegistrado`.
- 🔄 **Recorrido:** Usuario comprende que el compromiso ya no representa su identidad ──► Selecciona "Cancelar Compromiso" ──► IA pregunta socráticamente: _"¿Ha cambiado tu vida o simplemente cambió tu prioridad?"_ ──► Usuario responde ──► El compromiso pasa a `CanceladoConsciente` y la lección se guarda en la Biblioteca.

### 🧬 FLOW 11: Evolución de Identidad (Re-alineación Macro)

- 🤖 **Triggers de IA:** ✓ Trigger #1 y #2.
- ⏱️ **Tiempo Esperado:** 2 a 3 minutos. | 📈 **KPI:** Re-alineación profunda sin duplicar compromisos.
- ⚡ **Eventos Emitidos:** `AnclaIdentidadEvolucionada`.
- 🔄 **Recorrido:** Usuario evoluciona su propósito (ej. de _Atleta_ a _Padre Presente_) ──► Abre su Ancla de Identidad ──► Escribe su nueva visión ──► La IA ajusta suavemente los compromisos vinculados respetando la reflexión previa.

### 📲 FLOW 12: Continuidad Multi-dispositivo (Sincronización Silenciosa)

- 🤖 **Triggers de IA:** PROHIBIDOS ❌.
- ⏱️ **Tiempo Esperado:** Inmediato (<3s). | 📈 **KPI:** 100% Consistencia de estado sin diálogos de conflicto.
- ⚡ **Eventos Emitidos:** `EstadoSincronizado`.
- 🔄 **Recorrido:** Usuario ejecuta micro-acción en móvil ──► Abre cliente Web 5 segundos después ──► La interfaz Web ya refleja el estado actualizado silenciosamente sin toasts molestos ni recargas bruscas.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — UX FLOWS TRANSVERSALES v2.1**
