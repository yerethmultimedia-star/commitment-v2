import { Activity, ActivityType } from '../models/activity';

export interface ActivityDto {
  id: string;
  type: string;
  version: number;
  occurredAt: string;
  actor: string;
  metadata: Record<string, any>;
}

export class ActivityMapper {
  static toDomain(dto: ActivityDto): Activity {
    return {
      id: dto.id,
      type: dto.type as ActivityType,
      version: dto.version,
      occurredAt: new Date(dto.occurredAt),
      actor: dto.actor,
      metadata: dto.metadata || {},
    };
  }
}
