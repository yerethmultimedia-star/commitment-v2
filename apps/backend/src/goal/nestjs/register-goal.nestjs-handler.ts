import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterGoalCommand } from '../application/commands/register-goal.command';
import { RegisterGoalCommandHandlerCore } from '../application/commands/register-goal.handler';
import type { VersionedGoalRepository } from '../application/ports/versioned-goal-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@CommandHandler(RegisterGoalCommand)
export class RegisterGoalNestjsHandler implements ICommandHandler<RegisterGoalCommand> {
  private readonly core: RegisterGoalCommandHandlerCore;

  constructor(
    @Inject('GoalRepository')
    goalRepository: VersionedGoalRepository,
    @Inject('DomainEventDispatcher')
    eventDispatcher: DomainEventDispatcher,
    @InjectMetric('goals_created_total')
    goalsCounter: Counter<string>,
  ) {
    this.core = new RegisterGoalCommandHandlerCore(
      goalRepository,
      eventDispatcher,
      goalsCounter,
    );
  }

  async execute(command: RegisterGoalCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
