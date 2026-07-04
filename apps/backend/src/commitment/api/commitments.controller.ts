import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterCommitmentDto } from './dtos/register-commitment.dto';
import { RegisterCommitmentCommand } from '../application/commands/register-commitment.command';
import { RegisterCommitmentResult } from '../application/commands/register-commitment.result';
import { z } from 'zod';

const registerSchema = z.object({
  id: z.string().uuid('Invalid commitment id UUID format'),
  identityId: z.string().uuid('Invalid identity id UUID format'),
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
});

@ApiTags('Commitments')
@Controller('commitments')
export class CommitmentsController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
