export class NotificationDeviceProjection {
  constructor(
    public readonly identityId: string,
    public readonly pushToken: string,
    public readonly platform: string,
    public updatedAt: Date,
  ) {}
}

export interface NotificationDeviceProjectionRepository {
  save(projection: NotificationDeviceProjection): Promise<void>;
  findByIdentityId(
    identityId: string,
  ): Promise<NotificationDeviceProjection | null>;
}
