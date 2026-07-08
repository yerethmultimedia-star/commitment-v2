export interface NotificationMessage {
  identityId: string;
  pushToken: string;
  title: string;
  body: string;
  metadata: Record<string, string>;
}

export interface NotificationProvider {
  send(notification: NotificationMessage): Promise<void>;
}
