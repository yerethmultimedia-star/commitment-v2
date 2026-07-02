# @commitment/domain

Core pure Domain infrastructure and abstractions for Commitment v2 (Event Sourcing & CQRS).

## Structure

- `core/`: Base abstractions:
  - `AggregateRoot`: State hydration and event collection.
  - `DomainEvent`: Envelope contracts for all historical occurrences.
  - `EventStore`: Storage contracts.
  - `CQRS`: Port handlers for Command & Query patterns.

## Installation

Add to package dependencies:

```json
"dependencies": {
  "@commitment/domain": "workspace:*"
}
```
