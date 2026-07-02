# FASE 6.1 — MODELO DE DOMINIO PERSISTENTE
**Versión:** 2.0 (Definitiva y Documento Congelado con Refinamientos DDD)  
**Fecha:** Junio 2026  
**Estado:** Especificación de Persistencia y Dominio Técnico (Fase 6.1)  

---

## 📐 1. SEPARACIÓN DE MODELOS (CONCEPTUAL VS. PERSISTENCIA)

Para evitar que las limitaciones físicas de la base de datos o el motor de Supabase contaminen el diseño de negocio, Commitment establece una separación estricta en su arquitectura:

```
[ MODELO CONCEPTUAL ] ──► [ MODELO DE DOMINIO ] ──► [ MODELO DE PERSISTENCIA ] ──► [ MODELO FÍSICO ]
  (Ideación / UX)          (Agregados / VOs)         (Event Ledger / SQLite)      (Tablas PostgreSQL)
```
*   **Regla:** Un concepto del dominio (ej. `Microaccion`) no se mapea obligatoriamente 1-a-1 con una tabla física. En el modelo físico, las microacciones pueden almacenarse como eventos JSON dentro del *Event Store* o como proyecciones agregadas para el espacio *Presente*.

---

## 🆔 2. IDENTITY MAP DEL DOMINIO (UUID v7 CANÓNICOS)

Cada Aggregate Root y Entidad de dominio posee un identificador único canónico autodefinido:

*   **Identificadores:** `UserId`, `CommitmentId`, `GoalId`, `ProjectId`, `BlueprintId`, `MicroActionId`, `CapsuleId`, `ReflectionId`, `InvitationId`.
*   **Estándar Técnico:** Todos los IDs se generan en el cliente utilizando **UUID versión 7 (UUIDv7)**.
*   **Justificación:** Los UUIDv7 son ordenables cronológicamente de forma nativa por su timestamp integrado y son únicos a nivel global, lo que permite la creación de entidades en modo local (*Offline Resilient*) eliminando cualquier posibilidad de colisión al sincronizar con Supabase.

---

## 📦 3. ESQUEMA DE AGGREGATES, ENTIDADES Y VALUE OBJECTS (VO)

### A. Agregado: USUARIO (Root)
*   **Aggregate Root:** `Usuario` (Identificado por `UserId`).
*   **Entidades Internas:** `PerfilDeVida` (Identificado por `PerfilId`).
*   **Value Objects Propietarios:**
    *   `SistemaDeValores`: Lista inmutable de prioridades del usuario. *No puede existir fuera de Usuario*.
    *   `Ritmo`: Modelo de velocidad biológica calculada. *No puede existir fuera de Usuario*.
    *   `ContextoActivo`: Estado temporal (Burnout, Duelo, Vacaciones). *No puede existir fuera de Usuario*.

### B. Agregado: COMMITMENT (Root)
*   **Aggregate Root:** `Compromiso` (Identificado por `CommitmentId`).
*   **Entidades Internas:** `Objetivo` (`GoalId`), `Proyecto` (`ProjectId`), `Microaccion` (`MicroActionId`).
*   **Value Objects Propietarios:**
    *   `AnclaDeIdentidad`: El porqué profundo. *No puede existir fuera de Commitment*.
    *   `ActivePlan`: La ordenación temporal de hitos. *No puede existir fuera de Commitment*.
    *   `CompromisoEstado`: El estado de negocio del compromiso (`Activo`, `EnPausa`).

### C. Agregado: BIBLIOTECA DE VIDA (Root)
*   **Aggregate Root:** `BibliotecaDeVida` (Identificado por `BibliotecaId`).
*   **Entidades Internas:** `CapsulaDeAprendizaje` (`CapsuleId`).
*   **Value Objects Propietarios:**
    *   `Reflexion`: Texto meta-cognitivo. *No puede existir fuera de CapsulaDeAprendizaje*.
    *   `EvidenciaDeResiliencia`: Registro de regreso. *No puede existir fuera de BibliotecaDeVida*.

---

## ⏳ 4. INVARIANTES TEMPORALES Y DE NEGOCIO

### Invariantes de Negocio (Funcionales):
1.  **Límite Diario:** `Count(Microacciones.Where(State == Pending && Date == Today)) <= 3`.
2.  **Cierre Meta-cognitivo:** Un compromiso no puede pasar a `Archivado` sin la existencia y validación de una `Reflexion`.

### Invariantes Temporales:
1.  **Fecha Efectiva Obligatoria:** Una `Microaccion` nunca puede existir sin una fecha de ejecución definida en el tiempo.
2.  **Plan Activo Único:** Un `Commitment` nunca puede tener más de un `ActivePlan` operativo de forma simultánea.
3.  **Límites de Pausa:** Una `PausaConsciente` debe tener registrada obligatoriamente una fecha de inicio. Su fecha de fin puede ser indefinida o estimada.
4.  **Secuencia de Resiliencia:** El estado `Recuperandose` (Recovery) solo puede ser alcanzado si previamente el agregado transitó por el estado `EnFriccion` y existió una acción de `Rescate` (Rescue) aceptada.

---

## ⚙️ 5. SERVICIOS DE DOMINIO (DOMAIN SERVICES)

Para evitar el acoplamiento y mantener los Agregados livianos, se definen los siguientes **Domain Services** puros (sin estado):

1.  **`CommitmentPlanner`:** Orquesta la división de un Blueprint en proyectos y microacciones iniciales.
2.  **`RhythmCalculator`:** Analiza la latencia histórica de compleción para recalcular la velocidad adaptativa del usuario.
3.  **`ResilienceEvaluator`:** Mide silenciosamente la fricción acumulada para disparar el estado `EnFriccion`.
4.  **`RecoveryPlanner`:** Diseña la micro-acción atómica de rescate de 60s según la capacidad actual del usuario.
5.  **`BlueprintGenerator`:** Traduce las reflexiones finales del usuario en una estructura de Blueprint reutilizable.

---

## 🔄 6. ESTRATEGIA DE VERSIONADO EVOLUTIVO

Soportamos la evolución independiente del sistema dividiendo el versionado en 4 capas:

*   **`Domain Version`:** Versión global del contrato conceptual de Commitment (v1.2 actual).
*   **`Schema Version`:** Versión física de la estructura del *Event Store* y tablas PostgreSQL.
*   **`Aggregate Version`:** Versión incremental del estado interno del agregado en memoria para optimistic locking.
*   **`Event Version`:** Versión del payload de cada evento inmutable, permitiendo *upcasting* (mapeo de eventos antiguos a esquemas nuevos sin romper la historia).

---

## 📡 7. ESTADOS DE VIDA TÉCNICOS DEL AGREGADO

Independientemente de los estados de negocio, el Agregado de memoria posee 6 estados de ciclo de vida técnico:

1.  **`Created`:** Agregado instanciado en memoria con ID asignado, sin eventos aplicados.
2.  **`Hydrated`:** Agregado que ha aplicado con éxito todo su historial de eventos históricos desde el *Event Store*.
3.  **`Dirty`:** Agregado que ha recibido un comando y ha generado nuevos eventos en memoria no persistidos.
4.  **`Persisting`:** Eventos nuevos del agregado en proceso de escritura en el Event Store.
5.  **`Persisted`:** Eventos guardados con éxito. La versión en memoria se actualiza.
6.  **`Archived`:** Agregado cerrado y marcado para liberación de memoria RAM.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — MODELO DE DOMINIO PERSISTENTE v2.0**
