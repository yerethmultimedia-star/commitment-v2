import * as crypto from 'crypto';
import { DomainEvent } from '@commitment/domain';
import { ActivityRecord } from '../models/activity.record';

export class ActivityFactory {
  static fromDomainEvent(event: DomainEvent): ActivityRecord {
    const id = crypto.randomUUID();
    const type = this.mapEventType(event.name);
    const commitmentId = event.metadata.aggregateId;
    const version = 1; // Start versioning at 1
    const occurredAt = new Date(event.metadata.occurredAt);

    // For now, actor is system or derived from payload if available
    const payload = event.payload as Record<string, unknown>;
    const actor =
      (typeof payload?.identityId === 'string'
        ? payload.identityId
        : undefined) || 'system';

    const metadata = { ...payload };

    return new ActivityRecord(
      id,
      commitmentId,
      type,
      version,
      occurredAt,
      actor,
      metadata,
    );
  }

  private static mapEventType(domainEventName: string): string {
    switch (domainEventName) {
      case 'commitment.registered':
        return 'created';
      case 'commitment.activated':
        return 'activated';
      case 'commitment.paused':
        return 'paused';
      case 'commitment.resumed':
        return 'resumed';
      case 'commitment.completed':
        return 'completed';
      case 'commitment.cancelled':
        return 'cancelled';
      case 'commitment.renamed':
      case 'commitment.description_updated':
      case 'commitment.edited':
        return 'edited';
      default:
        return 'unknown';
    }
  }
}
