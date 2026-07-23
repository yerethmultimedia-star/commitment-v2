import { ApiProperty } from '@nestjs/swagger';

export class RegisterCredentialDto {
  @ApiProperty({
    description:
      'Identificador de login (hoy: email) — nombre elegido deliberadamente genérico, ver AR-043 H-043.10',
    example: 'user@example.com',
  })
  readonly loginIdentifier!: string;

  @ApiProperty({
    description:
      'Secreto en texto plano — nunca se persiste así, solo su hash (Argon2)',
    example: 'correct horse battery staple',
  })
  readonly secret!: string;
}
