# CANONICAL DOMAIN DICTIONARY (LENGUAJE UBICUO)
**Versión:** 1.0 (Definitiva y Documento Congelado)  
**Fecha:** Junio 2026  
**Estado:** Glosario Técnico y Ontológico de Dominio (Fase 6.0)  

---

## 📖 GLOSARIO MAESTRO DE ENTIDADES Y CONCEPTOS

### 1. COMMITMENT (Compromiso)
*   **Definición Oficial:** Promesa solemne de transformación personal vinculada a la identidad y valores del usuario. Es la entidad raíz viva del dominio.
*   **Contexto Propietario:** *Commitment Lifecycle & Execution Context*.
*   **Sinónimos Prohibidos:** Task, Todo, Project, Habit Tracker, Meta genérica.
*   **Estado del Ciclo de Vida:** `Borrador` ──► `Activo` ──► `EnFriccion` / `EnAdaptacion` / `EnPausa` / `Recuperandose` ──► `Completado` ──► `Archivado`.
*   **Aggregate Owner:** *Commitment Aggregate (Root)*.

### 2. GOAL (Objetivo)
*   **Definición Oficial:** Hito o destino táctico y medible que desglosa un compromiso en etapas logrables.
*   **Contexto Propietario:** *Commitment Lifecycle & Execution Context*.
*   **Sinónimos Prohibidos:** Task, Milestone corporativo, Hábito.
*   **Aggregate Owner:** *Commitment Aggregate (Root)*.

### 3. PROJECT (Proyecto)
*   **Definición Oficial:** Contenedor de ejecución que agrupa un conjunto ordenado de micro-acciones y recursos para cumplir un objetivo.
*   **Contexto Propietario:** *Commitment Lifecycle & Execution Context*.
*   **Sinónimos Prohibidos:** Board, Epic, Sprint.
*   **Aggregate Owner:** *Commitment Aggregate (Root)*.

### 4. BLUEPRINT (Plano / Receta)
*   **Definición Oficial:** Plantilla metodológica reutilizable (paso a paso) que estructura la ejecución de un proyecto (`N1 Personal`, `N2 Compartido`, `N3 Verificado`).
*   **Contexto Propietario:** *Commitment Lifecycle & Execution Context*.
*   **Sinónimos Prohibidos:** Workflow, Template, Automatización.
*   **Aggregate Owner:** *Commitment Aggregate (Root)*.

### 5. MICROACTION (Microacción)
*   **Definición Oficial:** Unidad atómica, física e indivisible de ejecución diaria (duración <30 minutos) asignada al Presente.
*   **Contexto Propietario:** *Commitment Lifecycle & Execution Context*.
*   **Sinónimos Prohibidos:** Task, Subtask, To-Do item.
*   **Aggregate Owner:** *Commitment Aggregate (Root)*.

### 6. ANCHOR (Ancla de Identidad)
*   **Definición Oficial:** Declaración del porqué profundo y del valor de identidad asociado a un compromiso específico.
*   **Contexto Propietario:** *Identity & Profile Context*.
*   **Sinónimos Prohibidos:** Tag, Categoría, Descripción.
*   **Aggregate Owner:** *Usuario Aggregate (Root)*.

### 7. RHYTHM (Ritmo)
*   **Definición Oficial:** Entidad que representa la cadencia de ejecución biológica y de contexto del usuario, calculada para adaptar el esfuerzo.
*   **Contexto Propietario:** *Identity & Profile Context*.
*   **Sinónimos Prohibidos:** Frequency, Calendario, Agenda.
*   **Aggregate Owner:** *Usuario Aggregate (Root)*.

### 8. PAUSE (Pausa Consciente)
*   **Definición Oficial:** Estado temporal en el que las microacciones y notificaciones se congelan de forma planificada por el usuario sin penalización.
*   **Contexto Propietario:** *Commitment Lifecycle & Execution Context*.
*   **Sinónimos Prohibidos:** Cancelación, Inactividad.
*   **Aggregate Owner:** *Commitment Aggregate (Root)*.

