# Domain Shared Kernel Design

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

This document outlines the architectural components of the Shared Kernel inside the `@commitment/domain` package. The Shared Kernel provides framework-agnostic base types, utilities, and constraints for all Bounded Contexts.

---

## 🧱 Key DDD Components

### 1. Entities

An **Entity** represents an object defined by its identity rather than its attributes. It has a unique identifier that persists throughout its lifecycle.

- **Base Class:** `Entity<IdType>`
- **Equality:** Two entities are equal if and only if their unique identifiers are equal (`equals`).

### 2. Value Objects

A **Value Object** is defined by its attributes (props) rather than its identity. It is structurally immutable.

- **Base Class:** `ValueObject<T>`
- **Equality:** Value objects are equal if they share identical structural values.
- **Immutability:** Internal properties are frozen upon instantiation (`Object.freeze`).

### 3. Aggregate Roots

An **Aggregate Root** is a specialized Entity that binds together a cluster of associated objects. It enforces transactional consistency boundaries and is the sole entry point for modifications.

- **Base Class:** `AggregateRoot<IdType>`
- **Event Sourcing:** Manages an internal stream of uncommitted domain events. State is reconstructed from history using `loadFromHistory`.

---

## 📋 Architectural Concepts & Rules

### Business Rules Validation

- **Interface:** `BusinessRule`
- **Validation Utility:** `BusinessRuleValidator.check(rule)`
- Invariants are verified by implementing `BusinessRule`. If a rule is broken (`isBroken() === true`), a `BusinessRuleViolationException` is thrown.

### Specification Pattern

- **Base Class:** `Specification<T>`
- Used to construct reusable criteria evaluation queries. Can be logically composed using `.and(other)`, `.or(other)`, and `.not()`.

### Minimizing Side Effects

- Operations use a minimal `Result<T>` wrapper to return success states or explicit `DomainError` values without throwing exceptions for predictable errors.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial Domain Shared Kernel design documentation.
