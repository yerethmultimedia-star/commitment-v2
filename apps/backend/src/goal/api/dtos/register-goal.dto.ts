import { ApiProperty } from '@nestjs/swagger';

export class RegisterGoalDto {
  @ApiProperty({
    description:
      'Identificador único del objetivo (UUID generado por el cliente) - Representa GoalId',
    example: '018f6b5c-42e1-7000-8000-999999999999',
  })
  readonly id!: string;

  @ApiProperty({
    description:
      'Identificador único de la identidad propietaria (UUID) - Representa IdentityId',
    example: '018f6b5c-42e1-7000-8000-111111111111',
  })
  readonly identityId!: string;

  @ApiProperty({
    description: 'Título del objetivo - Representa GoalTitle',
    example: 'Run a half marathon',
  })
  readonly title!: string;

  @ApiProperty({
    description:
      'Descripción detallada (opcional) - Representa GoalDescription',
    example: 'Train consistently and finish under 2 hours',
    required: false,
  })
  readonly description?: string;
}
