import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationProvider,
  NotificationMessage,
} from '../application/ports/notification-provider.port';

@Injectable()
export class ConsoleNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(ConsoleNotificationProvider.name);

  public async send(notification: NotificationMessage): Promise<void> {
    this.logger.log(
      `[PUSH NOTIFICATION SIMULATION] To: ${notification.pushToken} | Title: ${notification.title}`,
      notification,
    );
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
