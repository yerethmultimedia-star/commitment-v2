import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import {
  NotificationProvider,
  NotificationMessage,
} from '../application/ports/notification-provider.port';

@Injectable()
export class ExpoNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(ExpoNotificationProvider.name);
  private readonly expo = new Expo();

  public async send(notification: NotificationMessage): Promise<void> {
    if (!Expo.isExpoPushToken(notification.pushToken)) {
      this.logger.error(
        `Push token ${notification.pushToken as string} is not a valid Expo push token`,
      );
      return; // Do not throw, since a bad token should not cause retries of the execution engine
    }

    const messages: ExpoPushMessage[] = [
      {
        to: notification.pushToken,
        title: notification.title,
        body: notification.body,
        data: notification.metadata,
      },
    ];

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: any[] = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      // In a real system we would process tickets to handle errors (DeviceNotRegistered, etc)
      // but for this slice, just sending is enough.
      this.logger.log('Successfully sent notification to Expo.', tickets);
    } catch (error) {
      this.logger.error('Failed to send push notification via Expo', error);
      throw error;
    }
  }
}
