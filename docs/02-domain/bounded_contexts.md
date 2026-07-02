# ARQUITECTURA DE DOMINIO — BOUNDED CONTEXTS Y CONTEXT MAP
**Versión:** 2.0 (Definitiva y Documento Congelado con Refinamientos DDD)  
**Fecha:** Junio 2026  
**Estado:** Contrato Técnico de Dominio (Fase 5.5)  

---

## 🏗️ 1. DEFINICIÓN DE BOUNDED CONTEXTS (CONTEXTOS ACOTADOS)

Commitment se divide en **6 Bounded Contexts** independientes que garantizan la separación de responsabilidades y la modularidad del código:

```
                        ┌───────────────────────────────────┐
                        │    IDENTITY & PROFILE CONTEXT     │
                        └─────────────────┬─────────────────┘
                                          │ (Alinea valores)
                                          ▼
┌─────────────────────────────────────────┴─────────────────────────────────────────┐
│                     COMMITMENT LIFECYCLE & EXECUTION CONTEXT                      │
└───────┬─────────────────────────────────┬─────────────────────────────────┬───────┘
        │ (Genera eventos)                │ (Alimenta aprendizaje)          │ (Notifica estado)
        ▼                                 ▼                                 ▼
┌───────┴─────────────────┐     ┌─────────┴───────────────┐     ┌───────────┴───────┐
│   RESILIENCE CONTEXT    │     │  WISDOM ARCHIVE CONTEXT │     │  SOCIAL CONTEXT   │
│   (Rescate/Adaptación)  │     │   (Biblioteca de Vida)  │     │  (Red de Apoyo)   │
└───────┬─────────────────┘     └─────────┬───────────────┘     └───────────────────┘
        │                                 │
        └────────────────┬────────────────┘
                         ▼
        ┌─────────────────────────────────┐
        │   INSIGHTS & ANALYTICS CONTEXT  │
        └─────────────────────────────────┘
```

### Contexto A: Identity & Profile (Contexto de Identidad)
*   **Responsabilidad:** Administrar los valores, el perfil operativo (Ritmo) y el Ancla de Identidad del usuario.
*   **Entidades Principales:** Usuario (Root Aggregate), Perfil de Vida, Ancla de Identidad, Sistema de Valores.

### Contexto B: Commitment Lifecycle & Execution (Contexto de Ejecución)
*   **Responsabilidad:** El motor de ejecución diario. Gestiona la máquina de estados de los compromisos, objetivos y microacciones atómicas.
*   **Entidades Principales:** Compromiso (Root Aggregate), Objetivo, Proyecto, Blueprint, Microacción.

### Contexto C: Resilience & Adaptation (Contexto de Resiliencia)
*   **Responsabilidad:** Monitorear el nivel de fricción, disparar intervenciones de IA y gestionar el Modo Rescate.
*   **Entidades Principales:** Registro de Fricción (Aggregate), Rescate Resiliente, Evidencia de Resiliencia.

### Contexto D: Wisdom Archive (Contexto de Sabiduría y Biblioteca)
*   **Responsabilidad:** Gestionar el ritual de cierre, reflexiones e inmortalizar las cápsulas de aprendizaje.
*   **Entidades Principales:** Biblioteca de Vida (Root Aggregate), Cápsula de Aprendizaje, Reflexión Meta-cognitiva.

### Contexto E: Social Accompaniment (Contexto Social)
*   **Responsabilidad:** Administrar las invitaciones privadas y los mensajes empáticos de la Red de Apoyo.
*   **Entidades Principales:** Red de Apoyo (Root Aggregate), Invitación de Acompañamiento, Mensaje Empático.

### Contexto F: Insights & Analytics (Contexto de Analítica de Resiliencia)
*   **Responsabilidad:** Consolidar métricas de comportamiento a largo plazo (porcentaje de rescates completados, velocidad de recuperación, índice de constancia) de forma disociada para auditoría de producto y evolución del sistema.
*   **Entidades Principales:** Métrica de Transformación (Aggregate), Registro de Constancia, Historial de Crecimiento.

---

## 💎 2. ANATOMÍA Y LÍMITES DE LOS AGGREGATE ROOTS

Para asegurar la integridad del modelo, definimos los límites y responsabilidades de los agregados principales:

### Agregado: COMMITMENT (Root: Compromiso)
```
Commitment (Aggregate Root)
├── Ancla de Identidad (Inmutable)
├── Objetivo (Modificable)
│     └── Proyecto / Blueprint (Modificable)
├── Microacción (Modificable, Máx 3 activas)
└── Máquina de Estados (Modificable por Eventos)
```
*   **Qué puede modificarse:** Las microacciones diarias, el ritmo de velocidad de los proyectos y las transiciones del estado del compromiso.
*   **Qué NUNCA puede modificarse:** La identidad de la promesa original una vez activa (requiere el Flow de Evolución de Identidad) y el histórico de eventos pasados.
*   **Invariantes que protege:**
    *   *Invariante 1:* Nunca pueden existir más de 3 microacciones en estado `Pendiente` en el mismo día.
    *   *Invariante 2:* Un compromiso no puede transicionar a `Archivado` sin un evento asociado de `ReflexionRegistrada`.

---

## 🔒 3. OWNERSHIP (PROPIEDAD) DE EVENTOS DEL DOMINIO

Restringimos qué agregados están autorizados a emitir eventos de dominio para evitar la contaminación de lógica:

