import { ApiProperty } from '@nestjs/swagger';

export class LinkHabitToGoalDto {
  @ApiProperty({ description: 'Id of the habit to link to this Goal' })
  readonly habitId!: string;
}
