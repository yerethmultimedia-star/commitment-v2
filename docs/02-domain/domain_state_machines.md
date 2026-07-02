# FASE 6.1.5 — MÁQUINAS DE ESTADOS DEL DOMINIO (DOMAIN FSM)
**Versión:** 1.0 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Especificación de Transición de Estados de Dominio (Fase 6.1.5)  

---

## 🧭 1. ESPECIFICACIÓN DE LA MÁQUINA DE ESTADOS DEL COMPROMISO (COMMITMENT FSM)

El ciclo de vida de un compromiso se rige por una Máquina de Estados Finita (FSM) innegociable administrada por el Agregado `Compromiso`. Cada cambio de estado responde exclusivamente a un Comando e inmediatamente publica un Evento de Dominio.

```
                  [ Borrador ]
                       │
                       │ (ConcebirCompromiso / PactoActivado)
                       ▼
                  [ Activo ] ◄─────────────────────────┐
                   │  │  ▲                             │
 (FriccionDetectada)  │  │ (Reanudar)                  │
                   ▼  │  │                             │
          [ EnFriccion ] │                             │ (EjecutarMicroaccion
             │     │     │                             │  tras 3 días de constancia)
             │     │   [ EnPausa ]                     │
(Adaptar)    │     │     ▲                             │
             │     │     │ (DeclararPausa)             │
             ▼     ▼     │                             │
    [ EnAdaptacion ] ──► [ Recuperandose ] ────────────┘
             │                 │
             └────────┬────────┘
                      │ (CompletarCompromiso)
                      ▼
                 [ Completado ]
                      │ (RegistrarReflexion)
                      ▼
                 [ Archivado ]
```

---

## 📊 2. TABLA DE TRANSICIÓN DE ESTADOS DE DOMINIO

Esta tabla define el comportamiento exacto que el Agregado validará antes de realizar una transición de estado:

| Estado Actual | Comando Recibido (Input) | Precondiciones del Agregado | Evento de Dominio Emitido | Estado Siguiente |
| :--- | :--- | :--- | :--- | :--- |
| `Borrador` | `ConcebirCompromiso` | Ancla de Identidad definida sintácticamente. | `CompromisoConcebido` | `Borrador` (Hydrated) |
| `Borrador` | `ActivarCompromiso` | Primera micro-acción programada (<2 mins). | `PactoActivado` | `Activo` |
| `Activo` | `RegistrarFriccion` | Latencia > 48h o 3 reprogramaciones consecutivas. | `FriccionDetectada` | `EnFriccion` |
| `Activo` | `DeclararPausa` | El usuario declara un contexto de recarga. | `PausaConscienteDeclarada` | `EnPausa` |
| `EnFriccion` | `AdaptarCompromiso` | Plan adaptado propuesto por IA / Usuario. | `VelocidadAdaptada` | `EnAdaptacion` |
| `EnFriccion` | `AceptarRescate` | Usuario ejecuta la micro-acción de 60s. | `VictoriaDeRegresoRegistrada` | `Recuperandose` |
| `EnAdaptacion` | `AprobarPlanAdaptado` | El nuevo plan respeta el Interaction Budget. | `PlanAdaptadoAprobado` | `Activo` |
| `EnPausa` | `ReanudarCompromiso` | Fecha de pausa finalizada o reanudación explícita. | `CompromisoReanudo` | `Activo` |
| `Recuperandose`| `RegistrarMicroaccion` | 3 días consecutivos de microacciones completadas. | `ConsistenciaRecuperada` | `Activo` |
| `Activo` | `CompletarCompromiso` | Todos los objetivos e hitos alcanzados. | `CompromisoCompletado` | `Completado` |
| `Completado` | `RegistrarReflexion` | El usuario completa las 3 preguntas de reflexión. | `CapsulaInmortalizada` | `Archivado` |
| `Activo` | `CancelarCompromiso` | Usuario decide desestimar conscientemente la meta. | `CompromisoCanceladoConsciente` | `Archivado` |

