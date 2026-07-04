import { ApiProperty } from '@nestjs/swagger';

export class RegisterCommitmentDto {
  @ApiProperty({
    description:
      'Identificador único del compromiso (UUID generado por el cliente) - Representa CommitmentId',
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
    description: 'Título del compromiso - Representa CommitmentTitle',
    example: 'Learn Domain Driven Design',
  })
  readonly title!: string;

  @ApiProperty({
    description:
      'Descripción detallada (opcional) - Representa CommitmentDescription',
    example: 'Read blue book and write aggregates',
    required: false,
  })
  readonly description?: string;
}
