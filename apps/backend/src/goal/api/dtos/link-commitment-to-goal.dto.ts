import { ApiProperty } from '@nestjs/swagger';

export class LinkCommitmentToGoalDto {
  @ApiProperty({ description: 'UUID of the Commitment to link to this Goal' })
  readonly commitmentId!: string;
}