---

## 📋 3. CLASIFICACIÓN DE COMANDOS DEL DOMINIO

Para mantener la seguridad y el control del flujo de ejecución, los comandos se clasifican en tres categorías operativas estrictas:

### A. Human Commands (Comandos Humanos)
*   **Definición:** Acciones directas originadas por la voluntad consciente del usuario.
*   **Ejemplos:** `ConcebirCompromiso`, `ActivarCompromiso`, `EjecutarMicroaccion`, `DeclararPausa`, `ReanudarCompromiso`, `RegistrarReflexion`, `CancelarCompromiso`.
*   **Regla:** Tienen prioridad absoluta sobre el estado y pueden saltarse estimaciones automáticas del sistema si se completan con éxito.

### B. System Commands (Comandos del Sistema)
*   **Definición:** Acciones automatizadas disparadas por las reglas del dominio o la infraestructura del sistema.
*   **Ejemplos:** `RegistrarFriccion` (disparado por el *ResilienceEvaluator* tras 48h de inactividad), `ReconstruirProyeccion` (disparado durante el Replay de eventos).
*   **Regla:** Solo se ejecutan si se cumplen las precondiciones inmutables de dominio.

### C. AI Commands (Propuestas de IA)
*   **Definición:** Sugerencias estructuradas generadas por los modelos de IA.
*   **Regla de Oro:** **La IA nunca emite un Comando de Dominio de forma directa.** Sus sugerencias (ej. adaptar un plan) se presentan al usuario en la UI como una **Propuesta**. Solo si el usuario toca *"Aceptar propuesta"*, se emite el Comando Humano correspondiente (`AprobarPlanAdaptado`).

---

## 🔍 APARTADOS DE PRODUCT DISCOVERY (OBLIGATORIOS)

### 1. ⚠️ Riesgos (¿Qué puede salir mal?)
*   **Riesgo de Estado Inválido por Eventos Desordenados (Fuera de Orden):** Que en escenarios multi-dispositivo y offline un evento `MicroaccionEjecutada` llegue después de que el compromiso se haya marcado como `EnPausa` en local. *(Mitigación: El Agregado valida la secuencia inmutable de eventos. Si un evento viola las transiciones permitidas por la FSM, se rechaza y se genera un evento de conciliación).*

### 2. 💡 Hipótesis (¿Qué estamos asumiendo sin validar?)
*   *Hipótesis 1:* Asumimos que automatizar la transición `Recuperandose` ──► `Activo` tras 3 días de constancia motiva al usuario sin requerir confirmación manual.

### 3. 🧪 Experimentos Futuros (¿Cómo lo comprobaremos en el MVP?)
*   **Test de Transiciones de QA:** Escribir pruebas unitarias parametrizadas que fuercen al agregado a recibir comandos en estados inválidos (ej. `AceptarRescate` estando en `Borrador`) para certificar que el sistema rechaza la transición en el 100% de los casos.

---

## 📋 CHECKLIST DE INGENIERÍA (CONTRATO DE ARQUITECTURA)

*   **¿Puede implementarse sin ambigüedad?** Sí. La tabla de transiciones define de forma matemática las entradas, salidas y precondiciones de cada estado.
*   **¿Es independiente del proveedor tecnológico?** Sí. La FSM se escribe como una clase de dominio pura en Dart/Flutter, libre de dependencias de interfaces de usuario o SDKs de base de datos.
*   **¿Es compatible con Event Sourcing?** Sí. El estado del agregado nunca se modifica por asignación directa (`state = active`); se modifica llamando al método `apply(Event)` que valida la FSM interna.
*   **¿Es observable y almacena historial?** Sí. Cada transición emite un evento inmutable registrado en el Event Store local y remoto.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — DOMAIN STATE MACHINES v1.0**
