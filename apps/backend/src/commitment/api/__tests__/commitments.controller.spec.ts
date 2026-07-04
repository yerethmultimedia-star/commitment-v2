import { Test, TestingModule } from '@nestjs/testing';
import { CommitmentsController } from '../commitments.controller';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommitmentDto } from '../dtos/register-commitment.dto';
import { RegisterCommitmentResult } from '../../application/commands/register-commitment.result';
import { BadRequestException } from '@nestjs/common';

describe('CommitmentsController', () => {
  let controller: CommitmentsController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommitmentsController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<CommitmentsController>(CommitmentsController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should validate inputs, execute command, and return commitment details', async () => {
    const dto: RegisterCommitmentDto = {
      id: '018f6b5c-42e1-7000-8000-999999999999',
      identityId: '018f6b5c-42e1-7000-8000-111111111111',
      title: 'Practice clean architecture',
      description: 'Follow guidelines',
    };

    const expectedResult = new RegisterCommitmentResult(dto.id, 1);
    const executeSpy = jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue(expectedResult);

    const result = await controller.register(dto);
    expect(result).toEqual({
      commitmentId: dto.id,
      version: 1,
    });
    expect(executeSpy).toHaveBeenCalled();
  });

  it('should throw BadRequestException on input validation failure', async () => {
    const dto: RegisterCommitmentDto = {
      id: 'invalid-id',
      identityId: 'invalid-identity-id',
      title: '',
    };

    await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
  });

  it('should map domain handler exceptions into BadRequestExceptions', async () => {
    const dto: RegisterCommitmentDto = {
      id: '018f6b5c-42e1-7000-8000-999999999999',
      identityId: '018f6b5c-42e1-7000-8000-111111111111',
      title: 'Valid Title',
    };

    jest
      .spyOn(commandBus, 'execute')
      .mockRejectedValue(new Error('Domain violation'));

    await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
  });
});
