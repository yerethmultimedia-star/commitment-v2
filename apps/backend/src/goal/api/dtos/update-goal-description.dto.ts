import { ApiProperty } from '@nestjs/swagger';

export class UpdateGoalDescriptionDto {
  @ApiProperty({ description: 'The new description for the goal' })
  readonly description!: string;
}
