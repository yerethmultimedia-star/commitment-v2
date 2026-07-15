import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterHabitCommand } from '../commands/register-habit.command';
import { RegisterHabitResult } from '../commands/register-habit.result';
import { EditHabitCommand } from '../commands/edit-habit.command';
import { CompleteHabitCommand } from '../commands/complete-habit.command';
import { UncompleteHabitCommand } from '../commands/uncomplete-habit.command';
import { PostponeHabitCommand } from '../commands/postpone-habit.command';
import { EnableHabitCommand } from '../commands/enable-habit.command';
import { DisableHabitCommand } from '../commands/disable-habit.command';
import { ArchiveHabitCommand } from '../commands/archive-habit.command';
import { GetHabitByIdQuery } from '../queries/get-habit-by-id.query';
import { ListHabitsQuery } from '../queries/list-habits.query';
import { PaginatedHabits, HabitView } from '../queries/habit-view.dto';

@Injectable()
export class HabitApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async registerHabit(cmd: RegisterHabitCommand): Promise<RegisterHabitResult> {
    return this.commandBus.execute<RegisterHabitCommand, RegisterHabitResult>(
      cmd,
    );
  }

  async editHabit(cmd: EditHabitCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async completeHabit(cmd: CompleteHabitCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async uncompleteHabit(cmd: UncompleteHabitCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async postponeHabit(cmd: PostponeHabitCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async enableHabit(cmd: EnableHabitCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async disableHabit(cmd: DisableHabitCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async archiveHabit(cmd: ArchiveHabitCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async getHabitById(id: string): Promise<HabitView> {
    return this.queryBus.execute<GetHabitByIdQuery, HabitView>(
      new GetHabitByIdQuery(id),
    );
  }

  async listHabits(query: ListHabitsQuery): Promise<PaginatedHabits> {
    return this.queryBus.execute<ListHabitsQuery, PaginatedHabits>(query);
  }
}