| Evento de Dominio | Aggregate Root Emisor (Owner) | Prohibido Emitir por |
| :--- | :--- | :--- |
| `CompromisoConcebido` | **Commitment Aggregate** | IA, Frontend, Biblioteca. |
| `PactoActivado` | **Commitment Aggregate** | IA, Red de Apoyo. |
| `MicroaccionEjecutada` | **Commitment Aggregate** | IA, Frontend, Red de Apoyo. |
| `FriccionDetectada` | **Resilience Aggregate** | Frontend, Red de Apoyo, IA. |
| `MensajeEmpaticoRecibido`| **Social Aggregate** | IA, Biblioteca. |
| `CapsulaInmortalizada` | **Wisdom Aggregate** | IA, Frontend. |

---

## 📡 4. CONTEXT CONTRACTS (CONTRATOS DE INTEGRACIÓN)

Definimos los eventos públicos y datos expuestos que los Bounded Contexts comparten entre sí:

### Contexto: Commitment Context
*   **Publica (Exporta):** `CompromisoConcebido`, `PactoActivado`, `MicroaccionEjecutada`, `CompromisoCompletado`, `CompromisoPausado`.
*   **Privado (Oculta):** Lógica interna de la máquina de estados, estructura interna de Proyectos/Blueprints y datos JSON de sub-tareas.

### Contexto: Resilience Context
*   **Publica (Exporta):** `RescateResilienteAceptado`, `FriccionDetectada`, `VictoriaDeRegresoRegistrada`.
*   **Privado (Oculta):** Lógica del algoritmo de detección de riesgo y puntuación de fricción acumulada.

---

## 🛡️ 5. CAPAS ANTICORRUPCIÓN (ANTICORRUPTION LAYERS - ACL)

Para aislar el núcleo puro de nuestro negocio de la infraestructura tecnológica, definimos 2 Capas Anticorrupción:

### A. Capa AI Contract ACL (LLM ──► ACL ──► Dominio)
*   **Propósito:** Evita que cambios en los payloads de APIs de OpenAI, Claude o Gemini afecten las entidades de Commitment.
*   **Diseño:** Un adaptador técnico traduce la salida cruda de la IA en un comando de dominio puro (`CrearBlueprintCommand` o `SugerirAdaptacionCommand`) validado sintácticamente antes de tocar el Agregado.

### B. Capa Persistence Adapter ACL (Supabase/DB ──► ACL ──► Dominio)
*   **Propósito:** Evita que el esquema de base de datos física o el SDK de Supabase contamine las reglas de negocio del Agregado.
*   **Diseño:** El Agregado de dominio es puramente local y en memoria. La base de datos Supabase actúa únicamente como un almacén de eventos (*Event Store*). El adaptador de persistencia recupera los eventos de la DB y reconstruye el estado actual del Agregado sin que este sepa que existe Supabase.

---

## 🔍 APARTADOS DE PRODUCT DISCOVERY (OBLIGATORIOS)

### 1. ⚠️ Riesgos (¿Qué puede salir mal?)
*   **Riesgo de Acoplamiento de Eventos:** Que un retraso en la entrega de eventos del Contexto de Ejecución al Contexto de Resiliencia retrase la pantalla de rescate. *(Mitigación: Los eventos se almacenan localmente y se procesan de forma asíncrona pero inmediata por el procesador de eventos local).*

### 2. 💡 Hipótesis (¿Qué estamos asumiendo sin validar?)
*   *Hipótesis 1:* Asumimos que separar el Contexto de Resiliencia del de Ejecución permite que el motor de IA de rescate sea totalmente intercambiable sin afectar el guardado local del compromiso.

### 3. 🧪 Experimentos Futuros (¿Cómo lo comprobaremos en el MVP?)
*   **Test de Latencia de Eventos Locales:** Medir que la transición de estado `Activo` ──► `EnFriccion` se procese en local en menos de 50 ms tras dispararse la condición de desvío.

---

## 📋 CHECKLIST DE INGENIERÍA (CONTRATO DE ARQUITECTURA)

*   **¿Puede implementarse sin ambigüedad?** Sí. Cada contexto define responsabilidades aisladas con comandos y eventos claros.
*   **¿Puede testearse automáticamente?** Sí. Al estar basados en comandos y eventos, se pueden realizar tests unitarios puros sobre agregados sin mocks de base de datos.
*   **¿Es independiente del proveedor tecnológico?** Sí. Los Bounded Contexts y el Context Map son lógica pura de dominio, totalmente agnósticos de Flutter o Supabase.
*   **¿Soporta offline?** Sí. El flujo de eventos locales y almacenamiento se gestiona por contexto usando persistencia SQLite local antes de sincronizar.
*   **¿Es compatible con Event Sourcing?** Sí. Los cambios de estado de los Agregados (Compromiso, Biblioteca) se disparan exclusivamente mediante la aplicación de eventos del dominio.
*   **¿Respeta la Constitución y sus invariantes?** Sí. El límite de 3 microacciones visibles y el principio de "El compromiso nunca se borra" se controlan en las invariantes de negocio del *Commitment Context*.
*   **¿Es observable y versionable?** Sí. Cada evento del dominio emitido contiene metadatos de versión y trazabilidad para auditoría y migraciones futuras de base de datos.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — BOUNDED CONTEXTS v2.0**
