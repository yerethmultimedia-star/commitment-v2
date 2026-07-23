/**
 * Thrown by a Versioned*Repository's save() when the aggregate being
 * persisted was loaded at a version that no longer matches what's actually
 * stored — a concurrent write happened in between load and save.
 *
 * Framework-agnostic by design (extends Error, not @nestjs/common's
 * ConflictException) — follows the same convention as the existing
 * *StateConflictError classes (e.g. GoalStateConflictError), not the
 * InMemoryEventStore's precedent of throwing a NestJS exception directly
 * from infrastructure. Controllers map this to HTTP 409 (see
 * ProblemDetailsExceptionFilter). See
 * docs/ARCHITECTURE_REMEDIATION/AR-028/ANALISIS.md for the full rationale.
 */
export class OptimisticConcurrencyError extends Error {
  constructor(
    public readonly aggregateId: string,
    public readonly loadedVersion: number,
    public readonly storedVersion: number,
  ) {
    super(
      `Optimistic concurrency conflict for aggregate '${aggregateId}': ` +
        `loaded at version ${loadedVersion}, but stored version is ${storedVersion}. ` +
        `The aggregate was modified by another operation after it was loaded.`,
    );
    this.name = 'OptimisticConcurrencyError';
  }
}
