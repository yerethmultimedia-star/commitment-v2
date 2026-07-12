import {
  Task,
  TaskId,
  TaskTitle,
  TaskDescription,
  TaskPriority,
  PriorityType,
  CommitmentId,
  IdentityId,
} from '@commitment/domain';
import { RegisterTaskCommand } from './register-task.command';
import { RegisterTaskResult } from './register-task.result';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class RegisterTaskCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: RegisterTaskCommand,
  ): Promise<RegisterTaskResult> {
    // Idempotency check
    const id = new TaskId(command.id);
    const existing = await this.taskRepository.findById(id);
    if (existing) {
      const version = await this.taskRepository.save(existing);
      return new RegisterTaskResult(existing.id.value, version);
    }

    const identityId = new IdentityId(command.identityId);
    const title = new TaskTitle(command.title);
    const description = command.description
      ? new TaskDescription(command.description)
      : null;
    const priority = new TaskPriority(
      TaskPriority.isValid(command.priority)
        ? (command.priority as PriorityType)
        : PriorityType.Medium,
    );
    const dueDate = command.dueDate ? new Date(command.dueDate) : null;
    const commitmentId = command.commitmentId
      ? new CommitmentId(command.commitmentId)
      : null;

    const task = Task.register(
      id,
      identityId,
      title,
      description,
      priority,
      command.estimatedMinutes,
      dueDate,
      commitmentId,
      command.goalId ?? null,
      command.tags,
      command.metadata,
    );

    const version = await this.taskRepository.save(task);

    const events = task.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    task.clearUncommittedEvents();

    return new RegisterTaskResult(task.id.value, version);
  }
}
