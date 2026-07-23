import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  readonly loginIdentifier!: string;

  @ApiProperty({ example: 'correct horse battery staple' })
  readonly secret!: string;
}
