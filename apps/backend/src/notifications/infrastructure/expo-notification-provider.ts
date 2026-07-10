import { Injectable, Logger } from '@nestjs/common';
import type {
  Expo as ExpoType,
  ExpoPushMessage,
  ExpoPushTicket,
} from 'expo-server-sdk';
import {
  NotificationProvider,
  NotificationMessage,
} from '../application/ports/notification-provider.port';

@Injectable()
export class ExpoNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(ExpoNotificationProvider.name);
  private expoClient: ExpoType | null = null;

  private async getExpo(): Promise<ExpoType> {
    if (!this.expoClient) {
      const { Expo } = await import('expo-server-sdk');
      this.expoClient = new Expo();
    }
    return this.expoClient;
  }

  public async send(notification: NotificationMessage): Promise<void> {
    const { Expo } = await import('expo-server-sdk');
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
      const expo = await this.getExpo();
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
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