### 9. RESCUE (Rescate Resiliente)
*   **Definición Oficial:** Intervención proactiva que reduce el esfuerzo de una microacción al mínimo atómico (60s) ante una fricción detectada.
*   **Contexto Propietario:** *Resilience & Adaptation Context*.
*   **Sinónimos Prohibidos:** Notificación de retraso, Recordatorio.
*   **Aggregate Owner:** *Registro de Fricción Aggregate (Root)*.

### 10. RECOVERY (Recuperación)
*   **Definición Oficial:** Estado de transición donde el usuario retoma el flujo activo tras ejecutar una acción de rescate.
*   **Contexto Propietario:** *Resilience & Adaptation Context*.
*   **Sinónimos Prohibidos:** Restart, Reinicio de racha.
*   **Aggregate Owner:** *Registro de Fricción Aggregate (Root)*.

### 11. RESILIENCE (Resiliencia)
*   **Definición Oficial:** La capacidad del sistema y del usuario de adaptarse y levantarse tras una fricción acumulada sin perder momentum.
*   **Contexto Propietario:** *Resilience & Adaptation Context*.
*   **Sinónimos Prohibidos:** Productividad, Velocidad.
*   **Aggregate Owner:** *Registro de Fricción Aggregate (Root)*.

### 12. LIFE LIBRARY (Biblioteca de Vida)
*   **Definición Oficial:** Activo acumulativo de sabiduría personal del usuario donde se almacenan sus cápsulas de aprendizaje.
*   **Contexto Propietario:** *Wisdom Archive Context*.
*   **Sinónimos Prohibidos:** History, Database, Log, Archivo de tareas.
*   **Aggregate Owner:** *Biblioteca de Vida Aggregate (Root)*.

### 13. LEARNING CAPSULE (Cápsula de Aprendizaje)
*   **Definición Oficial:** Registro estructurado de meta-cognición generado al finalizar o cancelar un compromiso.
*   **Contexto Propietario:** *Wisdom Archive Context*.
*   **Sinónimos Prohibidos:** Nota, Bitácora, Reflexión suelta.
*   **Aggregate Owner:** *Biblioteca de Vida Aggregate (Root)*.

### 14. VICTORY OF RETURN (Victoria de Regreso)
*   **Definición Oficial:** Evento inmutable de resiliencia que se registra cuando el usuario supera una fricción mediante un rescate.
*   **Contexto Propietario:** *Resilience & Adaptation Context*.
*   **Sinónimos Prohibidos:** Streak point, Check-in.
*   **Aggregate Owner:** *Registro de Fricción Aggregate (Root)*.

### 15. ACTIVE PLAN (Plan Activo)
*   **Definición Oficial:** La proyección táctica actual del compromiso (objetivos e hitos en curso) que se modula según el ritmo del usuario.
*   **Contexto Propietario:** *Commitment Lifecycle & Execution Context*.
*   **Sinónimos Prohibidos:** Backlog, Timeline.
*   **Aggregate Owner:** *Commitment Aggregate (Root)*.

### 16. CONTEXT (Contexto)
*   **Definición Oficial:** La capa de realidad temporal (burnout, vacaciones, mudanza) que modifica la sensibilidad del sistema.
*   **Contexto Propietario:** *Identity & Profile Context*.
*   **Sinónimos Prohibidos:** User Profile.
*   **Aggregate Owner:** *Usuario Aggregate (Root)*.

### 17. STATE (Estado del Dominio)
*   **Definición Oficial:** La condición formal en la que se encuentra una entidad del sistema en un instante de su ciclo de vida.
*   **Contexto Propietario:** Transversal a todo el dominio.
*   **Sinónimos Prohibidos:** Status en BD.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — CANONICAL DICTIONARY**
