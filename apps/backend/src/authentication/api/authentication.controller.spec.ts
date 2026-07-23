import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationController } from './authentication.controller';
import { RegisterCredentialCommand } from '../application/commands/register-credential.command';
import { LoginCommand } from '../application/commands/login.command';
import { LogoutCommand } from '../application/commands/logout.command';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const mockCommandBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('register: dispatches RegisterCredentialCommand and returns a generated identityId', async () => {
    const executeSpy = jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue(undefined);

    const result = await controller.register({
      loginIdentifier: 'user@example.com',
      secret: 'correct horse battery staple',
    });

    expect(executeSpy).toHaveBeenCalledTimes(1);
    const dispatched = executeSpy.mock.calls[0][0] as RegisterCredentialCommand;
    expect(dispatched).toBeInstanceOf(RegisterCredentialCommand);
    expect(dispatched.loginIdentifier).toBe('user@example.com');
    expect(typeof result.identityId).toBe('string');
    expect(result.identityId.length).toBeGreaterThan(0);
  });

  it('register: rejects a secret shorter than 8 characters before dispatching anything', async () => {
    const executeSpy = jest.spyOn(commandBus, 'execute');

    await expect(
      controller.register({
        loginIdentifier: 'user@example.com',
        secret: 'short',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(executeSpy).not.toHaveBeenCalled();
  });

  it('login: dispatches LoginCommand and returns the issued token', async () => {
    const executeSpy = jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue('a-token');

    const result = await controller.login({
      loginIdentifier: 'user@example.com',
      secret: 'correct horse battery staple',
    });

    expect(result).toEqual({ token: 'a-token' });
    const dispatched = executeSpy.mock.calls[0][0] as LoginCommand;
    expect(dispatched).toBeInstanceOf(LoginCommand);
  });

  it('logout: dispatches LogoutCommand using the sessionId the Guard attached to the request', async () => {
    const executeSpy = jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue(undefined);
    const request = { sessionId: 'session-123' } as Request & {
      sessionId?: string;
    };

    await controller.logout(request);

    const dispatched = executeSpy.mock.calls[0][0] as LogoutCommand;
    expect(dispatched).toBeInstanceOf(LogoutCommand);
    expect(dispatched.sessionId).toBe('session-123');
  });
});
