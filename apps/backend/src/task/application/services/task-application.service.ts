import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterTaskCommand } from '../commands/register-task.command';
import { RegisterTaskResult } from '../commands/register-task.result';
import { EditTaskCommand } from '../commands/edit-task.command';
import { CompleteTaskCommand } from '../commands/complete-task.command';
import { ReopenTaskCommand } from '../commands/reopen-task.command';
import { StartTaskCommand } from '../commands/start-task.command';
import { BlockTaskCommand } from '../commands/block-task.command';
import { UnblockTaskCommand } from '../commands/unblock-task.command';
import { CancelTaskCommand } from '../commands/cancel-task.command';
import { ReturnTaskToPendingCommand } from '../commands/return-task-to-pending.command';
import { DeleteTaskCommand } from '../commands/delete-task.command';
import { ChangePriorityTaskCommand } from '../commands/change-priority-task.command';
import { DuplicateTaskCommand } from '../commands/duplicate-task.command';
import { RelinkTaskGoalCommand } from '../commands/relink-task-goal.command';
import { RelinkTaskCommitmentCommand } from '../commands/relink-task-commitment.command';
import { CreateTaskDependencyCommand } from '../commands/create-task-dependency.command';
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

  async startTask(cmd: StartTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async blockTask(cmd: BlockTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async unblockTask(cmd: UnblockTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async cancelTask(cmd: CancelTaskCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async returnTaskToPending(cmd: ReturnTaskToPendingCommand): Promise<void> {
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

  async relinkGoal(cmd: RelinkTaskGoalCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async relinkCommitment(cmd: RelinkTaskCommitmentCommand): Promise<void> {
    await this.commandBus.execute(cmd);
  }

  async createTaskDependency(cmd: CreateTaskDependencyCommand): Promise<void> {
    await this.commandBus.execute(cmd);
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
