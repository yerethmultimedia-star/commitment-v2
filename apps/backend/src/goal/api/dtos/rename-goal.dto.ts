import { ApiProperty } from '@nestjs/swagger';

export class RenameGoalDto {
  @ApiProperty({ description: 'The new title for the goal' })
  readonly title!: string;
}
