export interface NotificationProvider {
  send(reminderId: string, context: Record<string, unknown>): Promise<void>;
}
