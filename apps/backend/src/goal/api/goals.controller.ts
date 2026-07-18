import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  ConflictException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { z } from 'zod';
import { RegisterGoalDto } from './dtos/register-goal.dto';
import { RegisterGoalCommand } from '../application/commands/register-goal.command';
import { RegisterGoalResult } from '../application/commands/register-goal.result';
import { RenameGoalDto } from './dtos/rename-goal.dto';
import { RenameGoalCommand } from '../application/commands/rename-goal.command';
import { RenameGoalResult } from '../application/commands/rename-goal.result';
import {
  GoalNotFoundError as RenameGoalNotFoundError,
  GoalStateConflictError as RenameGoalStateConflictError,
} from '../application/commands/rename-goal.handler';
import { UpdateGoalDescriptionDto } from './dtos/update-goal-description.dto';
import { UpdateGoalDescriptionCommand } from '../application/commands/update-goal-description.command';
import { UpdateGoalDescriptionResult } from '../application/commands/update-goal-description.result';
import {
  GoalNotFoundError as UpdateGoalDescriptionNotFoundError,
  GoalStateConflictError as UpdateGoalDescriptionStateConflictError,
} from '../application/commands/update-goal-description.handler';
import { ActivateGoalCommand } from '../application/commands/activate-goal.command';
import { ActivateGoalResult } from '../application/commands/activate-goal.result';
import {
  GoalNotFoundError as ActivateGoalNotFoundError,
  GoalStateConflictError as ActivateGoalStateConflictError,
} from '../application/commands/activate-goal.handler';
import { CompleteGoalCommand } from '../application/commands/complete-goal.command';
import { CompleteGoalResult } from '../application/commands/complete-goal.result';
import {
  GoalNotFoundError as CompleteGoalNotFoundError,
  GoalStateConflictError as CompleteGoalStateConflictError,
} from '../application/commands/complete-goal.handler';
import { ArchiveGoalCommand } from '../application/commands/archive-goal.command';
import { ArchiveGoalResult } from '../application/commands/archive-goal.result';
import { GoalNotFoundError as ArchiveGoalNotFoundError } from '../application/commands/archive-goal.handler';
import { LinkCommitmentToGoalDto } from './dtos/link-commitment-to-goal.dto';
import { LinkCommitmentToGoalCommand } from '../application/commands/link-commitment-to-goal.command';
import { LinkCommitmentToGoalResult } from '../application/commands/link-commitment-to-goal.result';
import {
  GoalNotFoundError as LinkCommitmentGoalNotFoundError,
  GoalStateConflictError as LinkCommitmentGoalStateConflictError,
} from '../application/commands/link-commitment-to-goal.handler';
import { LinkHabitToGoalDto } from './dtos/link-habit-to-goal.dto';
import { LinkHabitToGoalCommand } from '../application/commands/link-habit-to-goal.command';
import { LinkHabitToGoalResult } from '../application/commands/link-habit-to-goal.result';
import {
  GoalNotFoundError as LinkHabitGoalNotFoundError,
  GoalStateConflictError as LinkHabitGoalStateConflictError,
} from '../application/commands/link-habit-to-goal.handler';
import { GetGoalByIdQuery } from '../application/queries/get-goal-by-id.query';
import { GoalNotFoundQueryError } from '../application/queries/get-goal-by-id.handler';
import { ListGoalsQuery } from '../application/queries/list-goals.query';
import { GoalView, PaginatedGoals } from '../application/queries/goal-view.dto';
import { GetGoalHistoryQuery } from '../application/queries/get-goal-history.query';
import { GoalHistoryEntryDto } from './dtos/goal-history-entry.dto';

const registerSchema = z.object({
  id: z.string().uuid('Invalid goal id UUID format'),
  identityId: z.string().uuid('Invalid identity id UUID format'),
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
});

const linkCommitmentSchema = z.object({
  commitmentId: z.string().uuid('Invalid commitment id UUID format'),
});

const linkHabitSchema = z.object({
  habitId: z.string().uuid('Invalid habit id UUID format'),
});

