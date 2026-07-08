import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider } from '../application/ports/notification-provider.port';

@Injectable()
export class ConsoleNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(ConsoleNotificationProvider.name);

  public async send(
    reminderId: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(
      `[PUSH NOTIFICATION SIMULATION] Reminder: ${reminderId}`,
      context,
    );
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
