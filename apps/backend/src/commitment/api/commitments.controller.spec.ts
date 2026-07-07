/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CommitmentsController } from './commitments.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PauseCommitmentCommand } from '../application/commands/pause-commitment.command';
import { PauseCommitmentResult } from '../application/commands/pause-commitment.result';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CommitmentNotFoundError as CompleteCommitmentNotFoundError,
  CommitmentStateConflictError as CompleteCommitmentStateConflictError,
  CommitmentStateTransitionError as CompleteCommitmentStateTransitionError,
} from '../application/commands/complete-commitment.handler';
import {
  CommitmentNotFoundError as CancelCommitmentNotFoundError,
  CommitmentStateConflictError as CancelCommitmentStateConflictError,
} from '../application/commands/cancel-commitment.handler';

const VALID_ID = '018f6b5c-42e1-7000-8000-999999999999';

describe('CommitmentsController - pause and resume endpoints', () => {
  let controller: CommitmentsController;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommitmentsController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CommitmentsController>(CommitmentsController);
    commandBus = module.get(CommandBus);
  });

  it('should pause commitment successfully (200)', async () => {
    const PAUSE_ID = '11111111-1111-1111-1111-111111111111';
    const result: PauseCommitmentResult = {
      commitmentId: PAUSE_ID,
      state: 'Paused',
      version: 2,
    };
    commandBus.execute.mockResolvedValue(result);

    const response = await controller.pause(PAUSE_ID);

    // Verify command execution
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const executedCommand = commandBus.execute.mock.calls[0][0];
    expect(executedCommand).toBeInstanceOf(PauseCommitmentCommand);
    expect((executedCommand as PauseCommitmentCommand).commitmentId).toBe(
      PAUSE_ID,
    );

    // Verify HTTP response shape
    expect(response).toEqual({
      commitmentId: result.commitmentId,
      state: result.state,
      version: result.version,
    });
  });

  it('should return 404 when commitment not found', async () => {
    commandBus.execute.mockRejectedValue(
      new PauseCommitmentNotFoundError('not found'),
    );
    await expect(
      controller.pause('11111111-1111-1111-1111-111111111111'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
  });

  it('should return 400 for invalid state transition or conflict', async () => {
    commandBus.execute.mockRejectedValue(
      new PauseCommitmentStateConflictError('conflict'),
    );
    await expect(
      controller.pause('22222222-2222-2222-2222-222222222222'),
    ).rejects.toBeInstanceOf(BadRequestException);
    commandBus.execute.mockRejectedValue(
      new PauseCommitmentStateTransitionError('invalid'),
    );
    await expect(
      controller.pause('33333333-3333-3333-3333-333333333333'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(commandBus.execute).toHaveBeenCalledTimes(2);
  });

  // ─── Resume ─────────────────────────────────────────────────────────────

  describe('resume endpoint', () => {
    it('should resume commitment successfully (200)', async () => {
      const result: ResumeCommitmentResult = {
        commitmentId: VALID_ID,
        state: 'Active',
        version: 3,
      };
      commandBus.execute.mockResolvedValue(result);

      const response = await controller.resume(VALID_ID);

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      const executedCommand = commandBus.execute.mock.calls[0][0];
      expect(executedCommand).toBeInstanceOf(ResumeCommitmentCommand);
      expect((executedCommand as ResumeCommitmentCommand).commitmentId).toBe(
        VALID_ID,
      );

      expect(response).toEqual({
        commitmentId: result.commitmentId,
        state: result.state,
        version: result.version,
      });
    });

    it('should throw BadRequestException on invalid UUID', async () => {
      await expect(controller.resume('not-a-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return 404 when commitment not found', async () => {
      commandBus.execute.mockRejectedValue(
        new ResumeCommitmentNotFoundError('not found'),
      );
      await expect(controller.resume(VALID_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should return 409 on terminal state conflict', async () => {
      commandBus.execute.mockRejectedValue(
        new ResumeCommitmentStateConflictError('conflict'),
      );
      await expect(controller.resume(VALID_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should return 422 on invalid state transition', async () => {
      commandBus.execute.mockRejectedValue(
        new ResumeCommitmentStateTransitionError('invalid'),
      );
      await expect(controller.resume(VALID_ID)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('complete()', () => {
    it('should return 200/201 (success) on valid command', async () => {
      commandBus.execute.mockResolvedValue({
        commitmentId: VALID_ID,
        state: 'Completed',
        version: 3,
      });

      const result = await controller.complete(VALID_ID);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          commitmentId: VALID_ID,
        }),
      );
      expect(result.commitmentId).toBe(VALID_ID);
      expect(result.state).toBe('Completed');
      expect(result.version).toBe(3);
    });

    it('should return 400 on invalid UUID', async () => {
      await expect(controller.complete('not-a-uuid')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('should return 404 when commitment is missing', async () => {
      commandBus.execute.mockRejectedValue(
        new CompleteCommitmentNotFoundError('missing'),
      );
      await expect(controller.complete(VALID_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should return 409 when already completed or cancelled (terminal)', async () => {
      commandBus.execute.mockRejectedValue(
        new CompleteCommitmentStateConflictError('terminal'),
      );
      await expect(controller.complete(VALID_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should return 422 on invalid state transition (e.g. Draft)', async () => {
      commandBus.execute.mockRejectedValue(
        new CompleteCommitmentStateTransitionError('invalid'),
      );
      await expect(controller.complete(VALID_ID)).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel()', () => {
    it('should return 200/201 (success) on valid command', async () => {
      commandBus.execute.mockResolvedValue({
        commitmentId: VALID_ID,
        state: 'Cancelled',
        version: 3,
      });

      const result = await controller.cancel(VALID_ID);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          commitmentId: VALID_ID,
        }),
      );
      expect(result.commitmentId).toBe(VALID_ID);
      expect(result.state).toBe('Cancelled');
      expect(result.version).toBe(3);
    });

    it('should return 400 on invalid UUID', async () => {
      await expect(controller.cancel('not-a-uuid')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('should return 404 when commitment is missing', async () => {
      commandBus.execute.mockRejectedValue(
        new CancelCommitmentNotFoundError('missing'),
      );
      await expect(controller.cancel(VALID_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should return 409 when already completed (conflict)', async () => {
      commandBus.execute.mockRejectedValue(
        new CancelCommitmentStateConflictError('completed'),
      );
      await expect(controller.cancel(VALID_ID)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });
  });
});
