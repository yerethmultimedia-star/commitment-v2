import { DomainEvent, DomainEventMetadata } from '../../core/domain-event.interface.js';

/**
 * Records that an existing Commitment now belongs to this Goal.
 *
 * The link is owned entirely by Goal — Commitment's own aggregate,
 * events and persistence are untouched. This lets existing Commitments
 * become children of a Goal without a schema change or migration on the
 * Commitment side (VS-031 Product Experience Completion, Revision 2).
 */
export interface GoalCommitmentLinkedEventPayload {
  readonly goalId: string;
  readonly commitmentId: string;
}

export class GoalCommitmentLinkedEvent implements DomainEvent {
  public readonly name = 'goal.commitment_linked';
  public readonly metadata: DomainEventMetadata;
  public readonly payload: GoalCommitmentLinkedEventPayload;

  constructor(
    aggregateId: string,
    payload: GoalCommitmentLinkedEventPayload,
    occurredAt?: string
  ) {
    this.payload = payload;
    const time = occurredAt || new Date().toISOString();
    this.metadata = {
      eventId: '',
      aggregateId,
      aggregateVersion: 0,
      eventVersion: 1,
      occurredAt: time,
      recordedAt: time,
      actorType: 'SYSTEM',
      actorId: '',
      correlationId: '',
      causationId: '',
      tenantId: null
    };
  }
}
