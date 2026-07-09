import { ApiPropertyOptional } from '@nestjs/swagger';

export class EditCommitmentDto {
  @ApiPropertyOptional({ description: 'The new title for the commitment' })
  title?: string;

  @ApiPropertyOptional({
    description: 'The new description for the commitment',
  })
  description?: string;

  @ApiPropertyOptional({ description: 'The new recurrence pattern' })
  recurrencePattern?: string;

  @ApiPropertyOptional({ description: 'The new target date' })
  targetDate?: string;
}
