import type { DomainEvent, EventStore } from '@commitment/domain';
import { GetGoalHistoryQuery } from './get-goal-history.query';
import { GoalHistoryEntryDto } from '../../api/dtos/goal-history-entry.dto';

function summarize(event: DomainEvent): string {
  const payload = event.payload as Record<string, unknown>;
  switch (event.name) {
    case 'goal.registered':
      return `Goal "${String(payload.title)}" was created`;
    case 'goal.renamed':
      return `Renamed to "${String(payload.title)}"`;
    case 'goal.completed':
      return 'Goal completed';
    case 'goal.archived':
      return 'Goal archived';
    case 'goal.commitment_linked':
      return `Linked commitment ${String(payload.commitmentId)}`;
    case 'goal.habit_linked':
      return `Linked habit ${String(payload.habitId)}`;
    default:
      return event.name;
  }
}

export class GetGoalHistoryQueryHandlerCore {
  constructor(private readonly eventStore: EventStore) {}

  public async handle(
    query: GetGoalHistoryQuery,
  ): Promise<GoalHistoryEntryDto[]> {
    const events = await this.eventStore.getEvents(query.goalId);

    return events.map(
      (event) =>
        new GoalHistoryEntryDto(
          event.name,
          event.metadata.occurredAt,
          event.metadata.eventVersion,
          summarize(event),
          event.payload as Record<string, unknown>,
        ),
    );
  }
}
