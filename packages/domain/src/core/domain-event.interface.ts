export interface DomainEventMetadata {
  readonly eventId: string; // UUIDv7
  readonly aggregateId: string; // UUIDv7
  readonly aggregateVersion: number;
  readonly eventVersion: number;
  readonly occurredAt: string; // ISO 8601
  readonly recordedAt: string; // ISO 8601
  readonly actorType: 'USER' | 'SYSTEM' | 'AI_PROPOSAL';
  readonly actorId: string; // UUIDv7
  readonly correlationId: string; // UUIDv7
  readonly causationId: string; // UUIDv7
  readonly tenantId: string | null;
}

export interface DomainEvent<TPayload = unknown> {
  readonly name: string; // e.g. 'commitment.lifecycle.conceived'
  readonly metadata: DomainEventMetadata;
  readonly payload: TPayload;
}
