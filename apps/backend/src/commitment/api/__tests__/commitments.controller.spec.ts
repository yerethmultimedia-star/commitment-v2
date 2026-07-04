import { Test, TestingModule } from '@nestjs/testing';
import { CommitmentsController } from '../commitments.controller';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommitmentDto } from '../dtos/register-commitment.dto';
import { RegisterCommitmentResult } from '../../application/commands/register-commitment.result';
import { ActivateCommitmentResult } from '../../application/commands/activate-commitment.result';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
  CommitmentStateTransitionError,
} from '../../application/commands/activate-commitment.handler';

const VALID_ID = '018f6b5c-42e1-7000-8000-999999999999';
const VALID_IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';

describe('CommitmentsController', () => {
  let controller: CommitmentsController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const mockCommandBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommitmentsController],
      providers: [{ provide: CommandBus, useValue: mockCommandBus }],
    }).compile();

    controller = module.get<CommitmentsController>(CommitmentsController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  // ─── register ───────────────────────────────────────────────────────────

  it('register: should execute command and return commitmentId + version', async () => {
    const dto: RegisterCommitmentDto = {
      id: VALID_ID,
      identityId: VALID_IDENTITY_ID,
      title: 'Practice clean architecture',
    };
    const executeSpy = jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue(new RegisterCommitmentResult(dto.id, 1));

    const result = await controller.register(dto);
    expect(result).toEqual({ commitmentId: dto.id, version: 1 });
    expect(executeSpy).toHaveBeenCalled();
  });

  it('register: should throw BadRequestException on invalid UUID', async () => {
    const dto: RegisterCommitmentDto = {
      id: 'bad-id',
      identityId: VALID_IDENTITY_ID,
      title: 'X',
    };
    await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
  });

  it('register: should map domain errors to BadRequestException', async () => {
    const dto: RegisterCommitmentDto = {
      id: VALID_ID,
      identityId: VALID_IDENTITY_ID,
      title: 'X',
    };
    jest
      .spyOn(commandBus, 'execute')
      .mockRejectedValue(new Error('domain error'));
    await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
  });

  // ─── activate ───────────────────────────────────────────────────────────

  it('activate: should return commitmentId, state, version on success', async () => {
    jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue(new ActivateCommitmentResult(VALID_ID, 'Active', 2));

    const result = await controller.activate(VALID_ID);
    expect(result).toEqual({
      commitmentId: VALID_ID,
      state: 'Active',
      version: 2,
    });
  });

  it('activate: should throw BadRequestException on invalid UUID', async () => {
    await expect(controller.activate('not-a-uuid')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('activate: should throw NotFoundException when commitment not found', async () => {
    jest
      .spyOn(commandBus, 'execute')
      .mockRejectedValue(new CommitmentNotFoundError(VALID_ID));
    await expect(controller.activate(VALID_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('activate: should throw ConflictException on terminal state', async () => {
    jest
      .spyOn(commandBus, 'execute')
      .mockRejectedValue(new CommitmentStateConflictError('cancelled'));
    await expect(controller.activate(VALID_ID)).rejects.toThrow(
      ConflictException,
    );
  });

  it('activate: should throw UnprocessableEntityException on invalid transition', async () => {
    jest
      .spyOn(commandBus, 'execute')
      .mockRejectedValue(new CommitmentStateTransitionError('paused'));
    await expect(controller.activate(VALID_ID)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
