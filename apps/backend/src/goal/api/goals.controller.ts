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
import { CompleteGoalCommand } from '../application/commands/complete-goal.command';
import { CompleteGoalResult } from '../application/commands/complete-goal.result';
import {
  GoalNotFoundError as CompleteGoalNotFoundError,
  GoalStateConflictError as CompleteGoalStateConflictError,
} from '../application/commands/complete-goal.handler';
import { ArchiveGoalCommand } from '../application/commands/archive-goal.command';
import { ArchiveGoalResult } from '../application/commands/archive-goal.result';
import { GoalNotFoundError as ArchiveGoalNotFoundError } from '../application/commands/archive-goal.handler';
import { GetGoalByIdQuery } from '../application/queries/get-goal-by-id.query';
import { GoalNotFoundQueryError } from '../application/queries/get-goal-by-id.handler';
import { ListGoalsQuery } from '../application/queries/list-goals.query';
import { GoalView, PaginatedGoals } from '../application/queries/goal-view.dto';

const registerSchema = z.object({
  id: z.string().uuid('Invalid goal id UUID format'),
  identityId: z.string().uuid('Invalid identity id UUID format'),
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
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
}
