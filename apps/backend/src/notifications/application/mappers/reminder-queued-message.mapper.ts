import { Injectable } from '@nestjs/common';
import {
  ReminderQueuedEvent,
  IntegrationMessage,
  OutboxStatus,
} from '@commitment/domain';

@Injectable()
export class ReminderQueuedMessageMapper {
  public mapToIntegrationMessage(
    event: ReminderQueuedEvent,
  ): IntegrationMessage {
    return new IntegrationMessage(
      event.metadata.eventId, // Reuse eventId for messageId for traceability
      'ReminderQueued',
      'v1',
      event.metadata.aggregateId,
      event.metadata.aggregateVersion,
      new Date(event.metadata.occurredAt),
      {
        reminderId: event.payload.reminderId,
        commitmentId: event.payload.commitmentId,
        identityId: event.payload.identityId,
        scheduledFor: event.payload.scheduledFor,
      },
      event.metadata.correlationId,
      event.metadata.causationId,
      OutboxStatus.Pending,
      0,
      undefined,
      undefined,
    );
  }
}
