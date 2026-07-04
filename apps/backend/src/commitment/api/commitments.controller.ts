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
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
  CommitmentStateTransitionError,
} from '../application/commands/activate-commitment.handler';

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
}
