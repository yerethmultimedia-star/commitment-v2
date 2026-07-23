import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { RegisterCredentialDto } from './dtos/register-credential.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterCredentialCommand } from '../application/commands/register-credential.command';
import { LoginCommand } from '../application/commands/login.command';
import { LogoutCommand } from '../application/commands/logout.command';
import { SessionAuthGuard } from '../guards/session-auth.guard';

const credentialSchema = z.object({
  loginIdentifier: z.string().min(1, 'loginIdentifier cannot be empty'),
  secret: z.string().min(8, 'secret must be at least 8 characters'),
});

/**
 * AR-043 Fase 4B.4 — exactly the 3 endpoints Paso 5 approved (Register, Login, Logout). No
 * additional endpoints "just in case" (Paso 2/2B already rejected Refresh, MFA, password reset,
 * etc. for lack of a documented requirement — the same discipline applies here).
 */
@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Provision a new credential (AR-043 Paso 2 — not a public self-service sign-up commitment)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Credential registered; identityId returned for the client to persist',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or loginIdentifier already registered',
  })
  public async register(
    @Body() dto: RegisterCredentialDto,
  ): Promise<{ identityId: string }> {
    const parsed = credentialSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
    }

    const credentialId = randomUUID();
    const identityId = randomUUID();

    await this.commandBus.execute(
      new RegisterCredentialCommand(
        credentialId,
        identityId,
        dto.loginIdentifier,
        dto.secret,
      ),
    );

    return { identityId };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive a session token' })
  @ApiResponse({ status: 200, description: 'Login succeeded, token issued' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  public async login(@Body() dto: LoginDto): Promise<{ token: string }> {
    const parsed = credentialSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
    }

    const sessionId = randomUUID();
    const token = await this.commandBus.execute<LoginCommand, string>(
      new LoginCommand(sessionId, dto.loginIdentifier, dto.secret),
    );

    return { token };
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current session' })
  @ApiResponse({ status: 204, description: 'Session revoked (idempotent)' })
  @ApiResponse({ status: 401, description: 'Missing/invalid/expired session' })
  public async logout(
    @Req() request: Request & { sessionId?: string },
  ): Promise<void> {
    if (!request.sessionId) {
      // Defensive only — SessionAuthGuard always sets this before a request reaches here.
      throw new UnauthorizedException();
    }
    await this.commandBus.execute(new LogoutCommand(request.sessionId));
  }
}
