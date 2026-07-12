import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterTaskCommand } from '../commands/register-task.command';
import { RegisterTaskResult } from '../commands/register-task.result';
import { EditTaskCommand } from '../commands/edit-task.command';
import { CompleteTaskCommand } from '../commands/complete-task.command';
import { ReopenTaskCommand } from '../commands/reopen-task.command';
import { ArchiveTaskCommand } from '../commands/archive-task.command';
import { RestoreTaskCommand } from '../commands/restore-task.command';
import { DeleteTaskCommand } from '../commands/delete-task.command';
import { ChangePriorityTaskCommand } from '../commands/change-priority-task.command';
import { DuplicateTaskCommand } from '../commands/duplicate-task.command';
import { GetTaskByIdQuery } from '../queries/get-task-by-id.query';
import { ListTasksQuery } from '../queries/list-tasks.query';
import { PaginatedTasks, TaskView } from '../queries/task-view.dto';

@Injectable()
export class TaskApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async registerTask(cmd: RegisterTaskCommand): Promise<RegisterTaskResult> {
    const result = await this.commandBus.execute<
      RegisterTaskCommand,
      RegisterTaskResult
    >(cmd);
    // Future orchestration steps: Emit Analytics, Notify AI Coach, etc.
    return result;
  }

  async editTask(cmd: EditTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async completeTask(cmd: CompleteTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async reopenTask(cmd: ReopenTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async archiveTask(cmd: ArchiveTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async restoreTask(cmd: RestoreTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async deleteTask(cmd: DeleteTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async changePriority(cmd: ChangePriorityTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async duplicate(cmd: DuplicateTaskCommand): Promise<RegisterTaskResult> {
    return this.commandBus.execute<DuplicateTaskCommand, RegisterTaskResult>(
      cmd,
    );
  }

  async getTaskById(id: string): Promise<TaskView> {
    return this.queryBus.execute<GetTaskByIdQuery, TaskView>(
      new GetTaskByIdQuery(id),
    );
  }

  async listTasks(query: ListTasksQuery): Promise<PaginatedTasks> {
    return this.queryBus.execute<ListTasksQuery, PaginatedTasks>(query);
  }
}
