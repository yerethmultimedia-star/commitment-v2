import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Get,
  Query,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { z } from 'zod';
import * as crypto from 'crypto';

import { RegisterTaskCommand } from '../application/commands/register-task.command';
import { EditTaskCommand } from '../application/commands/edit-task.command';
import { CompleteTaskCommand } from '../application/commands/complete-task.command';
import { ReopenTaskCommand } from '../application/commands/reopen-task.command';
import { ArchiveTaskCommand } from '../application/commands/archive-task.command';
import { RestoreTaskCommand } from '../application/commands/restore-task.command';
import { DeleteTaskCommand } from '../application/commands/delete-task.command';
import { ChangePriorityTaskCommand } from '../application/commands/change-priority-task.command';
import { DuplicateTaskCommand } from '../application/commands/duplicate-task.command';
import { RegisterTaskResult } from '../application/commands/register-task.result';
import { ListTasksQuery } from '../application/queries/list-tasks.query';
import { GetDashboardQuery } from '../application/queries/get-dashboard.query';
import { DashboardViewModel } from '../application/queries/dashboard-view.dto';
import { TaskNotFoundQueryError } from '../application/queries/get-task-by-id.handler';
import { PaginatedTasks, TaskView } from '../application/queries/task-view.dto';
import { QuickCaptureCommand } from '../application/commands/quick-capture.command';
import { QuickCaptureResult } from '../application/commands/quick-capture.result';
import { QuickCaptureApplicationService } from '../application/services/quick-capture-application.service';
import { TaskApplicationService } from '../application/services/task-application.service';
import {
  TaskNotFoundError,
  TaskAlreadyCompletedError,
  TaskAlreadyArchivedError,
  TaskAlreadyDeletedError,
  TaskCannotBeReopenedError,
  TaskCannotBeRestoredError,
} from '@commitment/domain';

const uuidSchema = z.string().uuid('Invalid UUID format');

const quickCaptureSchema = z.object({
  text: z.string().min(1),
  source: z.string().default('unknown'),
  date: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
  identityId: z.string().uuid(),
});

const registerSchema = z.object({
  id: z.string().uuid(),
  identityId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedMinutes: z.number().min(0).default(0),
  dueDate: z.string().optional(),
  commitmentId: z.string().uuid().optional(),
  goalId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.any()).default({}),
});

const editSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  estimatedMinutes: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const completeSchema = z.object({
  actualMinutes: z.number().min(0).optional(),
});

const changePrioritySchema = z.object({
  priority: z.enum(['low', 'medium', 'high']),
});

@ApiTags('tasks')
@Controller('v1/tasks')
export class TasksController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly taskAppService: TaskApplicationService,
    private readonly quickCaptureService: QuickCaptureApplicationService,
  ) {}

  @Post('quick-capture')
  @ApiOperation({ summary: 'Quick capture user intention' })
  async quickCapture(@Body() body: unknown): Promise<QuickCaptureResult> {
    const parsed = quickCaptureSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    const cmd = new QuickCaptureCommand(
      parsed.data.text,
      parsed.data.source,
      parsed.data.identityId,
      parsed.data.date,
      parsed.data.context,
    );

    return this.quickCaptureService.execute(cmd);
  }

  @Get('dashboard/:identityId')
  @ApiOperation({ summary: 'Get task-based dashboard view model' })
  async dashboard(
    @Param('identityId') identityId: string,
  ): Promise<DashboardViewModel> {
    if (!uuidSchema.safeParse(identityId).success)
      throw new BadRequestException('Invalid identity ID');
    return this.queryBus.execute(new GetDashboardQuery(identityId));
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of tasks' })
  async list(
    @Query('identityId') identityId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('dueBefore') dueBefore?: string,
    @Query('dueAfter') dueAfter?: string,
    @Query('commitmentId') commitmentId?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTasks> {
    return this.taskAppService.listTasks(
      new ListTasksQuery(
        identityId,
        status,
        priority,
        dueBefore,
        dueAfter,
        commitmentId,
        search,
        sort,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task view' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getById(@Param('id') id: string): Promise<TaskView> {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) throw new BadRequestException('Invalid task ID');

    try {
      return await this.taskAppService.getTaskById(id);
    } catch (err) {
      if (err instanceof TaskNotFoundQueryError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  async create(@Body() body: unknown): Promise<RegisterTaskResult> {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    const cmd = new RegisterTaskCommand(
      parsed.data.id,
      parsed.data.identityId,
      parsed.data.title,
      parsed.data.description,
      parsed.data.priority,
      parsed.data.estimatedMinutes,
      parsed.data.dueDate,
      parsed.data.commitmentId,
      parsed.data.goalId,
      parsed.data.tags,
      parsed.data.metadata,
    );

    return this.taskAppService.registerTask(cmd);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 204, description: 'Task updated' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async edit(@Param('id') id: string, @Body() body: unknown): Promise<void> {
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) throw new BadRequestException('Invalid task ID');

    const parsed = editSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    try {
      await this.taskAppService.editTask(
        new EditTaskCommand(
          id,
          parsed.data.title,
          parsed.data.description,
          parsed.data.estimatedMinutes,
          parsed.data.tags,
          parsed.data.metadata,
        ),
      );
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async complete(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const parsed = completeSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    try {
      await this.taskAppService.completeTask(
        new CompleteTaskCommand(id, parsed.data.actualMinutes),
      );
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof TaskAlreadyCompletedError)
        throw new ConflictException(err.message);
      if (err instanceof TaskAlreadyArchivedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: 'Reopen a completed task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async reopen(@Param('id') id: string): Promise<void> {
    try {
      await this.taskAppService.reopenTask(new ReopenTaskCommand(id));
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof TaskCannotBeReopenedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(@Param('id') id: string): Promise<void> {
    try {
      await this.taskAppService.archiveTask(new ArchiveTaskCommand(id));
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof TaskAlreadyArchivedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore an archived task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async restore(@Param('id') id: string): Promise<void> {
    try {
      await this.taskAppService.restoreTask(new RestoreTaskCommand(id));
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof TaskCannotBeRestoredError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  async duplicate(@Param('id') id: string): Promise<RegisterTaskResult> {
    try {
      return await this.taskAppService.duplicate(
        new DuplicateTaskCommand(id, crypto.randomUUID()),
      );
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof TaskAlreadyDeletedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Patch(':id/priority')
  @ApiOperation({ summary: 'Change task priority' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePriority(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const parsed = changePrioritySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    try {
      await this.taskAppService.changePriority(
        new ChangePriorityTaskCommand(id, parsed.data.priority),
      );
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.taskAppService.deleteTask(new DeleteTaskCommand(id));
    } catch (err) {
      if (err instanceof TaskNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof TaskAlreadyDeletedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }
}
