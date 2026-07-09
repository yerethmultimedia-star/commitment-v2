import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CommitmentRegisteredEvent,
  CommitmentActivatedEvent,
  CommitmentPausedEvent,
  CommitmentResumedEvent,
  CommitmentCompletedEvent,
  CommitmentCancelledEvent,
  CommitmentRenamedEvent,
  CommitmentDescriptionUpdatedEvent,
  CommitmentEditedEvent,
} from '@commitment/domain';
import {
  ACTIVITY_REPOSITORY,
  type ActivityRepository,
} from '../ports/activity.repository';
import { ActivityFactory } from '../factories/activity.factory';

const EVENT_CLASSES = [
  CommitmentRegisteredEvent,
  CommitmentActivatedEvent,
  CommitmentPausedEvent,
  CommitmentResumedEvent,
  CommitmentCompletedEvent,
  CommitmentCancelledEvent,
  CommitmentRenamedEvent,
  CommitmentDescriptionUpdatedEvent,
  CommitmentEditedEvent,
];

import { DomainEvent } from '@commitment/domain';

@EventsHandler(...EVENT_CLASSES)
export class ActivityLoggerHandler implements IEventHandler<
  DomainEvent<unknown>
> {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly repository: ActivityRepository,
  ) {}

  async handle(event: DomainEvent<unknown>) {
    const activity = ActivityFactory.fromDomainEvent(event);
    await this.repository.save(activity);
  }
}
