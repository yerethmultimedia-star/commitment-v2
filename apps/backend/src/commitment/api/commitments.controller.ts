import {
  Controller,
  Post,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { z } from 'zod';
import { RegisterCommitmentDto } from './dtos/register-commitment.dto';
import { RegisterCommitmentCommand } from '../application/commands/register-commitment.command';
import { RegisterCommitmentResult } from '../application/commands/register-commitment.result';
import { ActivateCommitmentCommand } from '../application/commands/activate-commitment.command';
import { ActivateCommitmentResult } from '../application/commands/activate-commitment.result';
import { PauseCommitmentCommand } from '../application/commands/pause-commitment.command';
import { PauseCommitmentResult } from '../application/commands/pause-commitment.result';
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
  CommitmentStateTransitionError,
} from '../application/commands/activate-commitment.handler';
import {
  CommitmentNotFoundError as PauseCommitmentNotFoundError,
  CommitmentStateConflictError as PauseCommitmentStateConflictError,
  CommitmentStateTransitionError as PauseCommitmentStateTransitionError,
} from '../application/commands/pause-commitment.handler';
import { ResumeCommitmentCommand } from '../application/commands/resume-commitment.command';
import { ResumeCommitmentResult } from '../application/commands/resume-commitment.result';
import {
  CommitmentNotFoundError as ResumeCommitmentNotFoundError,
  CommitmentStateConflictError as ResumeCommitmentStateConflictError,
  CommitmentStateTransitionError as ResumeCommitmentStateTransitionError,
} from '../application/commands/resume-commitment.handler';

const registerSchema = z.object({
  id: z.string().uuid('Invalid commitment id UUID format'),
  identityId: z.string().uuid('Invalid identity id UUID format'),
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
});

const uuidSchema = z.string().uuid('Invalid UUID format');

@ApiTags('Commitments')
@Controller('commitments')
export class CommitmentsController {
  constructor(private readonly commandBus: CommandBus) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new commitment' })
  @ApiResponse({
    status: 200,
    description: 'Commitment registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or domain violation',
  })
  async register(@Body() dto: RegisterCommitmentDto) {
    const parsed = registerSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
    }

    try {
      const command = new RegisterCommitmentCommand(
        dto.id,
        dto.identityId,
        dto.title,
        dto.description,
      );

      const result = (await this.commandBus.execute(
        command,
      )) as unknown as RegisterCommitmentResult;
      return {
        commitmentId: result.commitmentId,
        version: result.version,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Activate ─────────────────────────────────────────────────────────────

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a registered commitment' })
  @ApiParam({ name: 'id', description: 'Commitment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Commitment activated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Commitment not found' })
  @ApiResponse({
    status: 409,
    description: 'Commitment is in a terminal state',
  })
  @ApiResponse({ status: 422, description: 'Invalid state transition' })
  async activate(@Param('id') id: string) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new BadRequestException('Invalid commitment UUID format');
    }

    try {
      const command = new ActivateCommitmentCommand(id);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as ActivateCommitmentResult;
      return {
        commitmentId: result.commitmentId,
        state: result.state,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof CommitmentNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof CommitmentStateConflictError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof CommitmentStateTransitionError) {
        throw new UnprocessableEntityException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Pause ──────────────────────────────────────────────────────────────

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause an active commitment' })
  @ApiParam({ name: 'id', description: 'Commitment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Commitment paused successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format or invalid state transition',
  })
  @ApiResponse({ status: 404, description: 'Commitment not found' })
  async pause(@Param('id') id: string) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestException('Invalid commitment ID');
    }

    try {
      const command = new PauseCommitmentCommand(id);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as PauseCommitmentResult;
      return {
        commitmentId: result.commitmentId,
        state: result.state,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof PauseCommitmentNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof PauseCommitmentStateConflictError ||
        error instanceof PauseCommitmentStateTransitionError
      ) {
        throw new BadRequestException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }

  // ─── Resume ─────────────────────────────────────────────────────────────

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a paused commitment' })
  @ApiParam({ name: 'id', description: 'Commitment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Commitment resumed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Commitment not found' })
  @ApiResponse({
    status: 409,
    description: 'Commitment is in a terminal state',
  })
  @ApiResponse({ status: 422, description: 'Invalid state transition' })
  async resume(@Param('id') id: string) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new BadRequestException('Invalid commitment UUID format');
    }

    try {
      const command = new ResumeCommitmentCommand(id);
      const result = (await this.commandBus.execute(
        command,
      )) as unknown as ResumeCommitmentResult;
      return {
        commitmentId: result.commitmentId,
        state: result.state,
        version: result.version,
      };
    } catch (error: unknown) {
      if (error instanceof ResumeCommitmentNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ResumeCommitmentStateConflictError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof ResumeCommitmentStateTransitionError) {
        throw new UnprocessableEntityException(error.message);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }
}
