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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { z } from 'zod';

import { RegisterHabitCommand } from '../application/commands/register-habit.command';
import { EditHabitCommand } from '../application/commands/edit-habit.command';
import { CompleteHabitCommand } from '../application/commands/complete-habit.command';
import { UncompleteHabitCommand } from '../application/commands/uncomplete-habit.command';
import { PostponeHabitCommand } from '../application/commands/postpone-habit.command';
import { EnableHabitCommand } from '../application/commands/enable-habit.command';
import { DisableHabitCommand } from '../application/commands/disable-habit.command';
import { ArchiveHabitCommand } from '../application/commands/archive-habit.command';
import { RegisterHabitResult } from '../application/commands/register-habit.result';
import { ListHabitsQuery } from '../application/queries/list-habits.query';
import { HabitNotFoundQueryError } from '../application/queries/get-habit-by-id.handler';
import {
  PaginatedHabits,
  HabitView,
} from '../application/queries/habit-view.dto';
import { HabitApplicationService } from '../application/services/habit-application.service';
import {
  HabitNotFoundError,
  HabitAlreadyArchivedError,
  HabitCannotBeEditedError,
  InvalidPostponeDurationError,
} from '@commitment/domain';

const uuidSchema = z.string().uuid('Invalid UUID format');

const recurrenceTypeSchema = z.enum([
  'Daily',
  'Workdays',
  'Weekly',
  'Biweekly',
  'Monthly',
  'Yearly',
]);

const registerSchema = z.object({
  id: z.string().uuid(),
  identityId: z.string().uuid(),
  title: z.string().min(1).max(100),
  recurrenceType: recurrenceTypeSchema,
  daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  month: z.number().int().min(0).max(11).optional(),
  reminderHour: z.number().int().min(0).max(23).default(9),
  reminderMinute: z.number().int().min(0).max(59).default(0),
  goalId: z.string().optional(),
});

const editSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  recurrenceType: recurrenceTypeSchema.optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  month: z.number().int().min(0).max(11).optional(),
  reminderHour: z.number().int().min(0).max(23).optional(),
  reminderMinute: z.number().int().min(0).max(59).optional(),
});

const completeSchema = z.object({
  onDate: z.string().optional(),
});

const postponeSchema = z.object({
  minutes: z.number().int().positive(),
});

@ApiTags('habits')
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitAppService: HabitApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'List habits with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of habits' })
  async list(
    @Query('identityId') identityId?: string,
    @Query('state') state?: string,
    @Query('goalId') goalId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedHabits> {
    return this.habitAppService.listHabits(
      new ListHabitsQuery(
        identityId,
        state,
        goalId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get habit by ID' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiResponse({ status: 200, description: 'Habit view' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  async getById(@Param('id') id: string): Promise<HabitView> {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) throw new BadRequestException('Invalid habit ID');

    try {
      return await this.habitAppService.getHabitById(id);
    } catch (err) {
      if (err instanceof HabitNotFoundQueryError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new habit' })
  @ApiResponse({ status: 201, description: 'Habit created' })
  async create(@Body() body: unknown): Promise<RegisterHabitResult> {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    const cmd = new RegisterHabitCommand(
      parsed.data.id,
      parsed.data.identityId,
      parsed.data.title,
      parsed.data.recurrenceType,
      parsed.data.daysOfWeek,
      parsed.data.dayOfMonth,
      parsed.data.month,
      parsed.data.reminderHour,
      parsed.data.reminderMinute,
      parsed.data.goalId,
    );

    try {
      return await this.habitAppService.registerHabit(cmd);
    } catch (err) {
      if (err instanceof Error) throw new BadRequestException(err.message);
      throw err;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a habit' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async edit(@Param('id') id: string, @Body() body: unknown): Promise<void> {
    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) throw new BadRequestException('Invalid habit ID');

    const parsed = editSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    try {
      await this.habitAppService.editHabit(
        new EditHabitCommand(
          id,
          parsed.data.title,
          parsed.data.recurrenceType,
          parsed.data.daysOfWeek,
          parsed.data.dayOfMonth,
          parsed.data.month,
          parsed.data.reminderHour,
          parsed.data.reminderMinute,
        ),
      );
    } catch (err) {
      if (err instanceof HabitNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof HabitCannotBeEditedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a habit occurrence' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async complete(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const parsed = completeSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    try {
      await this.habitAppService.completeHabit(
        new CompleteHabitCommand(id, parsed.data.onDate),
      );
    } catch (err) {
      if (err instanceof HabitNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof HabitCannotBeEditedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post(':id/uncomplete')
  @ApiOperation({ summary: 'Undo a habit completion' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async uncomplete(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const parsed = completeSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    try {
      await this.habitAppService.uncompleteHabit(
        new UncompleteHabitCommand(id, parsed.data.onDate),
      );
    } catch (err) {
      if (err instanceof HabitNotFoundError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  @Post(':id/postpone')
  @ApiOperation({ summary: 'Snooze a habit reminder by a number of minutes' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async postpone(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const parsed = postponeSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);

    try {
      await this.habitAppService.postponeHabit(
        new PostponeHabitCommand(id, parsed.data.minutes),
      );
    } catch (err) {
      if (err instanceof HabitNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof InvalidPostponeDurationError)
        throw new BadRequestException(err.message);
      if (err instanceof HabitCannotBeEditedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }

  @Patch(':id/enable')
  @ApiOperation({ summary: 'Re-enable a paused habit' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async enable(@Param('id') id: string): Promise<void> {
    try {
      await this.habitAppService.enableHabit(new EnableHabitCommand(id));
    } catch (err) {
      if (err instanceof HabitNotFoundError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  @Patch(':id/disable')
  @ApiOperation({ summary: 'Pause a habit' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async disable(@Param('id') id: string): Promise<void> {
    try {
      await this.habitAppService.disableHabit(new DisableHabitCommand(id));
    } catch (err) {
      if (err instanceof HabitNotFoundError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a habit' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(@Param('id') id: string): Promise<void> {
    try {
      await this.habitAppService.archiveHabit(new ArchiveHabitCommand(id));
    } catch (err) {
      if (err instanceof HabitNotFoundError)
        throw new NotFoundException(err.message);
      if (err instanceof HabitAlreadyArchivedError)
        throw new ConflictException(err.message);
      throw err;
    }
  }
}
