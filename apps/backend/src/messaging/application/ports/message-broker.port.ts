import { IntegrationMessage } from '@commitment/domain';

export interface MessageBroker {
  publish(message: IntegrationMessage): Promise<void>;
}

export const MESSAGE_BROKER_TOKEN = 'MessageBroker';