const uuidSchema = z.string().uuid('Invalid UUID format');

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async list(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedGoals> {
    const query = new ListGoalsQuery(status, search);
    return this.queryBus.execute(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<GoalView> {
    const result = uuidSchema.safeParse(id);
    if (!result.success) {
      throw new BadRequestException('Invalid UUID format');
    }

    try {
      const query = new GetGoalByIdQuery(id);
      return await this.queryBus.execute(query);
    } catch (error: unknown) {
      if (error instanceof GoalNotFoundQueryError) {
        throw new NotFoundException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string): Promise<GoalHistoryEntryDto[]> {
    const result = uuidSchema.safeParse(id);
    if (!result.success) {
      throw new BadRequestException('Invalid UUID format');
    }

    try {
      const query = new GetGoalHistoryQuery(id);
      return await this.queryBus.execute(query);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Register ─────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new goal' })
  @ApiResponse({ status: 200, description: 'Goal registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or domain violation',
  })
  async register(@Body() dto: RegisterGoalDto) {
    const parsed = registerSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
    }

    try {
      const command = new RegisterGoalCommand(
        dto.id,
        dto.identityId,
        dto.title,
        dto.description,
      );

      const result = (await this.commandBus.execute(
        command,
      )) as unknown as RegisterGoalResult;
      return {
        goalId: result.goalId,
        version: result.version,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Rename ───────────────────────────────────────────────────────────────

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rename a goal' })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiResponse({ status: 200, description: 'Goal renamed successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 409, description: 'Goal is immutable' })
  async rename(@Param('id') id: string, @Body() dto: RenameGoalDto) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new BadRequestException('Invalid goal UUID format');
    }

    try {
      const command = new RenameGoalCommand(id, dto.title);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as RenameGoalResult;
      return {
        goalId: result.goalId,
        title: result.title,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof RenameGoalNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof RenameGoalStateConflictError) {
        throw new ConflictException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Update Description ──────────────────────────────────────────────────
  // Goal Draft Editing (follow-up to Decisión B): the only way a Goal
  // created via Quick Capture (title only) can ever satisfy activate()'s
  // description invariant.

  @Patch(':id/description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update a goal's description" })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiResponse({
    status: 200,
    description: 'Goal description updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 409, description: 'Goal is immutable' })
  async updateDescription(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDescriptionDto,
  ) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new BadRequestException('Invalid goal UUID format');
    }

    try {
      const command = new UpdateGoalDescriptionCommand(id, dto.description);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as UpdateGoalDescriptionResult;
      return {
        goalId: result.goalId,
        description: result.description,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof UpdateGoalDescriptionNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof UpdateGoalDescriptionStateConflictError) {
        throw new ConflictException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Activate ─────────────────────────────────────────────────────────────

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a Draft goal' })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiResponse({ status: 200, description: 'Goal activated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({
    status: 409,
    description:
      'Goal is immutable, in an invalid state, or missing activation requirements (description, at least one linked Commitment)',
  })
  async activate(@Param('id') id: string) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new BadRequestException('Invalid goal UUID format');
    }

    try {
      const command = new ActivateGoalCommand(id);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as ActivateGoalResult;
      return {
        goalId: result.goalId,
        state: result.state,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof ActivateGoalNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ActivateGoalStateConflictError) {
        throw new ConflictException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Complete ─────────────────────────────────────────────────────────────

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a goal' })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiResponse({ status: 200, description: 'Goal completed successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 409, description: 'Goal is immutable' })
  async complete(@Param('id') id: string) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new BadRequestException('Invalid goal UUID format');
    }

    try {
      const command = new CompleteGoalCommand(id);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as CompleteGoalResult;
      return {
        goalId: result.goalId,
        state: result.state,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof CompleteGoalNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof CompleteGoalStateConflictError) {
        throw new ConflictException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Archive ──────────────────────────────────────────────────────────────

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a goal' })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiResponse({ status: 200, description: 'Goal archived successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async archive(@Param('id') id: string) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new BadRequestException('Invalid goal UUID format');
    }

    try {
      const command = new ArchiveGoalCommand(id);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as ArchiveGoalResult;
      return {
        goalId: result.goalId,
        state: result.state,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof ArchiveGoalNotFoundError) {
        throw new NotFoundException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Link Commitment ──────────────────────────────────────────────────────

  @Post(':id/commitments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link an existing Commitment to a Goal' })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiResponse({ status: 200, description: 'Commitment linked successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 409, description: 'Goal is immutable' })
  async linkCommitment(
    @Param('id') id: string,
    @Body() dto: LinkCommitmentToGoalDto,
  ) {
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) {
      throw new BadRequestException('Invalid goal UUID format');
    }
    const parsedBody = linkCommitmentSchema.safeParse(dto);
    if (!parsedBody.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: parsedBody.error.format(),
      });
    }

    try {
      const command = new LinkCommitmentToGoalCommand(id, dto.commitmentId);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as LinkCommitmentToGoalResult;
      return {
        goalId: result.goalId,
        commitmentIds: result.commitmentIds,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof LinkCommitmentGoalNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof LinkCommitmentGoalStateConflictError) {
        throw new ConflictException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Link Habit ───────────────────────────────────────────────────────────

  @Post(':id/habits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link an existing Habit to a Goal' })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiResponse({ status: 200, description: 'Habit linked successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 409, description: 'Goal is immutable' })
  async linkHabit(@Param('id') id: string, @Body() dto: LinkHabitToGoalDto) {
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) {
      throw new BadRequestException('Invalid goal UUID format');
    }
    const parsedBody = linkHabitSchema.safeParse(dto);
    if (!parsedBody.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: parsedBody.error.format(),
      });
    }

    try {
      const command = new LinkHabitToGoalCommand(id, dto.habitId);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as LinkHabitToGoalResult;
      return {
        goalId: result.goalId,
        habitIds: result.habitIds,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof LinkHabitGoalNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof LinkHabitGoalStateConflictError) {
        throw new ConflictException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }
}
